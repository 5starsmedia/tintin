'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  router = express.Router();

router.get('/current', function (req, res, next) {
  res.json(req.site);
});

router.get('/settings', function (req, res, next) {
  res.header('Content-Type', 'application/javascript');

  var apiEntryPointHost = req.app.config.get('url');
  if (process.env.PAPHOS_SITE) {
    //@todo https
    apiEntryPointHost = 'http://' + req.headers.host;
  }

  var varName = req.query.name || 'settings',
    settingsJs = {
      ioEntryPoint: apiEntryPointHost + '/',
      apiEntryPoint: apiEntryPointHost + '/api',
      userIp: req.request.remoteAddress,
      settings: req.site.settings
  };

  res.end(varName + ' = ' + JSON.stringify(settingsJs));
});

module.exports = router;