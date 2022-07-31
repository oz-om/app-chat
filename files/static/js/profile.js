let friendList = document.querySelector(".friendsList .myFriends");
let reqList = document.querySelector(".friendsList .friendReq");
let friendSwitch = document.querySelector(".friendsList h4[data-type=friend]");
let reqSwitch = document.querySelector(".friendsList h4[data-type=request]");
let friendStatus = document.querySelector(".profile .status");

// toggle friends
function toggleFriend(ele) {
  if (ele.dataset.type == "friend") {
    friendSwitch.classList.add("active");
    reqSwitch.classList.remove("active");

    friendList.classList.remove("hide");
    reqList.classList.add("hide");
  } else {
    friendSwitch.classList.remove("active");
    reqSwitch.classList.add("active");

    friendList.classList.add("hide");
    reqList.classList.remove("hide");
  }
}

let data = {
  myFullname: document.querySelector(".bottomMenu .partTwo a").dataset.fullname,
  myName: document.querySelector(".bottomMenu .partTwo a").textContent,
  myID: document.querySelector(".bottomMenu .partTwo a").id,
  myImg: document.querySelector(".bottomMenu .partTwo .userAva img").src,
  FriendFullname: document.querySelector(".profile .details .name h4").dataset.fullname,
  friendName: document.querySelector(".profile .details .name h4").textContent,
  friendID: document.querySelector(".profile .details .name h4").id,
  friendImg: document.querySelector(".profile .ava .userAva img").src,
};

async function action(serv, json) {
  let options = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(json),
  };
  let req = await fetch(serv, options);
  let res = await req.json();
  return res;
}

function addFriend(ele) {
  data.time = new Date().getTime();
  let copy = ele.firstElementChild.cloneNode(true);
  ele.textContent = "";
  loading(ele, "#fff");
  action("/profile/add", { myID: data.myID, friendID: data.friendID, time: data.time }).then((res) => {
    if (res.res) {
      console.log("req send success");
      friendStatus.innerHTML = `
        <div class="receiv-req">
          <div class="req" onclick="cancelReq(this)">
            <span><i class='bx bxs-minus-circle'></i>cancel request</span>
          </div>
        </div>
        `;
      server.emit("sendReq", data);
    } else {
      ele.textContent = "";
      ele.append(copy);
      showError(res);
      console.log("send was failed");
    }
  });
}

function cancelReq(ele) {
  let copy = ele.firstElementChild.cloneNode(true);
  ele.textContent = "";
  loading(ele, "#fff");
  action("/profile/cancel", { myID: data.myID, friendID: data.friendID }).then((res) => {
    if (res.res) {
      console.log("req cancel success");
      defaultStat();
      server.emit("unSend", { friendID: data.friendID, myID: data.myID });
    } else {
      ele.textContent = "";
      ele.append(copy);
      showError(res);
      console.log("cancel was failed");
    }
  });
}

function rejectReq(ele) {
  let copy = ele.firstElementChild.cloneNode(true);
  ele.textContent = "";
  loading(ele, "#fff");
  action("/profile/reject", { myID: data.myID, friendID: data.friendID}).then((res) => {
    if (res.res) {
      console.log("reject success");
      defaultStat();
      server.emit("reqReject", data.friendID);
    } else {
      ele.textContent = "";
      ele.append(copy);
      showError(res);
      console.log("reject was failed");
    }
  });
}

function acceptReq(ele) {
  data.time = new Date().getTime();
  let copy = ele.firstElementChild.cloneNode(true);
  ele.textContent = "";
  loading(ele, "#fff");

  if (!friendStatus) {
    data.friendID = ele.id;
    data.FriendFullname = ele.dataset.fullname;
    data.friendImg = ele.dataset.img;
  }
  action("/profile/accept", { myID: data.myID, friendID: data.friendID, time: data.time }).then((res) => {
    if (res.res) {
      console.log("accept success");
      if (friendStatus) {
        initMes(res.chatId);
      } else {
        ele.parentElement.parentElement.remove();
        pushNewFriend(data.friendID, data.FriendFullname, data.friendImg);
      }

      data.chatId = res.chatId;
      server.emit("reqAccept", data);
    } else {
      ele.textContent = "";
      ele.append(copy);
      showError(res);
    }
  });
}

