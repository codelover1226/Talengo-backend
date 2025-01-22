const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const http = require("http").createServer(app);

const db = require("./app/models");
const { setupWebSocketServer } = require("./app/controllers/ws.controller");

var corsOptions = {
  origin: ["http://localhost:3000", "https://talengo-jobs.com"],
};

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "10mb" }));
app.use(cors(corsOptions));
app.use(express.static("./uploads"));

require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

//Set up Websocket
setupWebSocketServer(http);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and Resync Db");
// });
