// chose friend to send msg on mobile
let messagesContainer = document.querySelector(".messages");
let listOfFriend = document.querySelector(".main > .content");
function newConversation(ele) {
  messagesContainer.classList.toggle("v_mob_state");
  listOfFriend.classList.toggle("v_mob_state");
  listOfFriend.querySelector(".controllers").classList.toggle("v_mob_state");
}

function showMsgOpt(ele) {
  document.querySelectorAll(".friend .options .opt").forEach((opt) => {
    if (opt.previousElementSibling == ele) {
      ele.nextElementSibling.classList.toggle("open");
    } else {
      opt.classList.remove("open");
    }
  });
}

let myData = {
  myId: document.querySelector(".bottomMenu .partTwo h4 a").id,
  myfullname: document.querySelector(".bottomMenu .partTwo h4 a").dataset.fullname,
  myName: document.querySelector(".bottomMenu .partTwo h4 a").textContent,
  myImg: document.querySelector(".bottomMenu .partTwo img").src,
};

// open chat
let chatContainer = document.querySelector(".messages .chatContainer .chat");
let defaultView = document.querySelector(".messages .chatContainer .defaultView");
let messagedFriend = document.querySelectorAll(".messages .mesContainer .mes .friend");
// create last received msg
function creatChat(ele, sender, myId, content, msgTime) {
  let msg = document.createElement("div");
  msg.className = String(sender) === String(myId) ? "msg msgRight" : "msg msgLeft";
  let p = document.createElement("p");
  p.className = "msgContent";
  p.textContent = content;
  let span = document.createElement("span");
  span.className = "time";
  span.textContent = msgTime;
  msg.append(p, span);
  ele.append(msg);
  msg.scrollIntoView();
}
// end received msg

let ID = document.querySelector(".bottomMenu .control .partTwo h4 a").id;
let chatContent = document.querySelector(".chatContent");
// get messages
function getMsg(ele) {
  chatContainer.classList.add("open");
  defaultView.style.display = "none";
  
  document.querySelectorAll(".mesContainer .mes .friend").forEach(fri => {
    fri.classList.remove("active")
  });
  ele.parentElement.classList.add("active");
  if (ele.parentElement.querySelector(".count")) {
    ele.parentElement.querySelector(".count").remove()
  }
  ele.parentElement.classList.remove("unread");

  let name = ele.parentElement.querySelector(".info .contact h3") ;
  let receiver = document.querySelector(".receiver .details .name h4");
  if (receiver.id != name.id) {
    chatContent.innerHTML = "";
  }
  document.querySelector(".receiver .details .img img").src = ele.parentElement.querySelector(".img-container img").src;
  receiver.textContent = name.textContent;
  receiver.id = name.id;
  receiver.setAttribute("data-chatId", ele.parentElement.id);

  let request;
  async function readMsg() {
    if (request) {
      request.abort();
      request = null
    }
    request = new AbortController();
    const {signal} = request;
    let req = await fetch("/getMsg", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ chatId: ele.parentElement.id, myId: ID }),
      signal: signal,
    });
    request = null;
    let res = await req.json();
    if (res.res) {
      chatContent.innerHTML = "";
      for (const chat of res.chat) {
        creatChat(chatContent, chat.sender,ID,chat.content, `${new Date(chat.time).getHours()}:${new Date(chat.time).getMinutes()}`)
      }
    }
  }
  readMsg();

  sessionStorage.setItem("opend", JSON.stringify({
    id: ele.parentElement.id
  }));
}
// end get messages

// get sessionStorage
window.onload =  function () {
  let opend = JSON.parse(sessionStorage.getItem("opend"));
  if (opend) {
    document.querySelectorAll(".mesContainer .mes .friend").forEach(async (fri) => {
      if (fri.id == opend.id) {
        fri.classList.add("active");
        fri.classList.remove("unread");
        chatContainer.classList.add("open");
        defaultView.style.display = "none";
        chatContent.innerHTML = "";
        let opt = {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({ chatId: opend.id, myId: ID }),
        };
        let req = await fetch("/getMsg", opt);
        let res = await req.json();

        document.querySelector(".receiver .details .img img").src = fri.querySelector(".img-container img").src;
        let name = fri.querySelector(".info .contact h3") ;
        document.querySelector(".receiver .details .name h4").textContent = name.textContent;
        document.querySelector(".receiver .details .name h4").id = name.id;
        document.querySelector(".receiver .details .name h4").setAttribute("data-chatId",fri.id)
        
        if (res.res) {
          for (const chat of res.chat) {
            creatChat(chatContent, chat.sender,ID,chat.content, `${new Date(chat.time).getHours()}:${new Date(chat.time).getMinutes()}`)
          }
        }
      }
    });
  }

}
// end session storage

