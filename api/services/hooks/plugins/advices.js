'use strict';

exports['post.advices'] = function (req, data, cb) {
  data['account.coverFile'] = req.auth.account.coverFile;
  if (req.auth.account.imageUrl) {
    data['account.imageUrl'] = req.auth.account.imageUrl;
  }
  cb();
};
