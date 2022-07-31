const mongoose = require("mongoose");
const db_url = require("../models/db_url")

exports.db_connect = async (req, res, next) => {
  try {
    await mongoose.connect(db_url).then(()=> {
      next()
    });
  } catch (error) {
    res.json({res: false, err:"something went wrong, try again"})
  }
}

