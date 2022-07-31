const mongoose = require("mongoose");

let Schema = mongoose.Schema({
  fname: String,
  lname: String,
  username: String,
  email: String,
  pass: String,
  imgProfile: {
    type: String,
    default: "https://b.top4top.io/p_228132o6h1.png",
  },
  back_wallpaper: {
    type: String,
    default: "https://d.top4top.io/p_23524b6x11.jpg",
  },
  friends: {
    type: [{ fr: { type: mongoose.Schema.Types.ObjectId }, chatId: String }],
    default: [],
  },
  friReq: {
    type: [{ fr: { type: mongoose.Schema.Types.ObjectId } }],
    default: [],
  },
  sendReq: {
    type: [{ fr: { type: mongoose.Schema.Types.ObjectId } }],
    default: [],
  },
});

const users = mongoose.model("user", Schema);

exports.users = users