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
        'posts': function(next) {
            app.models.posts.find({ 'category._id': msg.body._id }, next);
        },
        'category': function(next) {
            app.models.categories.findById(msg.body._id, next);
        },
        'site': ['category', function(next, data) {
            app.models.sites.findById(data.category.site._id, next);
        }],
        'checkUrl': ['posts', 'category', 'site', function(next, res) {
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