// start send msg 
async function sendMsg(ele) {
  let receiver = document.querySelector(".receiver .name h4");
  let msg = {
    myID: myData.myId,
    myName: myData.myName,
    myImg: myData.myImg,
    myfullname: myData.myfullname,
    msg: {
      chatId: receiver.dataset.chatid,
      content: ele.previousElementSibling.value,
      sender: myData.myId,
      receiver: receiver.id,
      time: new Date(),
      status: "unread",
    },
  };
  let opt = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(msg),
  };
  let req = await fetch("/sendMsg", opt);
  let res = await req.json();
  if (res.res) {
    ele.previousElementSibling.value='';
    creatChat(chatContent,ID,ID,msg.msg.content,`${new Date(msg.msg.time).getHours()}:${new Date(msg.msg.time).getMinutes()}`);
    server.emit("sendMsg", msg);
    console.log("send msg success")
    recentMsg(msg.msg.content, msg.msg.receiver, msg.msg.sender, null);
  } else {
    showError(res)
  }
  sessionStorage.setItem("opend", JSON.stringify({
    id: msg.msg.chatId
  }));
}
// end send msg bloc

function sendMsgFromFriendList(ele) {
  newConversation();
  let friend = ele.parentElement;
  let exist = false
  document.querySelectorAll(".mesContainer .mes .friend").forEach((fri) => {
    fri.classList.remove("active");
    let count = 2;
    if (fri.querySelector(".info .contact h3").id == friend.id) {
      exist = true;
      getMsg(fri.querySelector(".info"));
    } else {
      fri.classList.remove("active");
      fri.style.order = count;
      count++;
    }
  });
  if (exist == false) {
    recentSender(friend.dataset.chatid, friend.id, friend.dataset.fullname, friend.dataset.img, "", "active", "");

    document.querySelector(".receiver .details .img img").src = friend.dataset.img;
    let receiver = document.querySelector(".receiver .details .name h4");
    receiver.textContent = friend.dataset.name;
    receiver.id = friend.id;
    receiver.setAttribute("data-chatId", friend.dataset.chatid);

    chatContainer.classList.add("open");
    defaultView.style.display = "none";

    chatContent.innerHTML = "";
  }
}

// receiver msg
server.on("receiveMsg", (msg)=> {
  console.log("receiver success")
  if (document.querySelector(".receiver .details .name h4").id == msg.msg.sender) {
    creatChat(chatContent,msg.msg.sender,msg.msg.receiver,msg.msg.content,`${new Date(msg.msg.time).getHours()}:${new Date(msg.msg.time).getMinutes()}`);
    recentMsg(msg.msg.content, msg.msg.sender, msg.msg.receiver, null);
    console.log("receiver success 1");
  } else if(document.getElementById(msg.msg.chatId)) {
    recentMsg(msg.msg.content, msg.msg.sender, "", "unread");
    console.log("receiver success 2");
  } else {
    console.log("receiver success 3");
    document.querySelectorAll(".mesContainer .mes .friend").forEach(fri => {
      let count = 2;
      fri.style.order = count;
      count++
    })
    recentSender(msg.msg.chatId, msg.myID, msg.myfullname, msg.myImg, msg.msg.content, "unread", 1)
  }
});
// end receive msg

// show recent msg
function recentMsg(msg, receiver, sender, style) {
  let counter = 2;
  document.querySelectorAll(".mesContainer .mes .friend").forEach((fri) => {
    if (fri.querySelector(".info .contact h3").id == receiver) {
      fri.style.order = "1";
      fri.classList.add(style);

      if (sender === ID) {
        fri.querySelector(".info .contact span").innerHTML = `<small>you:</small> ${msg}`;
      } else {
        let count = fri.querySelector(".info .contact span .count");
        if (count) {
          let unreadCount = +count.textContent+1
          fri.querySelector(".info .contact span").innerHTML = `${msg} <span class="count">${unreadCount}</span>`;
        } else {
          fri.querySelector(".info .contact span").innerHTML = `${msg} <span class="count">${1}</span>`;
        }
      }

    } else {
      fri.style.order = counter;
      counter++;
    }
  });
}

