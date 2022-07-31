const notifModel = require("../models/notif_model")

exports.openNotif = (req, res) => {
  notifModel.openNotif(req.session.user, req.body.id);
}

exports.makAllRead = (req, res)=> {
  notifModel.makAllRead(req.session.user).then(()=> {
    res.json({res:true})
  }).catch(err => {
    res.json({ res: false, err: err });
  })
}

exports.deleteNotif = (req, res) => {
  notifModel.deleteNotif(req.session.user, req.body.id).then(()=> {
    res.json({res:true})
  }).catch(err => {
    res.json({res: false, err: err})
  });
}