const Route = require("express").Router();
const profileControl = require("../controllers/profile-control");
const access = require("../controllers/guard-control").user
const multer = require("multer");
const path = require("path");

Route.get("/:id", access, profileControl.getProfile);
Route.get("", access, profileControl.getOwner);

Route.post("/add", profileControl.sendReq);
Route.post("/cancel", profileControl.cancel);
Route.post("/reject", profileControl.reject);
Route.post("/accept", profileControl.accept);
Route.post("/unfriend", profileControl.unfriend);

let storage = multer.diskStorage({
  destination: (req, file, cb)=> {
    let saveOn = path.join(__dirname, "../static/uploads");
    cb(null, saveOn)
  },
  filename: (req, file, cb) => {
    let custom_name = new Date().getTime() +"_"+file.originalname
    cb(null, custom_name)
  }
})
let upload = multer({storage})
Route.post("/update-images", upload.fields([{name:"back",maxCount:1}, {name:"ava", maxCount:1}]), profileControl.updateImg);

module.exports = Route
