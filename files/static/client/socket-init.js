let server = io();
var myID = document.querySelector(".bottomMenu .partTwo h4 a").id;
if (location.href == "http://om-chate.herokuapp.com/") {
  location.replace("https://om-chate.herokuapp.com/");
}

server.on("connect", ()=> {
    server.emit("creatNotifRoom", myID);
});

function createNotif(friendID, id, name, imgProfile, text ) {
  let notif_content = document.createElement("div");
  notif_content.className = "notif-content notOpen";
  notif_content.id = id;
  let img_container = document.createElement("div");
  img_container.className = "img";
  let img = document.createElement("img");
  img.src = imgProfile;
  img_container.append(img);
  let details = document.createElement("div");
  details.className = "details";
  details.setAttribute("onclick", "openNotif(this)");
  let h4 = document.createElement("h4");
  let a = document.createElement("a");
  a.href = "/profile/"+friendID;
  a.textContent = name + ` ${text}`;
  h4.append(a)
  let time = document.createElement("div");
  time.className = "time";
  time.textContent = "just now";
  details.append(h4, time);

  let notif_opt = document.createElement("div");
  notif_opt.className = "notif-option";
  let icon = document.createElement("i");
  icon.className = "bx bx-dots-vertical-rounded";
  icon.setAttribute("onclick", "notifOpt(this)")
  let opt = document.createElement("div");
  opt.className = "opt";
  let span1 = document.createElement("span");
  span1.textContent = "make as unread";
  span1.id = id
  let span2 = document.createElement("span");
  span2.textContent = "delete";
  span2.id = id
  opt.append(span1, span2);
  notif_opt.append(icon, opt);
  notif_content.append(img_container, details, notif_opt);
  document.querySelector(".notification").prepend(notif_content)
  if (document.querySelector(".notification .empty")) {
    document.querySelector(".notification .empty").remove()
  }
}

server.on("receiveReq", (data)=> {
  document.querySelector(".red-ball").style.display = "unset";
  createNotif(data.id, data.time, data.fullname, data.img, 'sent you a friend request');
});

server.on("approve", (data)=> {
  document.querySelector(".red-ball").style.display = "unset";
  createNotif(data.id, data.time, data.fullname, data.img, "accept your friend request");
});

