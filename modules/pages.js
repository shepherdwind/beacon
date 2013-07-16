var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PagesSchema = new Schema({
  timeStart: Date,
  timeEnd: Date,
  url: String,
  start: {
    box: [Number, Number],
    dom: Number,
    img: Number,
    winH: Number
  },
  end: {
    box: [Number, Number],
    dom: Number,
    img: Number,
    winH: Number
  },
  network: {
    css: { size: Number, num: Number},
    js: { size: Number, num: Number},
    html: { size: Number, num: Number},
    img: { size: Number, num: Number},
    size: Number,
    num: Number,
    onload: Number
  },
  imgs: [{
    actual: [Number, Number],
    render: [Number, Number],
    src: String
  }]
});

mongoose.model("Pages", PagesSchema);
