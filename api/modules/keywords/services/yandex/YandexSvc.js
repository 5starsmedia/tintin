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

YandexSvc.prototype.getApiUrl = function (site) {
  return site.yandexXml;
};

YandexSvc.prototype.searchByKeyword = function (site, keyword, options, next) {
  var url = this.getApiUrl(site),
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

YandexSvc.prototype.getSitesByKeyword = function (site, keyword, options, next) {
  this.searchByKeyword(site, keyword, options, function(err, result) {
    if (err) { return next(err); }

    var groups = result.grouping[0].group,
      urls = _.map(groups, function(item) {
        return item.doc[0].url[0];
      });

    next(null, urls);
  });
};

YandexSvc.prototype.getUrlPosition = function (site, url, keyword, options, next) {
  this.getSitesByKeyword(site, keyword, options, function(err, urls) {
    if (err) { return next(err); }

    next(null, _.indexOf(urls, url));
  });
};

module.exports = YandexSvc;
