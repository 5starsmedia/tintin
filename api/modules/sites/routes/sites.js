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

router.get('/robots', function (req, res, next) {
  res.header('Content-Type', 'text/plain');

  req.site.robotsTxt = req.site.robotsTxt || '';

  res.end(req.site.robotsTxt);
});

router.get('/yandex', function (req, res, next) {
  res.header('Content-Type', 'text/plain');

  var file = req.site.yandexWebmasterTxt || '';
  file = file.replace('.html', '').replace('.txt', '').replace('yandex_', '');

  if (file != '' && req.query.id == file) {
    res.end(req.site.yandexWebmasterTxt);
  } else {
    res.status(404).end('Sorry!' + file);
  }
});

module.exports = router;