var mongoose = require("mongoose");
var config = require("../lib/config").config;

mongoose.connect(config('db'), function(err) {
  if (err) {
    console.error("connect to %s error: ", config('db'), err.message);
    return process.exit(1);
  }
});

//require("./log");
//exports.Log = mongoose.model("Log");
