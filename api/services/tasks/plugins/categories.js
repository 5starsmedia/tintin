'use strict';

var async = require('async'),
    moment = require('moment'),
    natural = require('natural'),
    TfIdf = natural.TfIdf,
    htmlToText = require('html-to-text'),
    summary = require('node-summary'),
    _ = require('lodash');

exports['db.categories.update'] = function (app, msg, cb) {
    var categories = {};
    async.auto({
        'category': function(next) {
            app.models.categories.findById(msg.body._id, next);
        },
        'site': ['category', function(next, data) {
            app.models.sites.findById(data.category.site._id, next);
        }],
        'descendants': ['category', function(next, data) {
            data.category.getDescendants(next);
        }],
        'categories': ['category', 'descendants', 'site', function(next, data) {
            async.each(data.descendants, function(item, next) {
                var urlFrom = app.services.url.urlFor('categories', item);
                item.parentAlias = data.category.alias;
                var urlTo = app.services.url.urlFor('categories', item);

                categories[item._id] = item;
                item.save(function() {
                    app.services.redirects.newRedirect(urlFrom, urlTo, data.site, next);
                });
            }, next);
        }],
        'posts': ['category', 'descendants', 'categories', function(next, data) {
            var ids = _.pluck(data.descendants, '_id');
            ids.push(msg.body._id);
            categories[msg.body._id] = data.category;
            app.models.posts.find({ 'category._id': { '$in': ids } }, next);
        }],
        'checkUrl': ['posts', 'category', 'site', function(next, res) {
            async.each(res.posts, function(item, next) {
                var urlFrom = app.services.url.urlFor('posts', item);
                item.category = categories[item.category._id];
                var urlTo = app.services.url.urlFor('posts', item);

                item.save(function() {
                    app.services.redirects.newRedirect(urlFrom, urlTo, res.site, next);
                });
            }, next);
        }]
    }, cb);
};