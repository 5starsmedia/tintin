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
  res.header('Content-Type', 'text/html');

  var file = req.site.yandexWebmasterTxt || '';
  file = file.replace('.html', '').replace('.txt', '').replace('yandex_', '');

  if (file != '' && req.query.id == file) {
    var content = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body>Verification: ' + req.site.yandexWebmasterTxt + '</body></html>';
    res.end(content);
  } else {
    res.status(404).end('Sorry!' + file);
  }
});

router.get('/google', function (req, res, next) {
  res.header('Content-Type', 'text/html');

  var file = req.site.googleWebmasterTxt || '';
  file = file.replace('.html', '').replace('.txt', '').replace('google', '');

  if (file != '' && req.query.id == file) {
    res.end('google-site-verification: ' + req.site.googleWebmasterTxt);
  } else {
    res.status(404).end('Sorry!' + file);
  }
});

module.exports = router;