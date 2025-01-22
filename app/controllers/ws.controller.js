const WebSocket = require("ws");
const url = require("url");
var jwt = require("jsonwebtoken");
require("dotenv").config();
const config = require("../config/auth.config");
const db = require("../models");

//chat message table
const ChatMessage = db.chat_message;

// Store active connections
const clients = new Map();

function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ server, path: "/chat" });

  // Handle WebSocket connection
  wss.on("connection", (ws, req) => {
    const parameters = url.parse(req.url, true).query;
    const userId = parameters.userId;
    const userType = parameters.userType;

    // Store client connection
    clients.set(userId, { ws, userType });

    // Send initial connection status
    broadcastUserStatus(userId, true);

    // Handle incoming messages
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data);
        handleMessage(userId, message);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    // Handle client disconnection
    ws.on("close", () => {
      clients.delete(userId);
      broadcastUserStatus(userId, false);
    });

    // Handle errors
    ws.on("error", (error) => {
      console.error(`WebSocket error for user ${userId}:`, error);
    });
  });

  // Periodically clean up broken connections
  setInterval(() => {
    clients.forEach((client, userId) => {
      if (client.ws.readyState === WebSocket.CLOSED) {
        clients.delete(userId);
        broadcastUserStatus(userId, false);
      }
    });
  }, 30000);
}

// Handle different types of messages
async function handleMessage(senderId, message) {
  switch (message.type) {
    case "message":
      const enhancedMessage = {
        ...message,
        message: {
          ...message.message,
          id: message.message.id || Date.now().toString(),
          timestamp: message.message.timestamp || new Date().toISOString(),
        },
      };

      // Check if the receiver is online
      const receiverId = message.message.receiver.toString();
      const receiverClient = clients.get(receiverId);

      // Set is_read based on whether the receiver is the current receiver
      let isRead = receiverId === senderId || (receiverClient ? true : false);

      try {
        await ChatMessage.create({
          message_id: enhancedMessage?.message?.id,
          sender_id: enhancedMessage?.message?.sender,
          receiver_id: enhancedMessage?.message?.receiver, // Handle optional receiver
          message: enhancedMessage?.message?.text, // Default to empty string if undefined
          timestamp: enhancedMessage?.message?.timestamp,
          is_read: isRead,
        });
      } catch (error) {
        console.error("Error creating chat message:", error);
        // Optionally, you can handle the error further (e.g., sending a response back to the client)
      }

      broadcastMessage(senderId, enhancedMessage);
      break;

    case "typing":
      broadcastTypingStatus(senderId, message);
      break;

    default:
      console.log("Unknown message type:", message.type);
  }
}

// // Send message to a specific user
// function sendMessageToUser(receiver, message) {
//     const targetClient = clients.get(receiver);
//     if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
//       targetClient.ws.send(JSON.stringify(message));
//     } else {
//       console.error(`User ${receiver} not found or not connected.`);
//     }
// }

// Broadcast message to relevant users
function broadcastMessage(senderId, message) {
  const sender = clients.get(senderId);
  if (!sender) return;

  clients.forEach((client, userId) => {
    if (userId !== senderId && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error sending message to user ${userId}:`, error);
        clients.delete(userId); // Remove client if there's an error
      }
    }
  });
}

// // Broadcast typing status to a specific user
// function sendTypingStatusToUser(receiver, senderId, isTyping) {
//     const targetClient = clients.get(receiver.toString());
//     if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
//       targetClient.ws.send(JSON.stringify({
//         type: 'typing',
//         isTyping: isTyping,
//         userId: senderId
//       }));
//     } else {
//       console.error(`User ${receiver} not found or not connected.`);
//     }
// }

// Broadcast typing status
function broadcastTypingStatus(senderId, status) {
  clients.forEach((client, userId) => {
    if (userId !== senderId && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(
          JSON.stringify({
            type: "typing",
            isTyping: status.isTyping,
            senderId: senderId,
            receiverId: status?.receiverId,
          })
        );
      } catch (error) {
        console.error(`Error sending typing status to user ${userId}:`, error);
        clients.delete(userId); // Remove client if there's an error
      }
    }
  });
}

// Broadcast user online/offline status
function broadcastUserStatus(userId, isOnline) {
  const statusMessage = {
    type: isOnline ? "online" : "offline",
    userId: userId,
  };

  clients.forEach((client, clientId) => {
    if (clientId !== userId && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(statusMessage));
      } catch (error) {
        console.error(`Error sending status to user ${clientId}:`, error);
        clients.delete(clientId); // Remove client if there's an error
      }
    }
  });
}

module.exports = { setupWebSocketServer };
