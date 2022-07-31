exports.isUser = (req, res, next) => {
  if (req.session.user) {
    res.redirect("/")
  } else {
    next()
  }
}
exports.user = (req, res, next) => {
  if(req.session.user) {
    next()
  } else {
    res.redirect("/login");
  }
}