// recent create sender
function recentSender(chatId, friendId, friFullName, friImg, msgContent, stat, msgCount) {
  let friend = document.createElement("div");
  friend.style.order = "1";
  friend.className = `friend ${stat}`;
  friend.id = chatId;
  let imgContainer = document.createElement("div");
  imgContainer.className = "img-container";
  imgContainer.setAttribute("onclick", "getMsg(this)");
  let img = document.createElement("img");
  img.src = friImg;
  imgContainer.append(img);
  let info = document.createElement("div");
  info.className = "info";
  info.setAttribute("onclick", "getMsg(this)");
  let contact = document.createElement("contact");
  contact.className = "contact";
  let h3 = document.createElement("h3");
  h3.id = friendId;
  h3.textContent = friFullName;
  let span = document.createElement("span");
  span.className = "lastMsg";
  let count = document.createElement("span");
  count.className = "count";
  count.textContent = msgCount;
  span.append(msgContent, count);
  contact.append(h3, span);
  info.append(contact);
  let options = document.createElement("div");
  options.className = "options";
  let icons = document.createElement("i");
  icons.className = "bx bx-dots-vertical-rounded bx-rotate-180";
  icons.setAttribute("onclick", "showMsgOpt(this)");
  let opt = document.createElement("div");
  opt.className = "opt";
  let unfollow = document.createElement("span");
  unfollow.textContent = "unfollow";
  let remove = document.createElement("span");
  remove.textContent = "remove";
  opt.append(unfollow, remove);
  options.append(icons, opt);
  friend.append(imgContainer, info, options);
  document.querySelector(".mesContainer .mes").prepend(friend);
}
// end recent sender

// functions inside chat 
let closChat = document.querySelector(".messages .closeMsg");
closChat.onclick = ()=> {
  chatContainer.classList.remove("open");
  document.querySelectorAll(".mesContainer .mes .friend").forEach(fri => {
    fri.classList.remove("active");
  });
  if (sessionStorage.getItem("opend")) {
    sessionStorage.removeItem("opend")
  }
}
let chatOptions = document.querySelector(".receiver .options .opt > i");
chatOptions.onclick = function() {
  chatOptions.nextElementSibling.classList.toggle("open")
}

// toggle between req and friend list
let friendOpt = document.querySelectorAll(".content .controllers h4");
friendOpt.forEach((getFriendOpt) => {
  getFriendOpt.addEventListener("click", (e) => {
    e.stopPropagation();
    friendOpt.forEach((fr) => {
      fr.classList.remove("active");
      fr.classList.remove("reqActive");
    });
    getFriendOpt.classList.add("active");
    getFriendOpt.classList.add("reqActive");

    if (getFriendOpt.className.split(" ")[0] == "req") {
      document.querySelector(".content .friends .reqFri").classList.remove("hide");
      document.querySelector(".content .friends .reqFri").classList.add("reqListActive");
      document.querySelector(".content .friends .friendList").classList.add("hide");
    } else {
      document.querySelector(".content .friends .reqFri").classList.add("hide");
      document.querySelector(".content .friends .reqFri").classList.remove("reqListActive");
      document.querySelector(".content .friends .friendList").classList.remove("hide");
    }
  });
});

// show other options on friend list
let friendListOptions = document.querySelectorAll(".friendList .options option");
friendListOptions.forEach(opt => {
  opt.addEventListener("click", (e) => {
    Array.from(friendListOptions).filter(opt => {
      opt == e.target ? "" : opt.nextElementSibling.classList.remove("showOpt");
    });
    opt.nextElementSibling.classList.toggle("showOpt");
  });
});

function optOnFriendList(ele) {
  document.querySelectorAll(".friendList .options .option").forEach(opt => {
    if (opt.previousElementSibling == ele) {
      ele.nextElementSibling.classList.toggle("showOpt");
    } else {
      opt.classList.remove("showOpt");
    }
  })
}

