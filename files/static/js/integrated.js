// toggle menu
function toggleMenu(ele) {
  ele.addEventListener("click", function (e) {
    e.stopPropagation();
    document.querySelector(".bottomMenu").classList.toggle("openMen");
  });
}
toggleMenu(document.querySelector(".menu"));
toggleMenu(document.querySelector(".bottomMenu .hide"));

// add effects when hover on menu icons
function addEffect(ele) {
  ele.querySelector("a lord-icon").setAttribute("trigger", "loop");
}
function removeEffect(ele) {
  ele.querySelector("a lord-icon").removeAttribute("trigger");
}

// toggle notif
let notIcon = document.querySelector(".user .notif");
notIcon.addEventListener("click", () => {
  document.querySelector(".red-ball").style.display = "none";
  document.querySelector(".notif-box").classList.toggle("activeNotif");
});

//  toggle notif options
function notifOpt(ele) {
  document.querySelectorAll(".notification .notif-content .notif-option i")
    .forEach((notif) => {
      if (notif == ele) {
        ele.nextElementSibling.classList.toggle("active");
      } else {
        notif.nextElementSibling.classList.remove("active");
      }
    });
}

// when open notif
function openNotif(ele) {
  if (ele.parentElement.classList.contains("notOpen")) {
    fetch("/openNotif", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ id: ele.parentElement.id }),
    });
  }
}

// delete notification
async function deleteNotif(ele) {
  let text = ele.textContent;
  ele.textContent = ''
  loading(ele,'red')
  let req = await fetch("/deleteNotif", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ id: ele.id }),
  });
  let res = await req.json();
  if (res.res) {
    ele.parentElement.parentElement.parentElement.remove();
    if (document.querySelector(".notification").childElementCount < 1) {
      let empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "there is no notifications";
      document.querySelector(".notification").append(empty);
    }
  } else {
    showError(res)
    ele.textContent = text
  }
}

// make all as read
let allRead = document.querySelector(".makAllRead");
allRead.addEventListener("click", async ()=> {
  loading(allRead);
  let req = await fetch("/makAllRead", {
    method: "POST",
    headers: {
      "Content-type":"application/json"
    },
    body: JSON.stringify({req:"makAllRead"})
  });
  let res = await req.json();
  if (res.res) {
    document.querySelectorAll(".notification .notif-content").forEach(notif => {
      notif.classList.add("opened")
    })
    allRead.lastElementChild.remove()
  } else {
    allRead.lastElementChild.remove()
    showError(res);
  }
});

function showError(res) {
  document.querySelector(".errorMessage").classList.add("active");
  document.querySelector(".errorMessage span").textContent = res.err;

  setTimeout(() => {
    document.querySelector(".errorMessage").classList.remove("active");
  }, 2000);
}

function loading(parent, color = "#578074", style ="width:20px;height:20px") {
  let load = document.createElement("lord-icon");
  load.setAttribute("src", "https://cdn.lordicon.com/sihdhmit.json");
  load.setAttribute("trigger", "loop");
  load.setAttribute("state", "loop");
  load.setAttribute("colors", `primary:${color}`);
  load.setAttribute("style", style);
  parent.append(load)
}
// for full screen 
// let userAgent = window.navigator.userAgent;
// let reqFullScreen = false; 
// if (/Android/.test(userAgent)) {
//   reqFullScreen = confirm("do you want use app in full screen?");
// }
// let interval = setInterval(() => {
//   if (reqFullScreen) {
//     document.documentElement.requestFullscreen();
//   }
// }, 1000);

