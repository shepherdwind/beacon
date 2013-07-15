
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

var runner = require('../lib/runner/index');

var i = 0;
exports.runner = function(req, res){
  var url = req.query.url;
  if (url) {
    runner.run(url, function(err, json){
      res.json(JSON.parse(json));
    });
  }
};
