'use strict';

var url = require('url'),
  async = require('async'),
  cheerio = require('cheerio'),
  request = require('request'),
  Iconv  = require('iconv').Iconv,
  htmlToText = require('html-to-text'),
  sanitizeHtml = require('sanitize-html'),
  Boilerpipe = require('boilerpipe')

function CrawlerSvc(app) {
  this.app = app;
}

CrawlerSvc.prototype.getUrlContent = function (requestUrl, userAgent, next) {
  var app = this.app;
  async.auto({
    'cachedUrl': function(next) {
      app.models.crawledUrls.findOne({ url: requestUrl }, next);
    },
    'crawlUrl': ['cachedUrl', function(next, data) {
      if (data.cachedUrl && data.cachedUrl.code == 200) {
        return next(null, data.cachedUrl);
      }

      var options = {
        url: requestUrl,
        headers: {
          'User-Agent': userAgent
        },
        encoding: null,
        timeout: 3000
      };
      request(options, function (error, response, body) {
        if (error.code == 'ETIMEDOUT') {
          var urlObj = new app.models.crawledUrls();
          urlObj.url = requestUrl;
          urlObj.code = 408;
          urlObj.content = '';
          urlObj.encoding = null;
          urlObj.title = '';
          return next(null, urlObj);
        }
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
          try {
            var iconv = new Iconv(bodyEncoding, 'utf-8');
            body = iconv.convert(new Buffer(body)).toString();
          } catch (e) {
          }
        }

        var urlObj = new app.models.crawledUrls();
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
        html: data.crawlUrl.content || ''
      });

      boilerpipe.getHtml(function(err, text) {
        if (err) { return next(err); }

        text = sanitizeHtml(text || '', {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'h1', 'h2' ]),
          transformTags: {
            'div': function(tagName, attribs) {
              return {
                tagName: 'p'
              };
            },
            'a': function(tagName, attribs) {
              return {
                tagName: 'a',
                attribs: {
                  href: attribs.href || '',
                  target: '_blank'
                }
              };
            }
          }
        });
        text = text.replace(/\<\/ol\>(\W)/g, '</ol><p>$1');
        text = text.replace(/\<\/ul\>(\W)/g, '</ul><p>$1');
        text = text.replace(/\<\/h([1-6])\>(\W)/g, '</h$1><p>$2');
        text = text.replace(/\<\/blockquote\>(\W)/g, '</blockquote><p>$1');
        text = text.replace(/\<blockquote\>\<p\>/g, '<blockquote>$1');

        text = text.replace(/(\<p\>)+/g, '<p>');
        text = text.replace(/\<\/p\>/g, '');
        text = text.replace(/\<p\>\s*\<\/p\>/g, '');
        text = text.replace(/\<p\>\<h/g, '<h');
        text = text.replace(/\<p\>\<table/g, '<table');
        text = text.replace(/\<p\>\<ul/g, '<ul');
        //text = htmlToText.fromString(text, { wordwrap: 120 });*
        data.crawlUrl.text = text;
        next(null, text);
      });
    }],
    'saveCrawledUrl': ['parseText', function(next, data) {
      data.crawlUrl.save(next);
    }]
  }, function (err, data) {
    if (err) { return next(err); }

    next(null, data.crawlUrl);
  });
};

module.exports = CrawlerSvc;
