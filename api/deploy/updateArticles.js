var mysql = require('mysql'),
  _ = require('lodash'),
  async = require('async'),
  moment = require('moment'),
  mongoose = require('mongoose'),
  request = require('request'),
  imageSize = require('image-size'),
  mime = require('mime');

var app = require('../server.js').app;

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
    app.models.posts.find({ 'site._id': data.site._id }, function (err, rows) {
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