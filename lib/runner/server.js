var page = require('webpage').create();
var server = require('webserver').create();
var system = require('system');
var host, port;
var url = require('url');
var run = require('./dom').run;

console.log('hello world');

if (system.args.length !== 2) {
  console.log('Usage: server.js <some port>');
  phantom.exit(1);
} else {
  port = system.args[1];
  var listening = server.listen(port, function (request, response) {
    response.statusCode = 200;
    var u = url.parse(request.url, true);
    if (request.url == '/favicon.ico') {
      response.close();
      return;
    }
    console.log("GOT HTTP REQUEST");
    //response.headers = {"Cache": "no-cache", "Content-Type": "application/json"};
    response.headers = {"Cache": "no-cache", "Content-Type": "text/html"};

    run(u.query.url, response);

  });
  if (!listening) {
    console.log("could not create web server listening on port " + port);
    phantom.exit();
  }
}
