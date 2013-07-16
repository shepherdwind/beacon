/**
 * GET home page.
 */

var runner = require('../lib/runner/index');
var URL= require("url");
var addPage = require('../modules/index').addPage;
var Pages = require('../modules/index').Pages;
var log = require("../lib/log");

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

exports.runner = function(req, res){

  var url = URL.parse(req.query.url, true);

  // 过滤不必要的参数
  var trimParam = ['spm'];
  trimParam.forEach(function(param){
    if (param in url.query){
      delete url.query[param];
    }
  });

  url.search = undefined;
  var path = URL.format(url);

  if (!path) {
    return next();
  }

  addPage(path);

  var time = new Date;
  runner.run(path, function(err, json){

    if (err) return res.jsonp({error: err});

    json = JSON.parse(json);
    res.json(json);
    json.url = path;
    json.timeStart = time;
    json.timeEnd = new Date;
    (new Pages(json)).save();

    log.debug(path, 'run end');

  });

};

exports.status = function(req, res){
  res.jsonp(runner.status());
};
