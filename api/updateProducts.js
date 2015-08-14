var  _ = require('lodash'),
  async = require('async'),
  moment = require('moment'),
  mongoose = require('mongoose');

var app = {};
app.log = require('./log.js');
app.config = require('./config.js');
app.models = require('./models');

var saveItem = function(site, item, next) {
  app.models.productCategories.findOne({ _id: item.category._id }, function(err, category) {
    item.category = {
      _id: category._id,
      title: category.title,
      alias: category.alias
    };
    item.save(next);
  });
};

var  siteDomain = 'seasons.5stars.link';
async.auto({
  'mongoConnection': function(next) {
    app.log.debug('Connecting to mongodb...');
    mongoose.connect(app.config.get('mongodb'), next);
    mongoose.connection.on('error', function (err) {
      console.log(err);
    });
    mongoose.set('debug', false);
  },
  'site': ['mongoConnection', function(next) {
    app.models.sites.findOne({ domain: siteDomain }, function(err, data) {
      if (!data) {
        data = new app.models.sites({ domain: siteDomain });
      }
      data.save(function(err, site) {
        next(err, site);
      });
    });
  }],
  'getProducts': ['mongoConnection', 'site', function(next, data) {
    app.models.products.find({ 'site._id': data.site._id }, function (err, rows) {
      if (err) throw err;
      async.each(rows, _.partial(saveItem, data.site), next);
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