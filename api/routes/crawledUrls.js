'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  router = express.Router(),
  fs = require('fs'),
  url = require('url'),
  cheerio = require('cheerio'),
  request = require('request'),
  Iconv  = require('iconv').Iconv,
  Boilerpipe = require('boilerpipe');


router.get('/', function (req, res, next) {
  var requestUrl = req.query.url;
  if (!requestUrl) {
    res.json({ empty: true });
    return;
  }
  async.auto({
    'cachedUrl': function(next) {
      req.app.models.crawledUrls.findOne({ url: requestUrl }, next);
    },
    'crawlUrl': ['cachedUrl', function(next, data) {
      if (data.cachedUrl && data.cachedUrl.code == 200) {
        return next(null, data.cachedUrl);
      }

      var options = {
        url: requestUrl,
        headers: {
          'User-Agent': req.headers['user-agent']
        },
        encoding: null
      };
      request(options, function (error, response, body) {
        if (error) { return next(error); }

        var bodyEncoding = null, result,
          header = response.headers['content-type'];

        if (header && (result = header.match(/charset=([a-zA-Z0-9-]+)/))) {
          if (result && result[1]) {
            bodyEncoding = result[1];
          }
        } else if (result = body.toString().match(/charset=([a-zA-Z0-9-]+)/)) {
          if (result[1]) {
            bodyEncoding = result[1];
          }
        }
        if (bodyEncoding && bodyEncoding.toLowerCase() == 'utf-8') {
          bodyEncoding = null;
        }
        if (bodyEncoding) {
          var iconv = new Iconv(bodyEncoding, 'utf-8');
          body = iconv.convert(new Buffer(body)).toString();
        }

        var urlObj = new req.app.models.crawledUrls();
        urlObj.url = requestUrl;
        urlObj.code = response.statusCode;
        urlObj.content = body;
        urlObj.encoding = bodyEncoding;

        var $ = cheerio.load(body);
        urlObj.title = $('title').text();
        next(null, urlObj);
      });
    }],
    'parseText': ['crawlUrl', function(next, data) {
      var boilerpipe = new Boilerpipe({
        extractor: Boilerpipe.Extractor.Article,
        html: data.crawlUrl.content
      });

      boilerpipe.getText(function(err, text) {
        if (err) { return next(err); }
        data.crawlUrl.text = text;
        next(null, text);
      });
    }],
    'saveCrawledUrl': ['parseText', function(next, data) {
      data.crawlUrl.save(next);
    }]
  }, function (err, data) {
    if (err) { return next(err); }

    return res.json({
      code: data.crawlUrl.code,
      title: data.crawlUrl.title,
      text: data.crawlUrl.text,
      encoding: data.crawlUrl.encoding,
      createDate: data.crawlUrl.createDate
    });
  });
});

module.exports = router;