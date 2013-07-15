var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PagesSchema = new Schema({
  name: {
    type: String,
    unique: true
  },
  version: String,
  state: String,
  config: Object,
  author: Object,
  team: String,
  issue: {
    repo: String,
    id: Number
  },
  date: {
    type: Date,
    "default": Date.now
  }
});

mongoose.model("Pages", PagesSchema);
