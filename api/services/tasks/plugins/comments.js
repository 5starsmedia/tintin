'use strict';

exports['db.comments.insert'] = exports['db.comments.delete'] = function (app, msg, cb) {
  app.models.comments.findById(msg.body._id, function (err, comment) {
    if (err) { return cb(err); }
    app.models.comments.count({
      collectionName: comment.collectionName,
      resourceId: comment.resourceId,
      removed: {$exists: false}
    }, function (err, commentsCount) {
      if (err) { return cb(err); }
      app.models[comment.collectionName].findById(comment.resourceId, 'commentsCount lastComment', function (err, obj) {
        if (err) { return cb(err); }
        obj.commentsCount = commentsCount;
        obj.lastComment = comment.toObject();
        obj.save(cb);
      });
    });
  });
};

exports['db.accounts.update'] = function (app, msg, cb) {
  app.models.accounts.findById(msg.body._id, function (err, account) {
    if (err) { return cb(err); }
    if (account.coverFile) {
      app.models.comments.update({'account._id': account._id}, {account: account.toObject()}, {multi: true}, cb);
    } else {
      cb();
    }
  });
};

