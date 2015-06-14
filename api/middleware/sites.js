'use strict';

var _ = require('lodash');

module.exports = function () {
  return function (req, res, next) {
    var host = req.headers.host, port = 80;

    if (process.env.PAPHOS_SITE) {
      host = process.env.PAPHOS_SITE;
    }

    if (!host) {
      return;
    }

    var offset = host[0] === '[' ? host.indexOf(']') + 1 : 0;
    var index = host.indexOf(':', offset)

    if (index > -1) {
      port = host.substring(index + 1);
    }
    host = (index !== -1) ? host.substring(0, index) : host;

    req.app.models.sites.findOne({ domain: host, port: port }, function (err, site) {
      if (err) {
        return next(err);
      }
      if (!site) {
        res.status(418).json({ domain: host, msg: 'I\'m a teapot', port: port });
        return;
      }
      req.site = site;

      var url = site.isHttps ? 'https' : 'http';
      url += '://' + site.domain;
      if (site.port && site.port != 80) {
        url += ':' + site.port;
      }
      req.app.config.set('url', url);

      next();
    });
  };
};