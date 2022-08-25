const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  messages: [{
      content: String,
      sender: String,
      receiver: String,
      time: String,
      status: String,
    }],
});

const chatModel = mongoose.model("chat", chatSchema);

exports.Chat = chatModel;

const userModel = require("./user.model").users;

exports.saveChat = chat => {
  return new Promise((resolve, reject)=> {
    userModel.findOne({_id: chat.msg.sender}).select({friends : {$elemMatch : {id : chat.msg.receiver}}}).then(exist => {
      if (exist.friends.length == 1) {
        chatModel.findOneAndUpdate({ _id: chat.chatId }, { $push: { messages: chat.msg} }).then(() => {
          resolve();
        }).catch(err => {
          console.log("can't save msg at chat module")
          reject("can't save msg");
        });
      } else {
        throw new Error("not found")
      }
    }).catch(err => {
      console.log("can't send message")
      reject("can't send message");
    })
  })
}

exports.getMessages = (chatId, myID)=> {
  return new Promise((resolve,reject) => {
    chatModel.findOne({ _id: chatId }).then((chat)=>{
      resolve(chat.messages)
    }).catch(err => {
      reject("err at getMessage msgModel")
    })
  })
} 

exports.getChat = (chatList) => {
  return new Promise(async (resolve, reject) => {
    chatModel.find({_id: {$in : chatList}}, null/*, {sort:{time: -1}}*/)
      .populate("messages.sender", "username fname lname imgProfile","user")
      .populate("messages.receiver", "username fname lname imgProfile","user").then(chats => {
        let messages= [];
        chats.forEach(chat => {
          if (chat.messages.length > 0) {
            let message = {
              chat: chat.messages[chat.messages.length - 1],
              chatId: chat._id,
            };
            messages.push(message);
          }
        });
        resolve(messages)
      }).catch(err => {
        console.log("error ay getChat message model");
        console.log(err)
        reject("error ay getChat message model")
      })
  })
}