'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  rss = require('rss'),
  htmlToText = require('html-to-text'),
  router = express.Router();

router.get('/', function (req, res, next) {
  async.auto({
    'rss': function(next) {
      var feed = new rss({
        title: req.site.title || '',
        description: '',
        feed_url: req.app.config.get('url') + req.request.url,
        site_url: req.app.config.get('url'),
        //image_url: 'http://news.vn.ua/assets/img/rss_logo.png',
        //managingEditor: 'info@news.vn.ua (Редакція)',
        //webMaster: 'esvit666@gmail.com (Vitalii Savchuk)',
        //language: 'uk',
        //]]categories: ['Category 1','Category 2','Category 3'],
        pubDate: new Date(),
        ttl: '60',
        custom_namespaces: {
          'yandex': 'http://news.yandex.ru'
        }
      });
      next(null, feed);
    },
    'posts': function(next) {
      req.app.models.posts.find({ status: 4, removed: { $exists: false }, postType: 'post' }, next);
    },
    'items': ['posts', 'rss', function(next, data) {
      _.forEach(data.posts, function(item) {
        var text = htmlToText.fromString(item.body, {wordwrap: 120, tables: false, ignoreHref: true, ignoreImage: true});
        data.rss.item({
          title: item.title,
          description: text,
          url: req.site.url + req.app.services.url.urlFor('posts', item), // link to the item
          categories: [item.category.title], // optional - array of item categories
          author: item.account.title, // optional - defaults to feed author property
          date: item.createDate, // any format that js Date can parse.
          custom_elements: [
            {'yandex:full-text': item.body},
            {'yandex:genre': 'article'}
          ]
        });
      });
      next();
    }]
  }, function(err, data) {
    if (err) { return next(err); }

    res.set('Content-Type', 'text/xml');
    res.end(data.rss.xml());
  });
});

module.exports = router;