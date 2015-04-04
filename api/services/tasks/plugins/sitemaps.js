/**
 * @copyright 2015 Cannasos.com. All rights reserved.
 * ToDo: Add priority by Contribution System Points
 */

'use strict';

var async = require('async');

exports['sitemap.generate'] = function (app, msg, next) {
  async.auto({
    sitemap: function (next) {
      app.models.sitemaps.create({}, next);
    },
    blogs: function (next) {
      app.models.blogs.find({published: true, removed: {$exists: false}}, next);
    },
    advices: function (next) {
      app.models.advices.find({removed: {$exists: false}}, next);
    },
    strains: function (next) {
      app.models.strains.find({removed: {$exists: false}}, next);
    },
    strainReviews: function (next) {
      app.models.strainReviews.find({published: true, removed: {$exists: false}}, next);
    },
    blogUrls: ['sitemap', 'blogs', function (next, data) {
      async.each(data.blogs, function (blog, next) {
        var obj = {
          sitemap: data.sitemap.toObject(),
          collectionName: 'blogs',
          resourceId: blog._id,
          changefreq: 'daily',
          priority: 0.89,
          lastmod: blog.modifyDate || blog.createDate,
          loc: app.config.get('url') + '/blog/' + blog.category.alias + '/' + blog.alias,
          images: []
        };
        if (blog.coverFile && blog.coverFile._id) {
          obj.images.push({
            loc: app.config.get('url') + '/api/files/' + blog.coverFile._id,
            caption: blog.coverFile.title
          });
        }
        app.models.sitemapUrls.create(obj, function (err) {
          if (err) { return next(err); }
          data.sitemap.urlsCount += 1;
          app.log.debug('[sitemap.generate]', 'Generating url for blog', blog._id, 'success');
          next();
        });
      }, next);
    }],
    adviceUrls: ['sitemap', 'advices', function (next, data) {
      async.each(data.advices, function (advice, next) {
        app.models.sitemapUrls.create({
          sitemap: data.sitemap.toObject(),
          collectionName: 'advices',
          resourceId: advice._id,
          changefreq: 'daily',
          priority: 0.89,
          lastmod: advice.modifyDate || advice.createDate,
          loc: app.config.get('url') + '/advice/' + advice.category.alias + '/' + advice._id
        }, function (err) {
          if (err) { return next(err); }
          data.sitemap.urlsCount += 1;
          app.log.debug('[sitemap.generate]', 'Generating url for advice', advice._id, 'success');
          next();
        });
      }, next);
    }],
    strainUrls: ['sitemap', 'strains', function (next, data) {
      async.each(data.strains, function (strain, next) {
        var obj = {
          sitemap: data.sitemap.toObject(),
          collectionName: 'strains',
          resourceId: strain._id,
          changefreq: 'daily',
          priority: 0.89,
          lastmod: strain.modifyDate || strain.createDate,
          loc: app.config.get('url') + '/strains/' + strain.category.alias + '/' + strain.alias,
          images: app.config.get('url') + '/strains/' + strain.category.alias + '/logo.png'
        };
        app.models.sitemapUrls.create(obj, function (err) {
          if (err) { return next(err); }
          data.sitemap.urlsCount += 1;
          app.log.debug('[sitemap.generate]', 'Generating url for strain "%s" success', strain.title);
          next();
        });
      }, next);
    }],
    strainReviewUrls: ['sitemap', 'strainReviews', function (next, data) {
      async.each(data.strainReviews, function (strainReview, next) {
        app.models.sitemapUrls.create({
          sitemap: data.sitemap.toObject(),
          collectionName: 'strainReviews',
          resourceId: strainReview._id,
          changefreq: 'daily',
          priority: 0.89,
          lastmod: strainReview.modifyDate || strainReview.createDate,
          loc: app.config.get('url') + '/strains/' + strainReview.strain.category.alias + '/' + strainReview.strain.alias + '/reviews/' + strainReview._id
        }, function (err) {
          if (err) { return next(err); }
          data.sitemap.urlsCount += 1;
          app.log.debug('[sitemap.generate]', 'Generating url for strainReview', strainReview._id, 'success');
          next();
        });
      }, next);
    }],
    publishSitemap: ['blogUrls', 'adviceUrls', 'strainUrls', 'strainReviewUrls', function (next, data) {
      data.sitemap.isPublished = true;
      app.log.debug('[sitemap.generate]', 'Publishing sitemap', data.sitemap._id);
      data.sitemap.save(next);
    }]
  }, next);
};

