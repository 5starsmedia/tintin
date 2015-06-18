'use strict';

var async = require('async'),
  mongoose = require('mongoose'),
  url = require('url'),
  cheerio = require('cheerio'),
  moment = require('moment'),
  request = require('request'),
  htmlToText = require('html-to-text'),
  _ = require('lodash');

exports['seo.checkTextUnique'] = function (app, msg, cb) {
  async.auto({
    'post': function (next) {
      app.models.posts.findById(msg.body._id, next);
    },
    'checkText': ['post', function (next, data) {
      app.services.html.clearHtml(data.post.body, function(err, text) {
        text = htmlToText.fromString(text, { wordwrap: 120, tables: false, ignoreHref: true, ignoreImage: true });

        console.info(text.length, app.config.get('seo.text-ru.userkey'), text);
        var url = 'http://api.text.ru/post';
        request.post({
          url: url,
          form: {
            text: text,
            userkey: app.config.get('seo.text-ru.userkey')
          }
        }, function (error, response, body) {
          console.info(body);

          next();
        });
      });
    }]
  }, cb);
};