const Route = require("express").Router();
const profileControl = require("../controllers/profile-control");
const connection = require("./connection_init").db_connect

Route.post("/getMsg", profileControl.getChat);
Route.post("/sendMsg", profileControl.sendMsg);

module.exports = Route