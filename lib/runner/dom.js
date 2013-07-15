/*jshint node:true */

var netsniff = require('./netsniff');

function run(url, res){

  var page = require('webpage').create();
  page.viewportSize = { width: 1024, height: 700 };
  netsniff.watch(page);
  var t = Date.now();

  page.open(url, function(){

    page.endTime = new Date();

    var o = getInfo(page);

    res.write('{\n "start": ');

    res.write(JSON.stringify(o, null, 2) + ',\n "network": ');

    res.write(JSON.stringify(netsniff.getNet(page), null, 2));

    res.write(',\n');

    var time = moveToEnd(page);

    setTimeout(function(){
      res.write('"end": ' + '\n');
      var o = getInfo(page);
      res.write(JSON.stringify(o, null, 2) + ',\n');

      res.write('"imgs": '); 
      getArea(page);

      setTimeout(function(){
        var area = page.evaluate(function(){
          return window.area;
        });
        res.write(JSON.stringify(area, null, 2) + '\n}');
        res.close();
        page.render('taobao.png');
      }, 1000);

    }, time + 1000);

  });

}

/*
 *function SimulateMouseOver(elem){
 *    var evt = elem.ownerDocument.createEvent('MouseEvents');
 *    evt.initMouseEvent('mouseover',true,true,
 *        elem.ownerDocument.defaultView,0,0,0,0,0,
 *        false,false,false,false,0,null);
 *    var canceled = !elem.dispatchEvent(evt);
 *    if(canceled)
 *        alert('Event Cancelled');
 *}
 */

function moveToEnd(page){

  return page.evaluate(function(){

    var duration = 500;
    var winH = window.innerHeight;
    var num = Math.ceil(document.height / winH);

    var scroll = function(win, i){
      i = i || 1;
      setTimeout(function(){
        win.scrollTo(0, i * winH);
        if (i < num) scroll(win, i + 1);
      }, duration);
    };

    scroll(window);

    return num * duration;
  });


}

function getInfo(page){

  return page.evaluate(function(){
    var doc = document;
    return {
      box: [doc.width, doc.body.clientHeight],
      winH: window.innerHeight,
      img: doc.querySelectorAll('img').length,
      dom: doc.querySelectorAll('*').length
    };
  });

}

function getArea(page){
  return page.evaluate(function(){

    var imgs = document.querySelectorAll('img');
    var size = [0, 0];
    var area = [];

    [].forEach.call(imgs, function(img){

      var natural = [img.width, img.height];
      size[0] += img.width * img.height;

      if (!img.src) {
        //如果图片没有src，不做计算
        return;
      }

      //图片没有被隐藏
      if (img.offsetWidth) {
        var text = img.style.cssText;
        img.style.cssText += ';width: auto;height: auto;';
        size[1] += img.width * img.height;

        if (img.width != natural[0] || img.height != natural[1]) {
          area.push({
            render: [natural[0], natural[1]],
            actual  : [img.width, img.height],
            src: img.src
          });
          img.src = 'http://img.f2e.taobao.net/yacheng.png_' + img.width + 'x' + img.height + '.jpg?style=m';
        }

        img.style.cssText = text;

      } else {

        var image = new Image();
        image.src = img.src;

        image.onload = function(){
          size[1] += image.width * image.height;
          if (image.width != natural[0] || image.height != natural[1])
            area.push({
              render: [natural[0], natural[1]],
              actual: [image.width, image.height],
              src: img.src 
            });
        };

      }

    });

    window.area = area;

    return size;

  });
}

exports.run = run;
