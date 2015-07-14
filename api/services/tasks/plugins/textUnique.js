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
      app.services.html.clearHtml(data.post.body, function (err, text) {
        text = htmlToText.fromString(text, {wordwrap: 120, tables: false, ignoreHref: true, ignoreImage: true});

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

exports['seo.checkTextUniqueResult'] = function (app, msg, cb) {
  async.auto({
    'post': function (next) {
      app.models.posts.findOne({extModerationId: {$exists: true}, removed: {$exists: false}}, next);
    },
    'keywordGroup': ['post', function (next, data) {
      if (!data.post.keywordGroup) {
        return next();
      }
      app.models.keywordGroups.findById(data.post.keywordGroup._id, next);
    }],
    'checkText': ['post', 'keywordGroup', function (next, data) {
      var url = 'http://api.text.ru/post';
      if (!data.post || !data.post.extModerationId) {
        return next();
      }

      request.post({
        url: url,
        form: {
          uid: data.post.extModerationId,
          userkey: app.config.get('seo.text-ru.userkey'),
          jsonvisible: 'detail'
        }
      }, function (error, response, body) {
        var resp = JSON.parse(body);

        resp.result_json = JSON.parse(resp.result_json);
        resp.seo_check = JSON.parse(resp.seo_check);
        resp.spell_check = JSON.parse(resp.spell_check);

        data.post.extCheckResult = resp;
        data.post.markModified('extCheckResult');
        data.post.extModerationId = null;
        data.post.markModified('extModerationId');
        if (resp.result_json.unique < 90) {
          data.post.status = 7;
          data.post.editorNotes = 'Статья не уникальная. Уникальность: ' + resp.result_json.unique;
          if (data.keywordGroup) {
            data.keywordGroup.status = 'failedModeration';
          }
        } else {
          data.post.status = 2;
        }
        if (data.keywordGroup) {
          data.keywordGroup.save(function(err) {
            if (err) { return next(err); }
            data.post.save(next);
          })
        } else {
          data.post.save(next);
        }
      });
    }]
  }, cb);
};