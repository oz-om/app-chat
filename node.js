// setup connection to db
const mongoose = require("mongoose");
const express = require("express");
const app = express();
app.use(express.json());

// for dev
// const fs = require("fs")
// const https = require("https");
// const opt = {
//   key: fs.readFileSync("cert/key.pem"),
//   cert: fs.readFileSync("cert/cert.pem"),
// };
// const server = https.createServer(opt, app);

// for production
const http = require("http");
const server = http.createServer(app);

const socketIo = require("socket.io");
const socket = socketIo(server);
socket.on("connection", (client) => {
  require("./files/socket/notif-room")(client);
  require("./files/socket/socket-control")(socket, client);
});


const session = require("express-session");
const servSession = require("connect-mongodb-session")(session);
const initSession = new servSession({
  uri: require("./files/models/db_url"),
  collection: "sessions",
});
app.use(session({
  secret: "keyWord For Crypt",
  saveUninitialized: false,
  store: initSession,
  resave: false
}));


app.set("view engine", "ejs");
app.set("views", "files/pages");

const path = require("path");
app.use(express.static(path.join(__dirname, "files","static")));

let authRoute = require("./files/routes/auth-route");
let homeRout = require("./files/routes/home.route");
let profRoute = require("./files/routes/profile-route");
let chatRoute = require("./files/routes/chat-route");
let notifRoute = require("./files/routes/notif-route");


mongoose.connect(require("./files/models/db_url")).then(() => {
  app.use("", authRoute);
  app.use("", homeRout);
  app.use("/profile", profRoute);
  app.use("", chatRoute);
  app.use("", notifRoute);
});

let port = process.env.PORT || 4011;
server.listen(port, () => {
  console.log("running at port " + port);
});
