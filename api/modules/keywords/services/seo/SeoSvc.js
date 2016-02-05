'use strict';

var async = require('async'),
  request = require('request'),
  _ = require('lodash');

function SeoSvc(app) {
  this.app = app;
}

SeoSvc.prototype.getModelByResource = function (site, collectionName, resourceId, next) {
  var app = this.app;

  async.auto({
    'urlModel': function(next) {
      var params = {
        collectionName: collectionName,
        resourceId: resourceId,
        'site._id': site._id
      };
      app.models.seoUrls.findOne(params, function(err, urlModel) {
        if (err) { return next(err); }

        if (!urlModel) {
          urlModel = new app.models.seoUrls(params);
        }
        next(null, urlModel);
      });
    },
    'resource': function(next) {
      app.models[collectionName].findById(resourceId, next);
    },
    'keywordGroup': ['resource', function(next, data) {
      if (!data.resource.keywordGroup || !data.resource.keywordGroup._id) {
        return next();
      }
      app.models.publicationSpecifications.findById(data.resource.keywordGroup._id, '_id keywords', next);
    }],
    'checkRedirect': ['urlModel', 'resource', 'keywordGroup', function(next, data) {
      var url = app.services.url.urlFor(collectionName, data.resource);

      if (data.urlModel.link && data.urlModel.link != url && url) {
        data.urlModel.linkHistory = data.urlModel.linkHistory || [];
        data.urlModel.linkHistory.push({
          link: url,
          modifyDate: new Date()
        });
      }
      data.urlModel.link = url;
      data.urlModel.keywordGroup = data.keywordGroup;
      data.urlModel.site = site;
      data.urlModel.save(next);
    }]
  }, function (err, data) {
    if (err) { return next(err); }

    next(null, data.urlModel);
  });
};

module.exports = SeoSvc;
