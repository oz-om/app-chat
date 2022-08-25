const profileModel = require("../models/profile.model");
const getChat = require("../models/chat-model").getChat;
const getNotif = require("../models/notif_model").getNotif;

exports.home = (req,res) => {
  let id = req.session.user;
  profileModel.getProfile(id).then((arr) => {
    Promise.all([
      getChat(arr[1]),
      getNotif(id)
    ]).then(([chat, notif]) => {
      // for sort message 
        for (let i = 0; i < chat.length -1; i++) {
          let start = i;
          let first = new Date(chat[start].chat.time).getTime();
          let second = new Date(chat[i + 1].chat.time).getTime();
          let copy = chat[i + 1];
          while (start >= 0 &&  first < second) {
            chat[start + 1] = chat[start];
            start = start - 1;
          }
          chat[start + 1] = copy;
        };

        res.render("home", {
          style: "home",
          pageTitle: arr[0].username,
          my: arr[0],
          friReq: arr[0].friReq.reverse(),
          friends: arr[0].friends.reverse(),
          chat: chat,
          notifications: notif.notifications.reverse()
        });
    }).catch(err => {
      console.log(err);
    });
  }).catch(err => {
    console.log("some err during get profile id comgin from home control");
    console.log(err);
  });
};


