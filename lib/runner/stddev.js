/*jshint latedef:false, evil: true */
/*global exports, console */

function stddev(arr){
  var mean = 0;
  var len = arr.length;
  arr.forEach(function(n){
    mean += n;
  });
  mean = mean / len;

  var stds = 0;
  arr.forEach(function(n){
    stds += (n - mean) * (n - mean);
  });

  return Math.sqrt(stds/ len);
}

console.log(stddev([1, 3, 4, 2, 6]));

exports.stddev = stddev;
