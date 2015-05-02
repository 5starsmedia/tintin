'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  yandex = require('yandex-search'),
  router = express.Router(),
  xml2js = require('xml2js'),
  fs = require('fs'),
  natural = require('natural'),
  metaphone = natural.Metaphone.process,
  stem = natural.PorterStemmerRu.stem,
  stopwords = natural.stopwords;


var scanKeyword = function (group, keyword, next) {

  var user = 'm-slobodianiuk',
    key = '03.266478028:a3acf5e282407d91686118bd9b79d416';

  var keywords = _.map(keyword.split(' '), function(word) {
      return stem(word);
    });

  async.auto({
    'keyword': function(next) {
      var keywordObj = _.find(group.scanResult.keywords, function(item) {
        return item.title == keyword
      });
      if (!keywordObj) {
        keywordObj = { title: keyword, sites: [] };
      }
      next(null, keywordObj);
    },
    'getYandex': ['keyword', function(next, data) {
      var url = 'http://xmlsearch.yandex.ru/xmlsearch?user=' + user + '&key=' + key;

      var xmlResults = data.keyword.yandexScanResult;
      if (xmlResults) {
        return next(null, xmlResults);
      }
      yandex({url: url, query: keyword}, function(err, xmlResults) {
        if (err) return next(err);
        data.keyword.yandexScanResult = xmlResults;
        next(null, xmlResults);
      });
    }],
    'parseYandex': ['getYandex', 'keyword', function(next, data) {
      xml2js.parseString(data.keyword.yandexScanResult, {trim: true}, function (err, result) {
        if (err) return next(err);
        if (result.yandexsearch.response[0].error) {
          return next({ msg: result.yandexsearch.response[0].error[0]._ });
        }
        var response = result.yandexsearch.response[0].results[0];
        next(null, response);
      });
    }],
    'groups': ['parseYandex', 'keyword', function(next, data) {
      var keywordInfo = data.keyword;

      var groups = data.parseYandex.grouping[0].group;

      keywordInfo.sites = _.map(groups, function(item) {
        var additionalsWords = item.doc[0].title[0].hlword || [];

        _.forEach(item.doc[0].passages, function(passage) {
          _.forEach(passage.passage, function(doc) {
            if (doc.hlword) {
              additionalsWords = _.union(additionalsWords, doc.hlword)
            }
          });
        });
        return {
          site: item.categ[0]['$'].name,
          additionalsWords: _.map(additionalsWords, function(word) {
            return {
              word: word,
              stem: stem(word)
            };
          }),
          url: item.doc[0].url[0]
        };
      });

      keywordInfo.additionalsWords = _.uniq(_.union.apply(_, _.map(keywordInfo.sites, function(site) {
        return _.filter(site.additionalsWords, function(word) { return _.indexOf(keywords, word.stem) == -1 });
      })), 'stem');

      next(null, keywordInfo)
    }]
  }, function(err, data) {
    if (err) { return next(err); }

    next(null, data.groups)
  });
};

router.post('/:id/run-scan', function (req, res, next) {
  async.auto({
    'group': function(next) {
      return req.app.models.keywordGroups.findById(req.params.id, next);
    },
    'setInProgress': ['group', function(next, data) {
      data.group.status = 'inprocess';
      data.group.save(next);
    }],
    'keywords': ['group', 'setInProgress', function(next, data) {
      var keywords = data.group.keywords.split("\n");

      async.mapLimit(keywords, 1, _.partial(scanKeyword, data.group), next);
    }],
    'calcUrls': ['keywords', function(next, data) {
      var keywords = data.keywords;

      var sites = [];
      _.forEach(keywords, function(keyword) {
        _.forEach(keyword.sites, function(site) {
          var el = _.find(sites, { url: site.url });
          if (el) {
            el.count++;
          } else {
            sites.push({
              url: site.url,
              count: 1
            })
          }
        });
      });
      sites = _.sortBy(sites, function(site) {
        return -site.count;
      });
      next(null, _.take(sites, 15));
    }],
    'saveGroup': ['group', 'calcUrls', 'keywords', function(next, data) {
      data.group.scanResult.lastDate = Date.now();
      data.group.result.urls = data.calcUrls;
      data.group.scanResult.keywords = data.keywords;
      data.group.status = 'scaned';
      data.group.save(next);
    }]
  }, function (err, data) {
    if (err) { return next(err); }

    return res.json(data.group);
  });
});

module.exports = router;