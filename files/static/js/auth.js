let fname = document.querySelector(".fname input"), fnameLabel = document.querySelector(".fname label");
let lname = document.querySelector(".lname input"), lnameLabel = document.querySelector(".lname label");
let username = document.querySelector(".username input"), usernameLabel = document.querySelector(".username label");
let email = document.querySelector(".email input"), emailLabel = document.querySelector(".email label");
let pass = document.querySelector(".pass input"), passLabel = document.querySelector(".pass label");


function checkName(input) {
  if (/((?=.*[\s*])|(?=.*[\d*]))/g.test(input.value)) {
    notValid(input);
  } else {
    if (input.value.length > 2) {
      valid(input);
    } else {
      notValid(input);
    }
  }
}
function enterDisable(input) {
  input.onkeypress = function (e) {
    if (e.keyCode == 13) {
      e.preventDefault()
    }
  }
}
if (fname) {
  fname.oninput = (e) => {
    checkName(fname);
    reset(fname, fnameLabel);
  };
  enterDisable(fname)
}
if (lname) {
  lname.oninput = () => {
    checkName(lname);
    reset(lname, lnameLabel);
  };
  enterDisable(lname)
}

if (username) {
  username.oninput = function () {
    if (username.value.length > 2) {
      valid(username);
    } else {
      notValid(username);
    }
    reset(username, usernameLabel);
  };
  enterDisable(username)
}

email.oninput = () => {
  if (document.querySelector("title").textContent == "register") {
    if (/\w+@\w+.\W+(\D+|\S+)/.test(email.value)) {
      valid(email);
    } else {
      notValid(email);
    }
  } else {
    if (email.value.length > 2) {
      valid(email);
    } else {
      notValid(email);
    }
  }
  reset(email, emailLabel);
};
enterDisable(email)

pass.oninput = function () {
  if (/(?=.*[@#$%^&]).{6}/.test(pass.value)) {
    valid(pass);
  } else {
    notValid(pass);
  }
  reset(pass, passLabel);
};
enterDisable(pass)

function valid(input) {
  input.classList.remove("notValid");
  input.classList.add("valid");
  ifReady()
}
function notValid(input) {
  input.classList.add("notValid");
  input.classList.remove("valid");
  ifReady()
}
function reset(input, label) {
  if (input.value == "") {
    input.removeAttribute("class");
    label.removeAttribute("class");
  }
}

function ifReady() {
  function allValid() {
    let elements = document.querySelectorAll("form > div > input");
    let arr = Array.from(elements)
    let all = arr.every(ele => {
      return ele.classList.contains("valid")
    })
    return all
  }
  if (allValid()) {
    document.querySelector("form button").classList.remove("notReady")
  } else {
    document.querySelector("form button").classList.add("notReady")
  }
}

