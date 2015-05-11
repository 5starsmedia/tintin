'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  request = require('request'),
  cheerio = require('cheerio'),
  router = express.Router();

function parseHTML(content) {
  var result_urls = [];
  var $ = cheerio.load(content);

  // jQuery is now loaded on the jsdom window created from 'agent.body'
  $('h3.r a').each(function() {
    var url = $(this).attr("href").match(/url\?q=(\S+)&sa=/);
    if(url) {
      result_urls.push(url[1]);
    }
  });
  return result_urls;
}

router.post('/', function (req, res, next) {

  var keyword = 'как настроить вай фай на телефоне андроид';

  var url = 'http://bezprovodoff.com/wi-fi/nastrojka-wi-fi/kak-nastroit-wifi-na-telefone-android.html';

  request('http://www.google.com/search?num=100&complete=0&q=' + keyword, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var urls = parseHTML(body);

      var index = _.indexOf(urls, url)
      res.json(index);
    }
  });
});

module.exports = router;