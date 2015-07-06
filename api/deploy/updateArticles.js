var mysql = require('mysql'),
  _ = require('lodash'),
  async = require('async'),
  moment = require('moment'),
  mongoose = require('mongoose'),
  Grid = mongoose.mongo.Grid,
  request = require('request'),
  imageSize = require('image-size'),
  mime = require('mime');
var url = require('url');
var http = require('http');
var PHPUnserialize = require('php-unserialize');
var grid;


var tablePrefix = 'zo_',
  siteDomain = 'beyklopov.ru',
  databaseName = 'beyklopo_db';

var app = {};
app.log = require('./log.js');
app.config = require('./config.js');
app.models = require('./models');
var PostsModule = require('./modules/posts'),
  CommentsModule = require('./modules/comments'),
  KeywordsModule = require('./modules/keywords'),
  EcommerceModule = require('./modules/ecommerce'),
  UploadsModule = require('./modules/uploads'),
  MenuModule = require('./modules/menu'),
  WikiModule = require('./modules/wiki'),
  AdsModule = require('./modules/ads'),
  UsersModule = require('./modules/users'),
  SitesModule = require('./modules/sites'),
  SitemapModule = require('./modules/sitemap');

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

async.auto({
  'mongoConnection': function (next) {
    app.log.debug('Connecting to mongodb...');
    mongoose.connect(app.config.get('mongodb'), next);
    mongoose.connection.on('error', function (err) {
      console.log(err);
    });
    mongoose.set('debug', false);
  },
  'connection': function (next) {
    var connection = mysql.createConnection({
      host: 'mistinfo.com',
      port: 3310,
      user: 'remote',
      password: 'gfhjkm666',
      database: databaseName
    });
    connection.connect();
    next(null, connection);
  },
  'site': ['mongoConnection', function (next) {
    grid = new Grid(mongoose.connection.db, 'fs');
    app.models.sites.findOne({domain: siteDomain}, function (err, data) {
      if (!data) {
        data = new app.models.sites({domain: siteDomain});
      }
      data.save(function (err, site) {
        next(err, site);
      });
    });
  }],
  'categories': ['connection', 'site', function (next, data) {
    data.connection.query('SELECT * FROM ' + tablePrefix + 'term_taxonomy WHERE taxonomy = "category" ORDER BY parent', function (err, rows, fields) {
      if (err) throw err;

      async.eachSeries(rows, _.partial(saveCategory, data.site, data.connection), next);
    });
  }],
  'getPosts': ['categories', 'connection', function (next, data) {
    data.connection.query('SELECT * FROM ' + tablePrefix + 'posts WHERE post_status = "publish" AND post_type = "post" OR post_type = "page"', function (err, rows, fields) {
      if (err) throw err;

      async.eachSeries(rows, _.partial(saveItem, data.site, data.connection), next);
    });
  }]
}, function (err, data) {

  if (err) {
    console.info(err);
  }

  data.connection.end();
  mongoose.connection.close(function (err) {
    app.log.debug('Mongodb connection successfully closed');
  });
});