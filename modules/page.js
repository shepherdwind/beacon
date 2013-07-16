var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PageSchema = new Schema({
  url: {type: String, unique: true},
  //执行次数
  times: Number,
  hooks: Array
});

mongoose.model("PageBasic", PageSchema);
