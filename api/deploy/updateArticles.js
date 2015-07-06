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
  'init': function (next) {
    async.series([
      _.partial(async.parallel, [
        _.partial(app.services.mail.init, app),
        _.partial(app.services.data.loadResources, app),
        _.partial(app.services.modifiers.loadPlugins, app),
        _.partial(app.services.validation.loadValidators, app),
        _.partial(app.services.hooks.loadPlugins, app),
        app.services.broadcast.init.bind(app.services.broadcast),
        app.services.tasks.init.bind(app.services.tasks),
        app.services.states.init.bind(app.services.states)
      ])
    ], next)
  },
  'mongoConnection': ['init', function (next) {
    app.log.debug('Connecting to mongodb...');
    mongoose.connect(app.config.get('mongodb'), next);
    mongoose.connection.on('error', function (err) {
      console.log(err);
    });
    mongoose.set('debug', false);
  }],
  'site': ['mongoConnection', function (next) {
    app.models.sites.findOne({domain: siteDomain}, next);
  }],
  'updateArticle': ['mongoConnection', 'site', function (next, data) {
    app.services.tasks.start();
    app.services.states.start();

    app.models.posts.find({'site._id': data.site._id}, function (err, rows) {
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