const authModel = require("../models/auth.model");

exports.getRegister = (req, res, next) => {
  res.render("register", {
    pageTitle: "register",
    style: "register",
    error: false,
    errorMsg: ''
  });
};

exports.register = (req, res) => {
  const data = {
    fname: req.body.fname,
    lname: req.body.lname,
    username: req.body.username,
    email: req.body.email,
    pass: req.body.password,
  };
  authModel.register(data).then(() => {
    res.redirect("/login")
  }).catch(err => {
    res.render("register", {
      pageTitle: "register",
      style: "register",
      error: true,
      errorMsg: err
    })
  });
};

exports.getLogin = (req, res) => {
  res.render("login", {
    pageTitle: "login",
    style: "login",
    error: false,
    errorMsg: ""
  });
};

exports.login = (req,res)=>{
  authModel.login(req.body.email, req.body.password).then((user_id)=>{
    req.session.user = String(user_id);
    res.redirect("/")
  }).catch(err => {
    res.render("login", {
      pageTitle: "login",
      style: "login",
      error: true,
      errorMsg: err
    })
  })
}

exports.logout = (req, res) => {
  req.session.destroy(()=> {
    res.redirect("/login");
  })
}