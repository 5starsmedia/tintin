'use strict';

var _ = require('lodash');

module.exports = function () {
  return function (req, res, next) {
    var host = req.headers.host

    if (!host) {
      return
    }

    var offset = host[0] === '[' ? host.indexOf(']') + 1 : 0;
    var index = host.indexOf(':', offset)

    host = (index !== -1) ? host.substring(0, index) : host;

    req.app.models.sites.findOne({'domain': host}, function (err, site) {
      if (err) {
        return next(err);
      }
      if (!site) {
        res.status(418).json({ domain: host, msg: 'I\'m a teapot' });
        return;
      }
      req.site = site;
      next();
    });
  };
};