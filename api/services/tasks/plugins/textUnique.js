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

        var url = 'http://api.text.ru/post';
        request.post({
          url: url,
          form: {
            text: text,
            userkey: app.config.get('seo.text-ru.userkey')
          }
        }, function (error, response, body) {
          body = JSON.parse(body);
          if (body.error_code) {
            data.post.editorNotes = body.error_desc;
            data.post.status = 7;
          } else {
            data.post.extModerationId = body.text_uid;
          }
          data.post.save(next);
        });
      });
    }]
  }, cb);
};