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
  stemmer = natural.PorterStemmerRu,
  htmlToText = require('html-to-text');


var scanKeyword = function (req, group, keyword, next) {

  var user = 'm-slobodianiuk',
    key = '03.266478028:a3acf5e282407d91686118bd9b79d416';

  var keywords = _.map(keyword.split(' '), function(word) {
      return stemmer.stem(word);
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
          return next(new req.app.errors.OperationError(result.yandexsearch.response[0].error[0]._));
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
              stem: stemmer.stem(word)
            };
          }),
          url: item.doc[0].url[0]
        };
      });

      keywordInfo.additionalsWords = _.uniq(_.union.apply(_, _.map(keywordInfo.sites, function(site) {
        return _.filter(site.additionalsWords, function(word) {
          if (word.word.length < 4) {
            return false;
          }
          return _.indexOf(keywords, word.stem) == -1
        });
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

      async.mapLimit(keywords, 3, _.partial(scanKeyword, req, data.group), next);
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
      sites = _.take(sites, 15);
      _.forEach(sites, function(value, n) {
        if (n <= 9) {
          value.use = true;
        }
      });
      next(null, sites);
    }],
    'calsAdditionalWords': ['keywords', function(next, data) {
      var additionalWords = [];
      _.forEach(data.keywords, function(keyword) {
        additionalWords = additionalWords.concat(keyword.additionalsWords);
      });
      additionalWords = _.map(additionalWords, function(item) {
        var word = item.word.toLowerCase();
        return {
          use: false,
          word: word,
          stem: stemmer.stem(word)
        };
      });
      additionalWords = _.uniq(additionalWords, 'stem');
      next(null, additionalWords);
    }],
    'saveGroup': ['group', 'calcUrls', 'calsAdditionalWords', 'keywords', function(next, data) {
      data.group.scanResult.lastDate = Date.now();
      data.group.result.urls = data.calcUrls;
      data.group.result.additionalsWords = data.calsAdditionalWords;
      data.group.scanResult.keywords = data.keywords;
      data.group.status = 'scaned';
      data.group.save(function(err) {
        if (err) { return next(err); }
        next(null, data.group)
      });
    }]
  }, function (err, data) {
    if (err) { return next(err); }

    return res.json(data.saveGroup);
  });
});

var scanUrl = function(req, urlObj, next) {
  req.app.services.crawler.getUrlContent(urlObj.url, req.headers['user-agent'], function(err, crawlUrl) {
    if (err) { return next(err); }

    next(null, crawlUrl);
  });
};

router.put('/:id/scan', function (req, res, next) {
  async.auto({
    'group': function(next) {
      return req.app.models.keywordGroups.findById(req.params.id, next);
    },
    'parseUrls': ['group', function(next, data) {
      var urls = _.filter(data.group.result.urls, 'use', true);

      async.mapLimit(urls, 3, _.partial(scanUrl, req), next);
    }],
    'cleanUrls': ['parseUrls', function(next, data) {
      var num = 0,
        urls = _.map(data.parseUrls, function(url) {
          num += 1;
          var text = htmlToText.fromString(url.text, {
              ignoreImage: true,
              ignoreHref: true,
              wordwrap: 1000
            }),
            strings = text.split(/[\.\n\?!]/);

          strings = _.filter(strings, function(string) {
            string = _.trim(string);
            if (string.length < 5) { return false; }
            return true;
          });
          return {
            url: url.url,
            strings: strings,
            textLength: text.length,
            isTop3: num < 4,
            isTop10: num < 10
          };
        });

      next(null, urls);
    }],
    'recomendation': ['group', 'cleanUrls', function(next, data) {
      stemmer.attach();

      var keywords = data.group.keywords.split("\n"),
        textLength = 0;

      var data = _.map(keywords, function(keyword) {
        var keywordTokens = keyword.split(' ');
        keywordTokens = _.filter(keywordTokens, function(word) {
          return word.length > 3;
        });
        keywordTokens = _.map(keywordTokens, function(word) {
          return stemmer.stem(word);
        });

        textLength = 0;
        var exactEntry = 0,
          inExactEntry = 0,
          exactEntryInTop3 = 0,
          inExactEntryInTop3 = 0;
        _.forEach(data.cleanUrls, function(url) {
          textLength += url.textLength;
          _.forEach(url.strings, function(string) {
            if (string.indexOf(keyword) != -1) {
              exactEntry++;
              if (url.isTop3) {
                exactEntryInTop3++;
              }
            }
            if (_.intersection(string.tokenizeAndStem(), keywordTokens).length == keywordTokens.length) {
              inExactEntry++;
              if (url.isTop3) {
                inExactEntryInTop3++;
              }
            }
          });
        });
        textLength /= data.cleanUrls.length;

        textLength = Math.round(textLength / 100) * 100;

        var entry = Math.ceil((exactEntry + inExactEntry) / data.cleanUrls.length),
          entryInTop3 = Math.ceil((exactEntryInTop3 + inExactEntryInTop3) / 3),
          useType = 'both';

        if (inExactEntry > 0) {
          useType = 'inexact';
        }
        if (entry > 0) {
          useType = 'exact';
        }

        return {
          keyword: keyword,
          entry: entry,
          entryInTop3: entryInTop3,
          useEntry: Math.round((entry + entryInTop3) / 2),
          useType: useType
        };
      });
      var  minTextLength = textLength - textLength * 0.3, maxTextLength = textLength;

      minTextLength = Math.round(minTextLength / 100) * 100;
      maxTextLength = Math.round(maxTextLength / 100) * 100;

      // Текст не может быть меньше 500 символов
      if (minTextLength < 500) {
        minTextLength = 500;
      }
      if (maxTextLength < 500) {
        maxTextLength = 500;
      }

      next(null, {
        minTextLength: minTextLength,
        maxTextLength: maxTextLength,
        keywords: data
      });
    }],
    'saveGroup': ['group', 'recomendation', function(next, data) {
      data.group.status = 'finded';
      data.group.recomendation = data.recomendation;
      data.group.save(next);
    }]
  }, function (err, data) {
    if (err) { return next(err); }

    return res.json(data.group);
  });
});

module.exports = router;