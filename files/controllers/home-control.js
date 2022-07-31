const profileModel = require("../models/profile.model");
const getChat = require("../models/message-model").getChat;
const getNotif = require("../models/notif_model").getNotif;

exports.home = (req,res) => {
  let id = req.session.user;
  profileModel.getProfile(id).then((arr) => {
    Promise.all([
      getChat(arr[1]),
      getNotif(id)
    ]).then(([chat, notif]) => {
        let filterChat = chat.filter((ch) => {
          if (ch) {
            return ch;
          }
        });
        let Box;
        for (let i = 0; i < filterChat.length; i++) {
          for (let n = 0; n < filterChat.length - 1; n++) {
            if (
              new Date(filterChat[n].time).getTime() >
              new Date(filterChat[n + 1].time).getTime()
            ) {
              Box = filterChat[n];
              filterChat[n] = filterChat[n + 1];
              filterChat[n + 1] = Box;
            };
          };
        };

        res.render("home", {
          style: "home",
          pageTitle: arr[0].username,
          my: arr[0],
          friReq: arr[0].friReq.reverse(),
          friends: arr[0].friends.reverse(),
          chat: filterChat.reverse(),
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


