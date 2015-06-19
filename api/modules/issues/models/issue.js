'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  title: String,
  text: String,

  account: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    coverFile: {
      _id: mongoose.Schema.Types.ObjectId,
      title: String
    }
  },
  assignAccount: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    coverFile: {
      _id: mongoose.Schema.Types.ObjectId,
      title: String
    }
  },
  status: {type: String, default: 'new', enum: ['new', 'inprogress', 'done']},


  createDate: {type: Date, required: true, default: Date.now},
  removed: {type: Date}
}, {
  strict: true,
  safe: true,
  collection: 'issues'
});

module.exports = mongoose.model('Issue', schema);
