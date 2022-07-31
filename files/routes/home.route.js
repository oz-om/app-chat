const route = require("express").Router();
const homeRout = require("../controllers/home-control");
const access = require("../controllers/guard-control").user;
let connection = require("./connection_init").db_connect

route.get("/", access ,homeRout.home),


module.exports = route