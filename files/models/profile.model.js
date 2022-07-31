const usersModel = require("./user.model").users;

exports.getProfile = (id) => {
  return new Promise((resolve, reject) => {
    usersModel.findById(id)
    .populate("friends.fr", "fname lname imgProfile", "user")
    .populate("friReq.fr", "fname lname imgProfile", "user")
    .then((user) => {
        let chats = [];
        for (let i = 0; i < user.friends.length; i++) {
          chats.push(user.friends[i].chatId);
        }
        resolve([user, chats]);
      }).catch((error) => {
        reject(error);
      });
  });
};

exports.getOwner = (id) => {
  return new Promise((resolve, reject) => {
    usersModel.findById(id)
    .populate("friends.fr", "fname lname imgProfile", "user")
    .populate("friReq.fr", "fname lname imgProfile", "user")
      .then((user) => {
        resolve(user);
      })
      .catch((error) => {
        console.log("erro from getOwner in profileModel");
        console.log(error);
        reject(error);
      });
  });
};

const notifModel = require("./notif_model").notif;
exports.sendFriReq = (data) => {
  let text = "sent you a friend request";
  return new Promise((resolve, reject) => {
    Promise.all([
      notifModel.updateOne({ notifOwner: data.friendID }, { $push: { notifications: { id: data.time, from: data.myID, text: text, status: "notOpen" } } }), 
      usersModel.updateOne({ _id: data.friendID }, { $push: { friReq: {fr: data.myID } } }),
      usersModel.updateOne({ _id: data.myID }, { $push: { sendReq: {fr: data.friendID } } })
    ]).then(() => {
      resolve();
    }).catch((err) => {
      reject("err at send req prof model");
      console.log("err at send req prof model");
    });
  });
};

exports.cancelReq = (data) => {
  return new Promise((resolve, reject) => {
    Promise.all([
      usersModel.updateOne({ _id: data.myID }, { $pull: { sendReq: { fr: data.friendID } } }),
      usersModel.updateOne({ _id: data.friendID }, { $pull: { friReq: { fr: data.myID } } })
    ]).then(() => {
      resolve();
    }).catch(() => {
      console.log("err at cancel request");
      reject("err at cancel request");
    });
  });
};

exports.rejectReq = (data) => {
  return new Promise((resolve, reject) => {
    Promise.all([
      usersModel.updateOne({ _id: data.myID }, { $pull: { friReq: { fr: data.friendID } } }),
      usersModel.updateOne({ _id: data.friendID }, { $pull: { sendReq: { fr: data.myID } } })
    ]).then(() => {
      resolve();
    }).catch(() => {
      console.log("err at reject request");
      reject("err at reject request");
    });
  });
};

const Chat = require("./chat-model").Chat;

exports.acceptReq = (data) => {
  let text = "accept your friend request";
  const newChat = new Chat({
    users: [data.myID, data.friendID],
  });
  return new Promise((resolve, reject) => {
    Promise.all([
      newChat.save(),
      notifModel.updateOne({ notifOwner: data.friendID }, { $push: { notifications: { id: data.time, from: data.myID, text: text, status: "notOpen" } } }),
      usersModel.updateOne({ _id: data.myID }, { $push: { friends: {fr: data.friendID, chatId: newChat._id } } }),
      usersModel.updateOne({ _id: data.myID }, { $pull: { friReq: { fr: data.friendID } } }),

      usersModel.updateOne({ _id: data.friendID }, { $push: { friends: {fr: data.myID, chatId: newChat._id } } }),
      usersModel.updateOne({ _id: data.friendID }, { $pull: { sendReq: { fr: data.myID } } }),
    ]).then(() => {
        resolve(newChat._id);
    }).catch((err) => {
      console.log("err at accept");
      reject("err at accept");
    });
  });
};

const msgs = require("./message-model").msgModel;

exports.unfriend = (data) => {
  return new Promise((resolve, reject) => {
    usersModel.findById({ _id: data.myID }).then((me) => {
      
      let idOfChat = me.friends.filter((fri) => {
        return String(fri.fr) === String(data.friendID);
      });
      
      Promise.all([
        Chat.deleteOne({ _id: idOfChat[0].chatId }), 
        msgs.deleteMany({ chatId: idOfChat[0].chatId }),
        usersModel.updateOne({ _id: data.myID }, { $pull: { friends: { fr: data.friendID } } }),
        usersModel.updateOne({ _id: data.friendID }, { $pull: { friends: { fr: data.myID } } })
      ]).then(() => {
        resolve();
      }).catch((err) => {
        console.log("err level_2 at unfriend");
        reject("something went wrong!");
      });
    }).catch((err) => {
      console.log("err level_1 at unfriend");
      reject("something went wrong!");
    });
  });
};

const fs = require("fs");
const path = require("path");
exports.updateImg = (recent, news, id) => {
  let back = null;
  let ava = null;
  if (news.back) {
    back = "/uploads/" + news.back[0].filename;
  }
  if (news.ava) {
    ava = "/uploads/" + news.ava[0].filename;
  }
  return new Promise((resolve, reject) => {
    if (back && ava) {
      let recentest = [recent.recentBack, recent.recentAva];
      usersModel.updateMany({ _id: id }, { $set: { imgProfile: ava, back_wallpaper: back } 
      }).then(() => {
        recentest.map((rec) => {
          fs.unlink(path.join(__dirname, "../static/uploads/") + rec, (err)=> {
            resolve()
          });
        });
      }).catch((err) => {
        reject("can't complete this operation")
        console.log(err);
      });
    } else if (back) {
      usersModel.updateOne({ _id: id }, { $set: { back_wallpaper: back } }).then(()=> {
        fs.unlink(path.join(__dirname, "../static/uploads/") + recent.recentBack, (err) => {
          resolve()
        });
      }).catch((err) => {
        reject("can't complete this operation")
        console.log(err)
      });
    } else if (ava) {
      usersModel.updateOne({ _id: id }, { $set: { imgProfile: ava } }).then(() => {
        fs.unlink(path.join(__dirname, "../static/uploads/") + recent.recentAva, (err) => {
          resolve();
        });
      }).catch((err) => {
        reject("can't complete this operation")
        console.log(err);
      });
    }
  })
  
};
