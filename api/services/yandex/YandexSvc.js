'use strict';

var async = require('async'),
  request = require('request'),
  cheerio = require('cheerio'),
  yandex = require('yandex-search'),
  xml2js = require('xml2js'),
  _ = require('lodash');

function YandexSvc(app) {
  this.app = app;
}

YandexSvc.prototype.getApiUrl = function (keyword, options, next) {
  return 'https://xmlsearch.yandex.ru/xmlsearch?user=esvit&key=03.9573926:0f453a40cd2d029a3143334941a90fda&lr=213&filter=none';

  var user = 'm-slobodianiuk',
    key = '03.266478028:a3acf5e282407d91686118bd9b79d416';

  return 'http://xmlsearch.yandex.ru/xmlsearch?user=' + user + '&key=' + key;
};

YandexSvc.prototype.searchByKeyword = function (keyword, options, next) {
  var url = this.getApiUrl(),
    self = this;

  yandex({url: url, query: keyword, groupby: {
        mode: 'deep',
        attr: 'd',
        groupsOnPage: options.count || 10,
        docsInGroup: 1
      }
    }, function(err, xmlResults) {
    if (err) return next(err);
    //data.keyword.yandexScanResult = xmlResults;

    xml2js.parseString(xmlResults, {trim: true}, function (err, result) {
      if (err) return next(err);

      if (result.yandexsearch.response[0].error) {
        return next(new self.app.errors.OperationError(result.yandexsearch.response[0].error[0]._));
      }

      var response = result.yandexsearch.response[0].results[0];
      next(null, response);
    });
  });
};

YandexSvc.prototype.getSitesByKeyword = function (keyword, options, next) {
  this.searchByKeyword(keyword, options, function(err, result) {
    if (err) { return next(err); }

    var groups = result.grouping[0].group,
      urls = _.map(groups, function(item) {
        return item.doc[0].url[0];
      });

    next(null, urls);
  });
};

YandexSvc.prototype.getUrlPosition = function (url, keyword, options, next) {
  this.getSitesByKeyword(keyword, options, function(err, urls) {
    if (err) { return next(err); }

    next(null, _.indexOf(urls, url));
  });
};

module.exports = YandexSvc;
