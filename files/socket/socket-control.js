module.exports = (socket, client) => {
  client.on("sendReq", (data)=> {
    socket.to(data.friendID).emit("receiveReq", {id: data.myID, name: data.myName, fullname:data.myFullname, img: data.myImg, time: data.time})
  });
  client.on("unSend", ids => {
    socket.to(ids.friendID).emit("reqCanceled", ids);
  });
  client.on("reqAccept", (data)=> {
    socket.to(data.friendID).emit("approve", {id: data.myID, name: data.myName, fullname:data.myFullname, img: data.myImg, chatId: data.chatId, time:data.time})
  });
  client.on("reqReject", (id)=> {
    socket.to(id).emit("reject")
  });
  client.on("unfriend", ids => {
    socket.to(ids.friendID).emit("breakFriend", ids);
  });
  client.on("sendMsg", (msg) => {
    socket.to(msg.msg.receiver).emit("receiveMsg", msg);
  });
  //start call
  client.on("reqPeerId", (data) => {
    client.join(data.chatId)
    socket.to(data.friendId).emit("needPeerId",{chatId: data.chatId, myId: data.myID, myImg: data.myImg, myName: data.myName, callType: data.callType});
    
    client.on("disconnect", ()=> {
      socket.to(data.chatId).emit("me-disconnected");
      client.leave(data.chatId);
    });
    client.on("closeCall", ()=> {
      socket.to(data.chatId).emit("me-disconnected");
      client.leave(data.chatId);
    });
  });
  // reject call
  client.on("rejectCall", (data) => {
    socket.to(data.userId).emit("callRejected");
  });
  // answer call
  client.on("sendPeerId", (data) => {
    client.join(data.chatId)
    socket.to(data.chatId).emit("takePeerId", data.myPeerId);
    client.on("disconnect", ()=> {
      socket.to(data.chatId).emit("user-disconnected");
      client.leave(data.chatId);
    });
    client.on("closeCall", () => {
      socket.to(data.chatId).emit("user-disconnected");
      client.leave(data.chatId);
    });
  });
};