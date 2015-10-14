'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  request = require('request'),
  cheerio = require('cheerio'),
  htmlToText = require('html-to-text'),
  querystring = require('querystring'),
  router = express.Router();

router.post('/', function (req, res, next) {
  //req.app.services.mq.push(req.app, 'events', {name: 'seo.checkTextUnique', _id: req.body._id});

  //var url = 'http://api.text.ru/account';

  /*request.post({
    url: url,
    form: {
      method: 'get_packages_info',
      userkey: req.app.config.get('seo.text-ru.userkey')
    }
  }, function (error, response, body) {
console.info(body)
    res.json(body);
  });*/
  var url = 'http://api.text.ru/post';
  request.post({
    url: url,
    form: {
      text: req.body.text,
      userkey: req.app.config.get('seo.text-ru.userkey')
    }
  }, function (error, response, body) {
    body = JSON.parse(body);
    res.json(body);
  });
});

router.get('/:uid', function (req, res, next) {
  var url = 'http://api.text.ru/post';

  request.post({
    url: url,
    form: {
      uid: req.params.uid,
      userkey: req.app.config.get('seo.text-ru.userkey'),
      jsonvisible: 'detail'
    }
  }, function (error, response, body) {
    var resp = JSON.parse(body);

    resp.result_json = JSON.parse(resp.result_json);
    resp.seo_check = JSON.parse(resp.seo_check);
    resp.spell_check = JSON.parse(resp.spell_check);

    res.json(resp);
  });
});

module.exports = router;