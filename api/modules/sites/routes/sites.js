'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  router = express.Router();

router.get('/current', function (req, res, next) {
  async.auto({
    'site': function(next) {
      next(null, req.site);
    },
    'text': function(next) {
      req.app.services.data.getResource('tz', next)
    },
    'checkText': ['site', 'text', function (next, data) {
      if (!_.get(data.site, 'tz.defaultText')) {
        _.set(data.site, 'tz.defaultText', data.text['default-tz-text']);
      }
      next(null, data.site);
    }]
  }, function(err, data) {
    if (err) { return next(err); }

    if (req.query.fields) {

    }
    res.json(data.checkText);
  });
});

router.get('/settings', function (req, res, next) {
  res.header('Content-Type', 'application/javascript');

  async.auto({
    'sections': function(next) {
      req.app.models.sections.find({'site._id': req.site._id}, next)
    }
  }, function(err, data) {
    if (err) { return next(err); }

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
          settings: req.site.settings,
          sections: {}
        };

    _.each(data.sections, function(section) {
      settingsJs.sections['section' + section._id] = section.htmlCode;
    });

    res.end(varName + ' = ' + JSON.stringify(settingsJs));
  });

});

router.get('/sections', function (req, res, next) {
  res.header('Content-Type', 'text/css');

  async.auto({
    'sections': function(next) {
      req.app.models.sections.find({'site._id': req.site._id}, next)
    }
  }, function(err, data) {
    if (err) { return next(err); }

    var css = '';
    _.each(data.sections, function(section) {
      css += section.cssCode + "\n";
    });

    res.end(css);
  });

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
    var content = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body>Verification: ' + file + '</body></html>';
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

router.get('/locales', function (req, res, next) {
  async.auto({
    'locales': function(next) {
      req.app.services.data.getResource('locales', next)
    }
  }, function(err, data) {
    if (err) { return next(err); }

    res.json(data.locales);
  });
});

module.exports = router;