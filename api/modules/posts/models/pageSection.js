'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  component: {type: String, required: true},
  settings: mongoose.Schema.Types.Mixed
}, {
  strict: true,
  safe: true,
  collection: 'pageSections'
});

module.exports = mongoose.model('PageSection', schema);
