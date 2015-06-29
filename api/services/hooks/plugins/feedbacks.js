'use strict';

var _ = require('lodash'),
  async = require('async');

exports['post.feedbacks'] = function (req, data, cb) {
  data['fields'] = req.body.fields;
  cb();
};