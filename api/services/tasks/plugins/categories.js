'use strict';

var async = require('async'),
    moment = require('moment'),
    natural = require('natural'),
    TfIdf = natural.TfIdf,
    htmlToText = require('html-to-text'),
    summary = require('node-summary'),
    _ = require('lodash');

exports['db.categories.update'] = function (app, msg, cb) {
    async.auto({
        'category': function(next) {
            app.models.categories.findById(msg.body._id, next);
        },
        'descendants': ['category', function(next, data) {
            data.category.getDescendants(next);
        }],
        'posts': ['category', 'descendants', function(next, data) {
            var ids = _.pluck(data.descendants, '_id');
            ids.push(msg.body._id);
            app.models.posts.find({ 'category._id': { '$in': ids } }, next);
        }],
        'site': ['category', function(next, data) {
            app.models.sites.findById(data.category.site._id, next);
        }],
        'checkUrl': ['posts', 'category', 'site', function(next, res) {
            console.info(res.posts)
            async.each(res.posts, function(item, next) {
                var urlFrom = app.services.url.urlFor('posts', item);
                item.category = res.category;
                var urlTo = app.services.url.urlFor('posts', item);

                item.save(function() {
                    app.services.redirects.newRedirect(urlFrom, urlTo, res.site, next);
                });
            }, next);
        }]
    }, cb);
};