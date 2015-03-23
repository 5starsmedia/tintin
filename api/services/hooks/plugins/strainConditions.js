'use strict';

exports['post.strainConditions'] = function (req, data, cb) {
  if (req.query['strainReview._id']) {
    data['strainReview._id'] = req.query['strainReview._id'];
  }
  data['account._id'] = req.auth.account._id;
  data['account.title'] = req.auth.account.title;
  cb();
};