function message(ele) {
  document.querySelector(".status .msgBox").style.display = "grid";
}
function closeBox(ele) {
  ele.parentElement.style.display = "none";
}
function sendMsg(ele) {
  let msg = {
    chatId: document.querySelector(".status .friends .message").id,
    content: ele.parentElement.querySelector("textarea").value,
    sender: data.myID,
    receiver: data.friendID,
    time: new Date(),
  };
  action("/sendMsg", { msg }).then((res) => {
    server.emit("sendMsg", {
      myID: data.myID,
      myName: data.myName,
      myImg: data.myImg,
      myfullname: document.querySelector(".bottomMenu .partTwo a").dataset.fullname,
      msg,
    });
    console.log("sending msg");
    closeBox(ele);
  });
}

function friendsOption(ele) {
  ele.nextElementSibling.classList.toggle("active");
}

function unfriend(ele) {
  let copy = ele.cloneNode(true);
  ele.textContent = "";
  loading(ele, "red");
  if (!friendStatus) {
    data.friendID = ele.id;
  }
  action("/profile/unfriend", { myID: data.myID, friendID: data.friendID }).then((res) => {
    if (res.res) {
      if (friendStatus) {
        defaultStat();
      } else {
        ele.parentElement.parentElement.remove();
      }
      server.emit("unfriend", { friendID: data.friendID, myID: data.myID });
    } else {
      ele.parentElement.prepend(copy);
      ele.remove();
      showError(res);
    }
  });
}

function copyLink(ele) {
  let textToCopy = ele.previousElementSibling.value;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      console.log("copy success");
    });
  } else {
    console.log("Browser Not compatible");
  }
}

server.on("receiveReq", (data) => {
  if (friendStatus) {
    friendStatus.innerHTML = `
     <div class="friend-req">
       <div class="accept" data-fullname="${data.FriendFullname}" onclick="acceptReq(this)">
         <span><i class='bx bx-check'></i>approve</span>
       </div>
       <div class="reject" onclick="rejectReq(this)">
         <span><i class='bx bx-x'></i>cancel</span>
       </div>
     </div>
   `;
  }
});

server.on("approve", (data) => {
  if (friendStatus) {
    initMes(data.chatId);
  }
});

server.on("reject", () => {
  if (friendStatus) {
    defaultStat();
  }
});

server.on("breakFriend", () => {
  if (friendStatus) {
    defaultStat();
  }
});

server.on("reqCanceled", (ids) => {
  if (friendStatus) {
    defaultStat();
  }
});

function initMes(chatId) {
  let msgBox = document.createElement("div");
  msgBox.className = "msgBox";
  let closeBox = document.createElement("div");
  closeBox.className = "closeBox";
  closeBox.setAttribute("onclick", "closeBox(this)");
  let closeIcon = document.createElement("i");
  closeIcon.className = "bx bx-x";
  closeBox.append(closeIcon);

  let textArea = document.createElement("textarea");
  textArea.name = "msg";
  textArea.placeholder = "message";
  let sendBtn = document.createElement("div");
  sendBtn.className = "sendBtn";
  sendBtn.setAttribute("onclick", "sendMsg(this)");
  let sendIcon = document.createElement("i");
  sendIcon.className = "bx bx-send";
  sendBtn.append(sendIcon);
  msgBox.append(closeBox, textArea, sendBtn);

  let friends = document.createElement("div");
  friends.className = "friends";

  let message = document.createElement("div");
  message.className = "message";
  message.id = chatId;
  message.setAttribute("onclick", "message(this)");
  let msgSpan = document.createElement("span");
  let msgIcon = document.createElement("i");
  msgIcon.className = "bx bxs-message";
  msgSpan.append(msgIcon, "message");
  message.append(msgSpan);

  let unfollow = document.createElement("div");
  unfollow.className = "unfollow";
  let unfSpan = document.createElement("span");
  let unfollowIcon = document.createElement("i");
  unfollowIcon.className = "bx bxs-minus-circle";
  unfSpan.append(unfollowIcon, "unfollow");
  unfollow.append(unfSpan);

  let other = document.createElement("div");
  other.className = "other";
  let otpIcon = document.createElement("i");
  otpIcon.className = "bx bx-dots-vertical-rounded";
  otpIcon.setAttribute("onclick", "friendsOption(this)");

  let options = document.createElement("div");
  options.className = "options";

  let unfriend = document.createElement("span");
  unfriend.setAttribute("onclick", "unfriend(this)");
  let unfriendIcon = document.createElement("i");
  unfriendIcon.className = "bx bx-user-x";
  unfriend.append(unfriendIcon, "unfriend");

  let block = document.createElement("span");
  block.setAttribute("onclick", "blockUser(this)");
  let blockIcon = document.createElement("i");
  blockIcon.className = "bx bxs-minus-circle";
  block.append(blockIcon, "block");

  options.append(unfriend, block);
  other.append(otpIcon, options);
  friends.append(message, unfollow, other);

  friendStatus.textContent = "";
  friendStatus.append(msgBox, friends);
}

