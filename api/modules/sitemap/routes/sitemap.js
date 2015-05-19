/**
 * @copyright 2015 Cannasos.com. All rights reserved.
 */

'use strict';

var express = require('express'),
  util = require('util'),
  router = express.Router();

router.get('/sitemap.xml', function (req, res, next) {
  req.app.models.sitemaps.find({isPublished: true, removed: {$exists: false}}, '_id', {sort: '-createDate', limit: 1},
    function (err, sitemaps) {
      if (err) {return next(err); }
      if (sitemaps.length === 0) { return next(new req.app.errors.NotFoundError('No sitemaps found')); }
      var sitemap = sitemaps[0];
      res.set('x-sitemap-id', sitemap._id.toString());
      res.set('Content-Type', 'application/xml');
      res.write('<?xml version="1.0" encoding="UTF-8"?>');
      res.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">');
      var stream = req.app.models.sitemapUrls.find({'sitemap._id': sitemap._id}).stream();
      stream.on('data', function (sitemapUrl) {
        res.write('<url>');
        res.write(util.format('<loc>%s</loc>', sitemapUrl.loc));
        res.write(util.format('<priority>%s</priority>', sitemapUrl.priority));
        res.write(util.format('<changefreq>%s</changefreq>', sitemapUrl.changefreq));
        res.write(util.format('<lastmod>%s</lastmod>', sitemapUrl.lastmod.toISOString()));
        if (sitemapUrl.images && sitemapUrl.images.length > 0) {
          var imagesLength = sitemapUrl.images.length;
          for (var i = 0; i < imagesLength; i += 1) {
            res.write('<image:image>');
            res.write(util.format('<image:loc>%s</image:loc>', sitemapUrl.images[i].loc));
            if (sitemapUrl.images[i].caption && sitemapUrl.images[i].caption.length > 0) {
              res.write(util.format('<image:caption>%s</image:caption>', sitemapUrl.images[i].caption));
            }
            res.write('</image:image>');
          }
        }
        res.write('</url>');
      });
      stream.on('error', next);

      stream.on('close', function () {
        res.write('</urlset>');

        res.status(200);
        res.send();
      });
    });
});

module.exports = router;
