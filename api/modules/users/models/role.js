'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  id: {type: Number, required: true, default: 0},

  // Назва
  title: {type: String, required: true},
  description: String,

  permissions: [
    {
      name: String
    }
  ],

  // ---
  createDate: {type: Date, required: true, default: Date.now},
  modifyDate: {type: Date},
  removed: {type: Date}
}, {
  strict: true,
  safe: true,
  collection: 'roles'
});

module.exports = mongoose.model('Role', schema);
