'use strict';

exports['post.strains'] = function (req, data, cb) {
  req.app.services.url.aliasFor(req.app, data.title, {}, function (err, alias) {
    if (err) { return cb(err); }
    data.alias = alias;
    cb();
  });
};

exports['put.strains'] = function (req, data, cb) {
  req.app.services.url.aliasFor(req.app, data.title, {}, function (err, alias) {
    if (err) { return cb(err); }
    data.alias = alias;
    cb();
  });
};
