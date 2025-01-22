module.exports = (sequelize, Sequelize) => {
    const ChatMessage = sequelize.define("chat_messages", {  
        id: {
            autoIncrement: true,
            type: Sequelize.INTEGER,
            primaryKey: true,        
        }, 
        message_id: {            
            type: Sequelize.STRING
        },
        sender_id: {
            type: Sequelize.INTEGER
        },
        receiver_id: {
            type: Sequelize.INTEGER
        },
        message: {
            type: Sequelize.TEXT
        },                      
        timestamp: {
            type:Sequelize.STRING
        },
        is_read: {
            type:Sequelize.BOOLEAN
        }
    });
    return ChatMessage;
};