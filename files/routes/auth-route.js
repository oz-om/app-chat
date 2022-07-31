const route = require("express").Router();
const authControl = require("../controllers/auth.control");
const parser = require("body-parser").urlencoded({ extended: true });
const access = require("../controllers/guard-control");

route.get("/register", access.isUser, authControl.getRegister);
route.post("/register", parser, authControl.register);
route.get("/login", access.isUser, authControl.getLogin);
route.post("/login", parser, authControl.login);
route.all("/logout", access.user, authControl.logout);

module.exports = route;