async function accept(ele) {
  let copy = ele.firstChild;
  ele.textContent = ""
  loading(ele,"#fff");
  let data = {
    friendID: ele.dataset.id,
    friendName: ele.dataset.name,
    friendImg: ele.dataset.img,
    FriendFullname: ele.dataset.fullname,
    myFullname: myData.myfullname,
    myID: ID,
    myName: document.querySelector(".bottomMenu .control .partTwo h4 a").textContent,
    myImg: document.querySelector(".bottomMenu .control .partTwo .userAva img").src,
    time: new Date().getTime(),
  };
  let opt = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ myID: data.myID, friendID: data.friendID, time:data.time }),
  };
  let req = await fetch("/profile/accept", opt);
  let res = await req.json();
  if (res.res) {
    data.chatId = res.chatId;
    ele.parentElement.parentElement.parentElement.remove();
    creatNewFriend(data.friendID, ele.dataset.fullname, data.friendImg, res.chatId);
    server.emit("reqAccept", data);
  } else {
    ele.textContent = "";
    ele.append(copy);
    showError(res);
  }
}

function creatNewFriend(friendID, friendFullName, friImg, friendChatId) {
  let friend = document.createElement("div");
  friend.className = "fri";

  let imgContainer = document.createElement("div");
  imgContainer.className = "img-container";
  let img = document.createElement("img");
  img.src = friImg;
  imgContainer.append(img);

  let info = document.createElement("div");
  info.className = "info";

  let contact = document.createElement("contact");
  contact.className = "contact";

  let h3 = document.createElement("h3");
  let a = document.createElement("a");
  a.href = `/profile/${friendID}`;
  a.textContent = friendFullName;
  h3.append(a);

  let send = document.createElement("div");
  send.className = "send";
  send.id = friendID;
  send.setAttribute("data-fullname", friendFullName);
  send.setAttribute("data-img", friImg);
  send.setAttribute("data-chatid", friendChatId);

  let chat = document.createElement("span");
  chat.className = "chat"
  chat.setAttribute("onclick", "sendMsgFromFriendList(this)")
  let chatIcon = document.createElement("i");
  chatIcon.className = "bx bx-send";
  chat.append(chatIcon)
  let call = document.createElement("span");
  call.className = "call"
  let callIcon = document.createElement("i");
  callIcon.className = "bx bxs-phone-call";
  call.append(callIcon)
  send.append(chat, call);
  contact.append(h3, send);
  
  let options = document.createElement("div");
  options.className = "options";
  let icons = document.createElement("i");
  icons.className = "bx bx-dots-vertical-rounded bx-rotate-180";
  icons.setAttribute("onclick","optOnFriendList(this)");
  let opt = document.createElement("div");
  opt.className = "option";
  let unfollow = document.createElement("span");
  unfollow.textContent = "unfollow";
  opt.append(unfollow);
  options.append(icons, opt);

  info.append(contact, options);
  friend.append(imgContainer, info);

  if (document.querySelector(".content .friendList .empty")) {
    document.querySelector(".content .friendList .empty").style.display = "none"
  }
  document.querySelector(".content .friendList").prepend(friend)
}

async function reject(ele) {
  let copy = ele.firstChild;
  ele.textContent = "";
  loading(ele, "#fff");
  let data = { friendID: ele.dataset.id, myID: ID};
  let opt = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(data),
  };
  let req = await fetch("/profile/reject", opt);
  let res = await req.json();
  if (res.res) {
    ele.parentElement.parentElement.parentElement.remove();
    server.emit("reqReject", data.friendID);
  } else {
    ele.textContent = "";
    ele.append(copy);
    showError(res);
  }
}

server.on("receiveReq", data => {
  let fri = document.createElement("div");
  fri.className = "fri"
  let imgContainer = document.createElement("div");
  imgContainer.className = "img-container";
  let img = document.createElement("img");
  img.src = data.img;
  imgContainer.append(img);

  let inf = document.createElement("div");
  inf.className = "info";
  let h3 = document.createElement("h3");
  let a = document.createElement("a");
  a.href = "/profile/" + data.id;
  a.textContent = data.fullname;
  h3.append(a);

  let controllers = document.createElement("controllers");
  controllers.className = "controllers";
  let span1 = document.createElement("span")
  span1.classList="accept"
  span1.setAttribute("onclick", "accept(this)");
  span1.setAttribute("data-id", data.id);
  span1.setAttribute("data-fullname", data.fullname);
  span1.setAttribute("data-img", data.img);
  let i1 = document.createElement("i");
  i1.className = "bx bx-check";
  span1.append(i1)

  let span2 = document.createElement("span");
  span2.classList = "cancel";
  span2.setAttribute("onclick", "reject(this)");
  span2.setAttribute("data-id", data.id);
  let i2 = document.createElement("i");
  i2.className = "bx bx-x";
  span2.append(i2);
  controllers.append(span1, span2)
  
  inf.append(h3, controllers);
  fri.append(imgContainer, inf);

  if (document.querySelector(".content .friends .reqFri .empty")) {
    document.querySelector(".content .friends .reqFri .empty").style.display = "none";
  }
  document.querySelector(".content .friends .reqFri").prepend(fri);
});

