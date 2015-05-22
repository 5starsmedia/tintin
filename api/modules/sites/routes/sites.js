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

  var varName = req.query.name || 'settings',
    settingsJs = {
      apiEntryPoint: req.app.config.get('url') + '/api',
      userIp: req.request.remoteAddress,
      settings: req.site.settings
  };

  res.end(varName + ' = ' + JSON.stringify(settingsJs));
});

module.exports = router;