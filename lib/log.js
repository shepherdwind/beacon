var red, blue, reset;
red   = '\033[31m';
blue  = '\033[34m';
reset = '\033[0m';
//开启所有的debug
process.env.DEBUG = '[\\s\\S]*';
var debug = require('debug');
var debugs = {};

var Log = {

  debug: function(url, msg){

    if (url in debugs) {
      debugs[url](msg);
    } else {
      var fn = debug(url);
      fn(msg);
      debugs[url] = fn;
    }
    //console.log.apply(console, arguments);
  },

  error: function(msg, title){
    title = title || 'Error';
    console.log.call(console, red + '[' + title + '] ' + reset + msg);
  },

  success: function(msg, title){
    title = title || 'Success';
    console.log.call(console, blue + '[' + title + '] ' + reset + msg);
  },

  DEBUG: true

};

module.exports = Log;
