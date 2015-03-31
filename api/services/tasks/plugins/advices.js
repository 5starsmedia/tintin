'use strict';

exports['db.advices.insert'] = exports['db.advices.update'] = function (app, msg, cb) {
  app.models.advices.findById(msg.body._id, 'category account', function (err, advice) {
    if (err) { return cb(err); }
    app.models.adviceCategories.findById(advice.category._id, function (err, category) {
      if (err) { return cb(err); }
      advice.category.title = category.title;
      advice.category.alias = category.alias;

      app.models.accounts.findById(advice.account._id, function (err, account) {
        if (err) { return cb(err); }
        advice.account.title = account.title;
        advice.save(cb);
      });
    });
  });
};

exports['db.accounts.update'] = function (app, msg, cb) {
  app.models.accounts.findById(msg.body._id, function (err, account) {
    if (err) { return cb(err); }
    if (account.coverFile) {
      app.models.advices.update({'account._id': account._id}, {account: account.toObject()}, {multi: true}, cb);
    } else {
      cb();
    }
  });
};
