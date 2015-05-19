'use strict';

var async = require('async');

exports['sitemap.generate'] = function (app, msg, next) {
  async.auto({
    sitemap: function (next) {
      app.models.sitemaps.create({}, next);
    },
    posts: function (next) {
      app.models.posts.find({ postType: 'post', published: true, removed: {$exists: false}}, next);
    },
    categories: function (next) {
      app.models.categories.find({removed: {$exists: false}}, next);
    },
    postsUrls: ['sitemap', 'posts', function (next, data) {
      async.each(data.posts, function (post, next) {
        var obj = {
          sitemap: data.sitemap.toObject(),
          collectionName: 'posts',
          resourceId: post._id,
          changefreq: 'daily',
          priority: 0.89,
          lastmod: post.modifyDate || post.createDate,
          loc: app.services.url.urlFor('posts', post), // app.config.get('url') + '/blog/' + blog.category.alias + '/' + blog.alias,
          images: []
        };
        if (post.coverFile && post.coverFile._id) {
          obj.images.push({
            loc: app.config.get('url') + '/api/files/' + post.coverFile._id,
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
    publishSitemap: ['postsUrls', function (next, data) {
      data.sitemap.isPublished = true;
      app.log.debug('[sitemap.generate]', 'Publishing sitemap', data.sitemap._id);
      data.sitemap.save(next);
    }]
  }, next);
};

