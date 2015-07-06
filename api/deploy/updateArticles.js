var mysql = require('mysql'),
  _ = require('lodash'),
  async = require('async'),
  moment = require('moment'),
  mongoose = require('mongoose'),
  request = require('request'),
  imageSize = require('image-size'),
  mime = require('mime');

var app = {};
app.log = require('../log.js');
app.config = require('../config.js');
app.models = require('../models');
var PostsModule = require('../modules/posts'),
  CommentsModule = require('../modules/comments'),
  KeywordsModule = require('../modules/keywords'),
  EcommerceModule = require('../modules/ecommerce'),
  UploadsModule = require('../modules/uploads'),
  MenuModule = require('../modules/menu'),
  WikiModule = require('../modules/wiki'),
  AdsModule = require('../modules/ads'),
  UsersModule = require('../modules/users'),
  SitesModule = require('../modules/sites'),
  SitemapModule = require('../modules/sitemap');

app.modules = {
  posts: new PostsModule(app),
  comments: new CommentsModule(app),
  keywords: new KeywordsModule(app),
  ecommerce: new EcommerceModule(app),
  uploads: new UploadsModule(app),
  menu: new MenuModule(app),
  wiki: new WikiModule(app),
  ads: new AdsModule(app),
  users: new UsersModule(app),
  sites: new SitesModule(app),
  sitemap: new SitemapModule(app),

  each: function(callFunc) {
    _.forEach(app.modules, function(obj, name) {
      if (typeof obj == 'object') {
        callFunc(obj);
      }
    });
  }
};
app.modules.each(function(moduleObj) {
  moduleObj.initModels();
});

function updateArticle(site, post, next) {
  console.info(post._id);
  app.services.mq.push(app, 'events', {
      name: 'db.posts.update',
      _id: post._id
    },
    next);
}

var siteDomain = 'beyklopov.ru';
async.auto({
  'mongoConnection': function (next) {
    app.log.debug('Connecting to mongodb...');
    mongoose.connect(app.config.get('mongodb'), next);
    mongoose.connection.on('error', function (err) {
      console.log(err);
    });
    mongoose.set('debug', false);
  },
  'site': ['mongoConnection', function (next) {
    app.models.sites.findOne({domain: siteDomain}, function (err, data) {
      if (!data) {
        data = new app.models.sites({domain: siteDomain});
      }
      data.save(function (err, site) {
        next(err, site);
      });
    });
  }],
  'updateArticle': ['mongoConnection', 'site', function(next, data) {
    app.models.products.find({ 'site._id': data.site._id }, function (err, rows) {
      if (err) throw err;
      async.each(rows, _.partial(updateArticle, data.site), next);
    });
  }]
}, function (err, data) {

  if (err) {
    console.info(err);
  }

  mongoose.connection.close(function (err) {
    app.log.debug('Mongodb connection successfully closed');
  });
});