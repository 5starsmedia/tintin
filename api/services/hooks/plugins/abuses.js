'use strict';

exports['post.abuses'] = function (req, data, cb) {
  data['account._id'] = req.auth.account._id;
  data['account.title'] = req.auth.account.title;
  cb();
};
