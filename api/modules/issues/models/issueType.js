'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  title: String,
  systemType: String,

  statuses: [{
    title: String,
    statusType: {type: String, default: 'new', enum: ['new', 'inprogress', 'validation', 'done']}
  }],

  createDate: {type: Date, required: true, default: Date.now},
  removed: {type: Date}
}, {
  strict: true,
  safe: true,
  collection: 'issueTypes'
});

module.exports = mongoose.model('IssueType', schema);
