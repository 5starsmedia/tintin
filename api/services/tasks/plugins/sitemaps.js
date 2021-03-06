'use strict';

var async = require('async'),
     _ = require('lodash');

exports['sitemap.generate'] = function (app, msg, next) {
  app.models.sites.find({ removed: { $exists: false } }, '_id domain', function(err, sites) {
    if (err) { return next(err); }

    _.forEach(sites, function (site) {
      app.log.debug('[sitemap.generate]', 'Send event for', site.domain, 'success');

      app.services.mq.push(app, 'events', {name: 'sitemap.generate.site', _id: site._id});
    });
    next();
  });
};

exports['sitemap.generate.site'] = function (app, msg, next) {
  async.auto({
    site: function (next) {
      app.models.sites.findById(msg.body._id, '_id domain', next);
    },
    sitemap: ['site', function (next, data) {
      app.models.sitemaps.create({
        site: {
          _id: data.site._id,
          domain: data.site.domain
        }
      }, next);
    }],
    posts: ['site', function (next, data) {
      app.models.posts.find({ 'site._id': data.site._id, postType: { $ne: 'page' }, published: true, removed: {$exists: false}}, next);
    }],
    categories: ['site', function (next, data) {
      app.models.categories.find({ 'site._id': data.site._id, parentId: { $ne: null }, removed: {$exists: false}}, next);
    }],
    homeUrl: ['sitemap', function (next, data) {
      var obj = {
        sitemap: data.sitemap.toObject(),
        changefreq: 'daily',
        priority: 1,
        loc: '/',
        images: []
      };
      app.models.sitemapUrls.create(obj, function (err) {
        if (err) { return next(err); }
        data.sitemap.urlsCount += 1;
        next();
      });
    }],
    postsUrls: ['sitemap', 'posts', function (next, data) {
      async.each(data.posts, function (post, next) {
        var obj = {
          sitemap: data.sitemap.toObject(),
          collectionName: 'posts',
          resourceId: post._id,
          changefreq: 'daily',
          priority: 0.89,
          lastmod: post.modifyDate || post.createDate,
          loc: app.services.url.urlFor('posts', post),
          images: []
        };
        if (post.coverFile && post.coverFile._id) {
          obj.images.push({
            loc: app.services.url.urlFor('files', post.coverFile),
            caption: post.coverFile.title
          });
        }
        app.models.sitemapUrls.create(obj, function (err) {
          if (err) { return next(err); }
          data.sitemap.urlsCount += 1;
          app.log.debug('[sitemap.generate]', 'Generating url for post', post._id, 'success');
          next();
        });
      }, next);
    }],
    categoriesUrls: ['sitemap', 'categories', function (next, data) {
      async.each(data.categories, function (category, next) {
        var obj = {
          sitemap: data.sitemap.toObject(),
          collectionName: 'categories',
          resourceId: category._id,
          changefreq: 'daily',
          priority: 0.5,
          lastmod: category.modifyDate || category.createDate,
          loc: app.services.url.urlFor('categories', category),
          images: []
        };
        if (!obj.loc) {
          return next();
        }
        if (category.coverFile && category.coverFile._id) {
          obj.images.push({
            loc: app.services.url.urlFor('files', category.coverFile),
            caption: category.coverFile.title
          });
        }
        app.models.sitemapUrls.create(obj, function (err) {
          if (err) { return next(err); }
          data.sitemap.urlsCount += 1;
          app.log.debug('[sitemap.generate]', 'Generating url for category', category._id, 'success');
          next();
        });
      }, next);
    }],
    publishSitemap: ['postsUrls', function (next, data) {
      data.sitemap.isPublished = true;
      app.log.debug('[sitemap.generate]', 'Publishing sitemap for ' + data.sitemap.site.domain, data.sitemap._id);
      data.sitemap.save(next);
    }]
  }, next);
};

