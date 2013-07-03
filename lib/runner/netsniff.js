/*jshint trailing: false, node: true */

if (!Date.prototype.toISOString) {
  Date.prototype.toISOString = function () {
    function pad(n) { return n < 10 ? '0' + n : n; }
    function ms(n) { return n < 10 ? '00'+ n : n < 100 ? '0' + n : n ; }
    return this.getFullYear() + '-' +
      pad(this.getMonth() + 1) + '-' +
      pad(this.getDate()) + 'T' +
      pad(this.getHours()) + ':' +
      pad(this.getMinutes()) + ':' +
      pad(this.getSeconds()) + '.' +
      ms(this.getMilliseconds()) + 'Z';
  };
}

function createHAR(page) {

  var entries = {
    css: {size: 0, num: 0},
    js: {size: 0, num: 0},
    html: {size: 0, num: 0},
    img: {size: 0, num: 0},
    size: 0,
    num: 0
  };

  page.resources.forEach(function (resource) {
    var request = resource.request;
    var startReply = resource.startReply;
    var endReply = resource.endReply;

    if (!request || !startReply || !endReply) {
      return;
    }

    // Exclude Data URI from HAR file because
    // they aren't included in specification
    if (request.url.match(/(^data:image\/.*)/i)) {
      return;
    }

    var type;
    var contentType = endReply.contentType;
    if (contentType.indexOf('image') > -1) {
      type = 'img';
    } else if (contentType.indexOf('javascript') > 0) {
      type = 'js';
    } else if(contentType.indexOf('css') > 0) {
      type = 'css';
    } else if(contentType.indexOf('html') > 0) {
      type = 'html';
    }

    if (type) {
      entries[type].size += startReply.bodySize;
      entries[type].num += 1;
    }

    entries.num += 1;
    entries.size += startReply.bodySize;

  });

  entries.onload = page.endTime - page.startTime;

  return entries;
}

function netsniff(page) {

  page.resources = [];

  page.onLoadStarted = function () {
    page.startTime = new Date();
  };

  page.onResourceRequested = function (req) {
    page.resources[req.id] = {
      request: req,
      startReply: null,
      endReply: null
    };
  };

  page.onResourceReceived = function (res) {
    if (res.stage === 'start') {
      page.resources[res.id].startReply = res;
    }
    if (res.stage === 'end') {
      page.resources[res.id].endReply = res;
    }
  };
}

exports.watch = netsniff;
exports.getNet = createHAR;
