const profileModel = require("../models/profile.model");
const notifModel = require("../models/notif_model");

exports.getProfile = (req,res)=> {
  let id = req.params.id;
  if (id === req.session.user) {
    res.redirect("/profile")
  }
  Promise.all([
    profileModel.getProfile(id),
    profileModel.getOwner(req.session.user),
    notifModel.getNotif(req.session.user),
  ]).then(([user, my, notif]) => {
    let me =
      user[0].friends.find((fri) => fri.id === req.session.user) || undefined;
    let chatId = undefined;
    if (me) {
      chatId = me.chatId;
    }
    
    res.render("profile", {
      pageTitle: user[0].username,
      style: "profile",
      my,
      notifications: notif.notifications.reverse(),
      session: user[0]._id,
      user: user[0],
      chatId: chatId,
      isFriend: user[0].friends.find((friend) => String(friend.fr._id) === req.session.user),
      reqSent: user[0].friReq.find((friend) => String(friend.fr._id) === req.session.user),
      reqReceived: user[0].sendReq.find((friend) => String(friend.fr._id) === req.session.user),
      url: req.headers.host,
    });
  });
}

exports.getOwner = (req,res) => {
  Promise.all([
    profileModel.getOwner(req.session.user),
    notifModel.getNotif(req.session.user),
  ]).then(([my, notif]) => {
    res.render("profile", {
      pageTitle: my.username,
      style: "profile",
      session: req.session.user,
      my,
      user: my,
      friends: my.friends.reverse(),
      friReq: my.friReq.reverse(),
      notifications: notif.notifications.reverse(),
      url: req.headers.host,
    });
  }).catch(err =>{
    console.log("there some erro whene grtOwner")
  });
}

exports.sendReq = (req, res) => {
  profileModel.sendFriReq(req.body).then(() => {
    res.json({ res: true });
  }).catch(err => {
    res.json({res: false, err})
  });
};

exports.cancel = (req, res) => {
  profileModel.cancelReq(req.body).then(() => {
    res.json({ res: true });
  }).catch(err => {
    res.json({res: false, err})
  });
}

exports.reject = (req, res) => {
  profileModel.rejectReq(req.body).then(() => {
    res.json({ res: true });
  }).catch(err => {
    res.json({res: false, err})
  });
}

exports.accept = (req, res) => {
  profileModel.acceptReq(req.body).then((chatId) => {
    res.json({ res: true, chatId });
  }).catch(err => {
    res.json({res: false, err})
  });
}

exports.unfriend = (req, res) => {
  profileModel.unfriend(req.body).then(() => {
    res.json({ res: true });
  }).catch(err => {
    res.json({res: false, err})
  });
}

const chatModel = require("../models/chat-model");
exports.getChat = (req, res)=> {
  chatModel.getMessages(req.body.chatId, req.body.myId).then((messages) => {
    res.json({ res: true, messages });
  }).catch(err => {
    res.json({res:false, err})
  });
}

exports.sendMsg = (req, res) => {
  chatModel.saveChat(req.body).then(() => {
    res.json({ res: true });
  }).catch((err) => {
    res.json({ res: false, err: err });
  });
};

exports.updateImg = (req, res) => {
  profileModel.updateImg(req.body, req.files, req.session.user).then(()=> {
    res.json({ res: true });
  }).catch(err => {
    res.json({res: false, err})
  })
}
