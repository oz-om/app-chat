const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
  users : [{type: mongoose.Schema.Types.ObjectId, ref: "user"}]
});

const chatModel = mongoose.model("chat", chatSchema);

exports.Chat = chatModel;