function defaultStat() {
  let Default = document.createElement("div");
  Default.className = "default";

  let sendReq = document.createElement("div");
  sendReq.className = "send-req";
  sendReq.setAttribute("onclick", "addFriend(this)");
  let addSpan = document.createElement("span");
  let addIcon = document.createElement("i");
  addIcon.className = "bx bx-user-plus";
  addSpan.append(addIcon, " add friend");
  sendReq.append(addSpan);
  Default.append(sendReq);
  friendStatus.textContent = "";
  friendStatus.append(Default);
}

function pushNewFriend(id, fullname, img) {
  let fri = document.createElement("div");
  fri.className = "fri";

  let img_container = document.createElement("div");
  img_container.className = "img";
  let profImg = document.createElement("img");
  profImg.src = img;
  img_container.append(profImg);

  let details = document.createElement("div");
  details.className = "details";
  let h4 = document.createElement("h4");
  let a = document.createElement("a");
  a.href = `profile/${id}`;
  a.textContent = fullname;
  h4.append(a);
  details.append(h4);

  let options = document.createElement("div");
  options.className = "options";
  let unfriend = document.createElement("span");
  unfriend.id = id;
  unfriend.textContent = "unfriend";
  unfriend.setAttribute("onclick", "unfriend(this)");
  options.append(unfriend);

  fri.append(img_container, details, options);
  if (document.querySelector(".myFriends .friList .empty")) {
    document.querySelector(".myFriends .friList .empty").style.display = "none";
  }
  document.querySelector(".myFriends .friList").prepend(fri);
}

// change profile image
let change_images = document.querySelector(".change-images");
let back_img = document.getElementById("back-img");
let ava_img = document.getElementById("ava-img");
let change_img = document.querySelector(".change-img");
if (change_img) {
  change_img.addEventListener("click", () => {
    change_images.style.display = "block";
  });
}

let back_input = document.getElementById("back");
back_input.onchange = (e) => {
  let reader = new FileReader();
  reader.readAsDataURL(back_input.files[0]);
  reader.onload = () => {
    back_img.src = reader.result;
  };
};

let ava_input = document.getElementById("ava");
ava_input.onchange = () => {
  let reader = new FileReader();
  reader.readAsDataURL(ava_input.files[0]);
  reader.onload = () => {
    ava_img.src = reader.result;
  };
};

let save_changes = document.querySelector(".save-changes input");
save_changes.onclick = async (e) => {
  e.preventDefault();
  let recentBack = document.querySelector(".profile .back img").src.split("/");
  let recentAva = document.querySelector(".profile .userAva img").src.split("/");

  let form = new FormData();
  if (back_input.value) {
    form.append("back", back_input.files[0]);
    form.append("recentBack", recentBack[recentBack.length -1]);
  }
  if (ava_input.value) {
    form.append("ava", ava_input.files[0]);
    form.append("recentAva", recentAva[recentAva.length -1]);
  }

  if (back_input.value || ava_input.value) {
    let backValid = /\s/g.test(back_input.value)
    let avaValid = /\s/g.test(ava_input.value)
    if (!backValid && !avaValid) {
      let req = await fetch("/profile/update-images", {
        method: "POST",
        body: form,
      });
      let res = await req.json();
      if (res.res) {
        location.reload();
      } else {
        showError(res)
      }
    } else showError({ err: "Invalid Name: \n your files names contains spaces" });
  } else {
    closeChange.click();
  }
};

let closeChange = document.getElementById("close-change");
closeChange.onclick = function () {
  change_images.style.display = "none";
};
