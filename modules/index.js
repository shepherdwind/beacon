var mongoose = require("mongoose");
var db = 'mongodb://127.0.0.1:27017/beacon';
var log = require('../lib/log');

mongoose.connect(db, function(err) {
  if (err) {
    console.error("connect to %s error: ", config('db'), err.message);
    return process.exit(1);
  }
});

require("./pages");
require("./page");

var Pages = mongoose.model("Pages");
var Page = mongoose.model("PageBasic");

exports.addPage = function(url){

  Page.findOne({url: url}).exec(function(err, page){

    if (err || !page) {

      log.debug(url, 'add new Page ');

      var p = new Page({
        url: url,
        times: 1,
        hooks: []
      });

      p.save();

    } else {

      page.times += 1;
      log.debug(url, 'run Page @' + page.times);
      page.save();

    }

  });
};

exports.Pages = Pages;
