'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ThingSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

var BarSchema = new Schema({
  bar_id: String,
  users: [{type:Schema.Types.ObjectId, ref: 'User'}]
});

module.exports = mongoose.model('Thing', ThingSchema);
module.exports = mongoose.model('Bar', BarSchema);
