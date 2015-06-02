'use strict';

var mongoose = require('mongoose'),
  materializedPlugin = require('mongoose-materialized');

var schema = new mongoose.Schema({

  eventType: {type: String, required: true},
  stateType: {type: String, required: true},
  title:     {type: String, required: true},
  comment:   String,
  settings:  mongoose.Schema.Types.Mixed,
  captions:  [{ title: String }],

  createDate: {type: Date, required: true, default: Date.now},
  removed: {type: Date},
  site: {
    _id: mongoose.Schema.Types.ObjectId,
    domain: String
  }
}, {
  strict: true,
  safe: true,
  collection: 'states'
});

schema.index({createDate: 1});
schema.plugin(materializedPlugin);

module.exports = mongoose.model('State', schema);
