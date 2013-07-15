var _ = require('underscore');
//var Events = require('events').EventEmitter;
var spawn = require('child_process').spawn;
var http = require("http");
var log = require("../log");

var option = {
  number: 10, //最多启动Phantomjs进程数目
  port: 3050  //第一个端口
};

var guid = function(){
  var uid = 0;
  var MAX = 10000;
  return function(){
    uid += 1;
    //如果uid大于MAX重新开始计数
    if (uid > MAX) uid = 0;
    return uid;
  };
}();

function PhantomRunner(option){

  if (!(this instanceof PhantomRunner)) {
    return new PhantomRunner(option);
  }

  this.init(option);
}

//PhantomRunner.prototype = new Events();

PhantomRunner.prototype = {

  constructor: PhantomRunner,

  init: function(option){

    this.maxProcess = option.number;
    this.port = option.port;
    this.process = []; //启动的进程
    this.tasks = [];  //进行中的任务

  },

  /**
   * @public
   * 执行任务入口函数
   * @param url {string} 需要执行检测的url地址
   * @param callback {Function} 回调函数
   */
  run: function(url, callback){

    if (!url || !callback || !callback.call) {
      log.error('url is empty or callback is not an function');
      return;
    }

    var uid = guid();

    this.tasks.push({
      url: url,
      callback: callback,
      uid: uid
    });

    log.debug('receive task, url: ' + url  + ', uid: '+ uid);

    this._run();
  },

  /**
   * 分配执行任务
   */
  _run: function(){

    var process = this._getFreeProcess();
    if (!process && this.maxProcess >= this.process.length) {
      this._startProcess();
    } else if (process && this.tasks.length) {
      //执行任务
      this._process(process);
    }

  },

  _process: function(process){

    var port = process.port;
    var task = this.tasks.shift();
    var self = this;

    if (task){

      process.status = 'busy';
      log.debug('start run task ' + task.uid + ' @' + port);

      var options = {
        method: 'get',
        hostname: '127.0.0.1',
        path: '/?url=' + task.url,
        port: port
      };

      http.get(options, function(res){

        var ret = '';
        res.on('data', function(buf){
          ret += buf.toString();
        });

        res.on('end', function(){
          task.callback(null, ret);
          self._run();
          process.status = 'free';
        });

      }).on('error', function(e){

        log.error('error happen on ' + task.uid);
        //task.callback(e);
        //self._run();
        process.status = 'free';

      });

    }

  },

  _getFreeProcess: function(){

    var ret = {};

    var has = _.some(this.process, function(process){
      if (process.status == 'free') {
        ret = process;
        return true;
      }
    });

    return has ? ret : false;
  },

  _startProcess: function(){

    this.port += 1;
    var port = this.port;
    var self = this;

    var cmd = 'phantomjs';
    var argv = ['./server.js', port];
    var options = {cwd: __dirname};
    if (process.env.SUDO_UID) options.uid = +process.env.SUDO_UID;

    var runner = spawn(cmd, argv, options);

    var _process = {
      port: port,
      runner: runner,
      status: 'init'
    };

    //加入可执行进程队列
    this.process.push(_process);

    log.debug('start server on port: ' + port);

    runner.stdout.once('data', function(){
      _process.status = 'free';
      self._run();
    });

    //runner.stdout.on('data', function (data) {
      //console.log('stdout: ' + data);
    //});

    runner.stderr.on('data', function (data) {
      log.error('stderr: ' + data);
    });
    
  }

};

var runner = new PhantomRunner(option);
process.on('exit',function(){
  runner.process.forEach(function(process){
    console.log('kill phantomjs server on port:' + process.port);
    process.runner.kill('SIGHUP');
  });
});

module.exports = runner;
