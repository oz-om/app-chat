const route = require("express").Router();
const notifControl = require("../controllers/notif-control");
const connection = require("./connection_init").db_connect

route.post("/openNotif", notifControl.openNotif);
route.post("/makAllRead", notifControl.makAllRead);
route.post("/deleteNotif", notifControl.deleteNotif);

module.exports = route