server.on("approve", data => {
  creatNewFriend(data.id, data.name, data.fullname, data.img, data.chatId);
});
server.on("breakFriend", ids => {
  document.querySelectorAll(".content .friendList .fri").forEach(fri => {
    if (fri.querySelector(".info .contact .send").id == ids.myID) {
      fri.remove();
    }
  });
});
server.on("reqCanceled", ids => {
  document.querySelectorAll(".content .friends .reqFri .fri").forEach(fri => {
    if (fri.querySelector(".info .controllers .accept").dataset.id == ids.myID) {
      fri.remove()
    }
  });
});


// call audio/video
let peer = new Peer();
let myPeerId = null;
let friendId;
let videoCallBtn = document.getElementById("videoCall");
let audioCallBtn = document.getElementById("audioCall");
let videoBox = document.querySelector(".videoCallContainer");
let audioView = document.querySelector(".audioView");
let videoStreamControls = document.querySelector(".videoStreamControls");
let streamBox = document.querySelector(".stream");
let you = document.getElementById("you");
let me = document.getElementById("me");
let herAudio = document.getElementById("herAudio");
let endCall;
let peers = {};
let mediaDevices;
let chatId = null;

// init call
peer.on("open", (id) => {
  myPeerId = id;
});

function sendCall(audio, video, callType) {
  friendId = document.querySelector(".receiver .name h4").id;
  chatId = document.querySelector(".receiver .name h4").dataset.chatid;
  mediaDevices = navigator.mediaDevices.getUserMedia({
    audio: audio,
    video: video,
  });

  let friImg = document.querySelector(".receiver .details .img img").src;
  let friName = document.querySelector(".receiver .details .name h4").textContent;

  server.emit("reqPeerId", { friendId, myID, chatId, myName: myData.myfullname, myImg: myData.myImg, callType });
  startCallAlert(friImg, friName);
}

// user that send video call
videoCallBtn.onclick = function () {
  sendCall(true, true, "bxs-video");
}

// user stat send audio call
audioCallBtn.onclick = function () {
  sendCall(true, false, "bxs-phone-call");
}

// show alert and accept or reject
// accept call  
function acceptCall (audio, video, id) {
  server.emit("sendPeerId", { myPeerId, chatId: id });
  mediaDevices = navigator.mediaDevices.getUserMedia({
    audio: audio,
    video: video,
  });
}
// reject call 
function rejectCall (userId) {
  server.emit("rejectCall", {userId});
  document.querySelector(".callAlert").remove()
}

// user that receive call
server.on("needPeerId", (data) => {
  creatAlertCall(data.myImg, data.myName, data.callType);
  document.getElementById(data.callType).addEventListener("click", ()=> {
    if (data.callType == "bxs-video") {
      acceptCall(true, true, data.chatId);
    } else {
      acceptCall(true, false, data.chatId);
    }
    document.querySelector(".callAlert").remove();
  });
  document.querySelector(".reject .bxs-phone-off").addEventListener("click", () => {
    rejectCall(data.myId);
  });
});

// start calling
server.on("takePeerId", id => {
  if (document.querySelector(".startCallAlert")) {
    document.querySelector(".startCallAlert").remove();
  }
  mediaDevices.then(stream => {
    videoBox.style.display = "block";
    const myStream = stream;
    if (myStream.getTracks().length == 1 && myStream.getTracks()[0].kind == "audio") {
      // audio call
      initView("grid", "none");
      startStream(id, myStream, herAudio);
    } else {
      // video call
      initView("none", "block");
      me.srcObject = myStream;
      me.muted = true;
      startStream(id, myStream, you);
    }

    server.on("user-disconnected", () => {
      peers[id].close();
      myStream.getTracks().forEach(function (track) {
        track.stop();
      });
      restVideo(me, you);
      videoBox.style.display = "none";
    });
    
    endCall = function () {
      peers[id].close();
      myStream.getTracks().forEach(function (track) {
        track.stop();
      });
      server.emit("closeCall");
      restVideo(me, you);
      videoBox.style.display = "none";
    };

  }).catch(err => {
    console.log(err)
    alert("cant't access to your camera/mic");
  })
});

