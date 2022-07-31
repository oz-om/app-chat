let mongoose = require("mongoose");

let notifSchema = mongoose.Schema({
  notifOwner: String,
  notifications: {
    type: [{ id: Number, from: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, text: String, status: String}],
    default: []}
});

let notifModel = mongoose.model("notification", notifSchema);

module.exports.notif = notifModel;

exports.getNotif = async (ownerId) => {
  try {
    let notifications = await notifModel.findOne({ notifOwner: ownerId })
      .populate("notifications.from","fname lname imgProfile","user");
    return notifications;
 } catch (error) {
    console.log("erro from getNotif from notiModel")
    throw new Error(error)
  }
}

exports.openNotif = async (ownerId, notifID) => {
  await notifModel.updateOne({notifOwner:ownerId,notifications:{$elemMatch:{id:notifID}}},{$set:{"notifications.$.status":"opened"}});
  return;
}

exports.makAllRead = (ownerId) => {
  return new Promise((resolve, reject) => {
    notifModel.findOne({ notifOwner: ownerId }).then((notif) => {
      notif.notifications.map((notif) => {
        notif.status = "opened";
      });
      resolve(notif.save());
    }).catch(()=> {
      reject("something went wrong, try again later");
    })
  });
}

exports.deleteNotif = (ownerId, notifID) => {
  return new Promise((resolve, reject) => {
    notifModel.findOneAndUpdate({ notifOwner: ownerId },{ $pull: { notifications: { id: notifID } } }).then(()=> {
      resolve()
    }).catch(err => {
      reject("error on delete")
    });
  })
}