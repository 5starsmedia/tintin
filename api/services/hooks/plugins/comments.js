'use strict';

var _ = require('lodash');

function padNumberString(number, padStr) {
  var len = padStr.length;
  number = number.toString();
  return number.length >= len ? number : (padStr + number).slice(-len);
}

exports['post.comments'] = function (req, data, next) {
  if (data.isAnonymous) {
    if (req.auth.account) {
      data['realAccount._id'] = req.auth.account._id;
    }
    data.isAnonymous = true;
    data.account = null;
  } else if (req.auth.account) {
    data['account._id'] = req.auth.account._id;
    data['account.title'] = req.auth.account.title;
    data['account.coverFile'] = req.auth.account.coverFile;
    if (req.auth.account.imageUrl) {
      data['account.imageUrl'] = req.auth.account.imageUrl;
    }
  }
  req.app.services.sequence.getNext('comments', function (err, value) {
    var cid = padNumberString(value.toString(16).toLowerCase(), '0000000000');
    if (err) {return next(err);}
    if (data['parentComment._id']) {
      req.app.models.comments.findById(data['parentComment._id'], function (err, parentComment) {
        if (err) { return next(err); }
        if (!parentComment) {return next(req.app.errors.OperationError('Invalid parentComment._id'));}
        data.cid = parentComment.cid + '-' + cid;
        data.indent = parentComment.indent + 1;
        delete data['parentComment._id'];
        data.parentComment = parentComment.toObject();
        next();
      });
    } else {
      data.cid = cid;
      next();
    }
  });

};