function initView(audio, video) {
  audioView.style.display = audio;
  videoStreamControls.style.display = video;
  me.style.display = video;
  you.style.display = video;
}
function startStream(id, stream, media) {
  let call = peer.call(id, stream);
  call.on("stream", (userStream) => {
    media.srcObject = userStream;
  });
  peers[id] = call
}

//reject call 
server.on("callRejected", () => {
  mediaDevices.then((stream) => {
    stream.getTracks().forEach(function (track) {
      track.stop();
    });
  });
  document.querySelector(".startCallAlert .note").innerHTML = `<p style="color:#ce095f;">sorry! can't call</P>`;
  setTimeout(() => {
    document.querySelector(".startCallAlert").remove()
  }, 1000);
});

// answer call
peer.on("call", (receiveCall) => {
  mediaDevices.then((stream) => {
    videoBox.style.display = "block";

    receiveCall.answer(stream);
    receiveCall.on("stream", (userStream) => {
      const comingStream = userStream;
      if (stream.getTracks().length == 1 && stream.getTracks()[0].kind == "audio") {
        herAudio.srcObject = comingStream;
      } else {
        me.srcObject = stream;
        me.muted = true;

        you.srcObject = comingStream;
        you.addEventListener("loadedmetadata", () => {
          you.play();
        });

      }
    });

    server.on("me-disconnected", () => {
      receiveCall.close();
      stream.getTracks().forEach(function (track) {
        track.stop();
      });
      restVideo(me, you);
      videoBox.style.display = "none";
    });

    endCall = function () {
      receiveCall.close();
      stream.getTracks().forEach(function (track) {
        track.stop();
      });
      server.emit("closeCall");
      restVideo(me, you);
      videoBox.style.display = "none";
    };
  }); 
});

function restVideo (me, you) {
  me.srcObject = null;
  you.srcObject = null;
}

//create start alert call 
function startCallAlert(userImg, userName) {
  let startCallAlert = document.createElement("div");
  startCallAlert.className = "startCallAlert";

  let content = document.createElement("div");
  content.className = "content";

  let user_img = document.createElement("div");
  user_img.className = "user_img";
  let img = document.createElement("img");
  img.src = userImg;
  user_img.append(img);

  let user_name = document.createElement("div");
  user_name.className = "user_name";
  let name = document.createElement("p");
  name.textContent = userName;
  user_name.append(name);

  let note = document.createElement("div");
  note.className = "note"
  let p = document.createElement("p");
  p.textContent = "start calling...";
  let callStartIcon = document.createElement("lord-icon");
  callStartIcon.setAttribute("trigger", "loop");
  callStartIcon.setAttribute("src", "https://cdn.lordicon.com/tclnsjgx.json");

  note.append(p, callStartIcon);
  content.append(user_img, user_name, note);
  startCallAlert.append(content);
  document.body.append(startCallAlert);
}

// creat alert call
function creatAlertCall (userImg, userName, type) {
  let alertCall = document.createElement("div");
  alertCall.className = "callAlert";
  let content = document.createElement("div");
  content.className = "content"
  let user_img = document.createElement("div");
  user_img.className = "user_img";
  let img = document.createElement("img");
  img.src = userImg;
  user_img.append(img);

  let user_name = document.createElement("div");
  user_name.className = "user_name";
  let p = document.createElement("p");
  p.textContent = userName;
  user_name.append(p);

  let controls = document.createElement("div");
  controls.className = "controls";
  let reject = document.createElement("div");
  reject.className = "reject";
  let rejectIcon = document.createElement("i");
  rejectIcon.className = "bx bxs-phone-off bx-rotate-180";
  reject.append(rejectIcon)

  let answer = document.createElement("div");
  answer.className = "answer"
  let answerIcon = document.createElement("i");
  answerIcon.className = "bx "+type;
  answerIcon.id = type;
  answer.append(answerIcon);

  controls.append(reject, answer);
  content.append(user_img, user_name, controls);
  alertCall.append(content);

  document.body.append(alertCall)
}

function toggle(ele) {
  if (ele.classList.contains("main")) {
    return;
  }
  ele.classList.add("main");
  ele.classList.remove("small");

  if (ele.previousElementSibling) {
    ele.previousElementSibling.classList.add("small");
    ele.previousElementSibling.classList.remove("main");
  } else {
    ele.nextElementSibling.classList.add("small");
    ele.nextElementSibling.classList.remove("main");
  }
}
