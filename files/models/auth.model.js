const mongoose = require("mongoose");
const db_url = require("./db_url");
const bcrypt = require("bcrypt");

let users = require("./user.model").users;
const notifModel = require("./notif_model").notif;

exports.register = (data) => {
  return new Promise((resolve, reject) => {
    mongoose.connect(db_url).then(()=>{
      return users.findOne({$or :[{email: data.email},{username:data.username}]})
    }).then(user => {
      if (user) {
        reject("this username or email already exists");
      } else {
        return cryptPass = bcrypt.hash(data.pass, 10)
      }
    }).then(cryptPass => {
      let newUser = new users({
        fname: data.fname,
        lname: data.lname,
        username: data.username,
        email: data.email,
        pass: cryptPass,
      });
      let newNotif = new notifModel({
        notifOwner: newUser._id,
        notifications:[]
      });
      return Promise.all([newUser.save(), newNotif.save()]);
    }).then(()=> {
      resolve();
    }).catch(err => {
      console.log(err)
      reject("Ops! Something Went Wrong")
    })
  })
}

exports.login = (email, pass)=>{
    return new Promise((resolve,reject) => {
      mongoose.connect(db_url).then(()=>{
        return users.findOne({$or:[{email:email},{username:email}]})
      }).then(user => {
        if (user) {
          bcrypt.compare(pass,user.pass).then(same => {
            if (!same) {
              reject("username or password incorrect");
            } else {
              resolve(user._id);
            }
          })
        } else {
          reject("this account is not exist");
        }
      }).catch(err => {
        reject("something went wrong pleas trye again!");
        console.log("there some errors coming from auth model");
        console.log(err);
      })
    })
}