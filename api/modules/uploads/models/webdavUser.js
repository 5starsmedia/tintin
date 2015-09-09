'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  username: {type: String, required: true},
  password: {type: String}
}, {
  strict: true,
  safe: true,
  collection: 'webdavUsers',
  versionKey: false
});

//schema.index({'collectionName': 1, 'resourceId': 1});
//schema.index({'refs.collectionName': 1, 'refs.resourceId': 1});

module.exports = mongoose.model('WebdavUser', schema);
