const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "chat" },
  content: String,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  time: String,
  status: String,
});

const messageModel = mongoose.model("message", messageSchema);

exports.msgModel = messageModel;

const userModel = require("./user.model").users;

exports.saveChat = msg => {
  return new Promise((resolve, reject)=> {
    userModel.findOne({_id: msg.sender}).select({friends : {$elemMatch : {id : msg.receiver}}}).then(exist => {
      if (exist.friends.length == 1) {
        let newMsg = new messageModel(msg);
        newMsg.save();
        resolve()
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
    messageModel.find({ chatId: chatId }, null, { sort: { time: 1 } }).then((message)=>{
      if (String(message[message.length - 1].sender) == myID) {
        resolve(message);
      } else {
        messageModel.updateMany({ chatId: chatId }, {status :"read"}, {multi:true}).then(()=>{
          message.map(msg => {
            msg.status = "read"
          });
          resolve(message);
        }).catch(err => {
          reject("err at update messages getMessage msgModel")
        });
      }
    }).catch(err => {
      reject("err at getMessage msgModel")
    })
  })
} 

exports.getChat = (chatList) => {
  return new Promise(async (resolve, reject) => {
    messageModel.find({chatId: {$in : chatList}}, null, {sort:{time: -1}})
      .populate("sender", "username fname lname imgProfile","user")
      .populate("receiver", "username fname lname imgProfile","user").then(chats => {
        
        let msgs = [];
        let unreadCount = 0;
        for (let i = 0; i < chatList.length; i++) {
          let arr = chats.filter((msg) => {
            if (String(msg.chatId) == chatList[i]) {
              if (msg.status == "unread") {
                unreadCount++
              }
              return msg;
            }
          });
          if (arr.length > 1) {
            let lastMsg = arr.reduce((one, two) => {
              return new Date(one.time).getTime() <
                new Date(two.time).getTime()
                ? two
                : one;
            });
            
            lastMsg.status = `${lastMsg.status}_${unreadCount}`;
            msgs.push(lastMsg);
          } else {
            if (arr[0]) {
              arr[0].status = `${arr[0].status}_${unreadCount}`;
            }
            msgs.push(arr[0]);
          }
        }
        resolve(msgs);
      }).catch(err => {
        console.log("error ay getChat message model");
        console.log(err)
        reject("error ay getChat message model")
      })
  })
}
