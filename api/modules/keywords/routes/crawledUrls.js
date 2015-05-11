'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  router = express.Router(),
  fs = require('fs'),
  url = require('url'),
  request = require('request');


router.get('/', function (req, res, next) {
  var requestUrl = req.query.url;
  if (!requestUrl) {
    res.json({ empty: true });
    return;
  }

  req.app.services.crawler.getUrlContent(requestUrl, req.headers['user-agent'], function(err, crawlUrl) {
    if (err) { return next(err); }

    return res.json({
      code: crawlUrl.code,
      title: crawlUrl.title,
      text: crawlUrl.text,
      encoding: crawlUrl.encoding,
      createDate: crawlUrl.createDate
    });
  });
});

module.exports = router;