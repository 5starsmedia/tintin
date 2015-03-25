/**
 * Copyright 2015 5starsmedia.com.ua
 */
'use strict';

var server = require('./server.js'),
  _ = require('lodash'),
  url = require('url'),
  cheerio = require('cheerio'),
  express = require('express'),
  request = require('request'),
  async = require('async');

var router = express.Router();

var getForm = function(html, data) {
  var $ = cheerio.load(html),
    forms = $('form'),
    fields = $(forms[0]).serializeArray(),
    action = $(forms[0]).attr('action');

  action = $(forms[0]).attr('action');

  _.forEach(fields, function(item) {
    data[item.name] = item.value;
  });
  return action;
};

router.get('/', function (req, res, next) {

  var host = 'https://www.vfsvisaonline.com';
  var baseUrl = host + '/poland-ukraine-appointment/AppScheduling/';
  var urlMain =  baseUrl + 'AppWelcome.aspx?P=s2x6znRcBRv7WQQK7h4MTjZiPRbOsXKqJzddYBh3qCA=';


  request.defaults({
    followRedirect: false,
    headers: {
      'Referer':'http://www.polandvisa-ukraine.com/scheduleappointment_2.html',
      'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.101 Safari/537.36'
    }
  });

  var action, path;
  async.auto({
    'firstPage': function(next) {
      request.get({ url: urlMain }, function (error, response, body) {
        if (!error && response.statusCode == 200) {

          path = response.request.uri.path;
          console.info(path);

          var data = {
            '__EVENTTARGET': 'ctl00$plhMain$lnkSchApp',
            '__EVENTARGUMENT':''
          };
          action = getForm(body, data);
          //console.info(host + path);
          next(undefined, data);
        }
      });
    },
    'secondPage': ['firstPage', function(err, data) {

      request.post({ url: host + path, form: data }, function(err,httpResponse,body){
        var $ = cheerio.load(body),
          forms = $('form'),
          fields = $(forms[0]).serializeArray();
        action = $(forms[0]).attr('action');
        _.forEach(fields, function(item) {
          data[item.name] = item.value;
        });
        data['ctl00$plhMain$cboVAC'] = 17;
        data['ctl00$plhMain$cboPurpose'] = 1;
        data['ctl00$plhMain$btnSubmit'] = 'Підтвердити';
        next(undefined, data);
      });
    }],
    'thirdPage': ['secondPage', function(err, data) {

      var res = url.resolve(host + path, action);
      console.info(res);
      request.post({ url: res, form: data, headers: { 'Referer': host + path } }, function(err,httpResponse,body){

        var $ = cheerio.load(body),
          forms = $('form'),
          fields = $(forms[0]).serializeArray();
        action = $(forms[0]).attr('action');
        _.forEach(fields, function(item) {
          data[item.name] = item.value;
        });
        data['ctl00$plhMain$tbxNumOfApplicants'] = 1;
        data['ctl00$plhMain$txtChildren'] = 0;
        data['ctl00$plhMain$cboVisaCategory'] = 235;

        next(undefined, data);
      });
    }],
    'fourPage': ['thirdPage', function(err, data) {
      var res = url.resolve(host + path, 'AppSchedulingGetInfo.aspx?p=s2x6znRcBRv7WQQK7h4MTjZiPRbOsXKqJzddYBh3qCA%3d');
      console.info(res);
      request.post({ url: res, form: data, headers: { 'Referer': res } }, function(err,httpResponse,body){
        var $ = cheerio.load(body),
          text = $('#ctl00_plhMain_lblMsg').text();

        next(undefined, {res: text});
      });
    }]
  }, function(err, data) {
    if (err) { return next(err); }

    res.status(200).json(data);
  });

  next();
});





//
//request.get({ url: urlMain }, function (error, response, body) {
//  if (!error && response.statusCode == 200) {
//
//    var path = response.request.uri.path;
//    console.info(path)
//
//    var $ = cheerio.load(body),
//      fields = {};
//    var forms = $('form'), action;
//
//    fields = $(forms[0]).serializeArray();
//    action = $(forms[0]).attr('action');
//    var data = {
//      '__EVENTTARGET': 'ctl00$plhMain$lnkSchApp',
//      '__EVENTARGUMENT':''
//    };
//    _.forEach(fields, function(item) {
//      data[item.name] = item.value;
//    });
//    console.info(host + path);
//    request.post({ url: host + path, form: data }, function(err,httpResponse,body){
//      $ = cheerio.load(body);
//      forms = $('form');
//      fields = $(forms[0]).serializeArray();
//      action = $(forms[0]).attr('action');
//      _.forEach(fields, function(item) {
//        data[item.name] = item.value;
//      });
//      data['ctl00$plhMain$cboVAC'] = 17;
//      data['ctl00$plhMain$cboPurpose'] = 1;
//      data['ctl00$plhMain$btnSubmit'] = 'Підтвердити';
//
//      var res = url.resolve(host + path, action);
//      console.info(res);
//      request.post({ url: res, form: data, headers: { 'Referer': host + path } }, function(err,httpResponse,body){
//
//        $ = cheerio.load(body);
//        forms = $('form');
//        fields = $(forms[0]).serializeArray();
//        action = $(forms[0]).attr('action');
//        _.forEach(fields, function(item) {
//          data[item.name] = item.value;
//        });
//        data['ctl00$plhMain$tbxNumOfApplicants'] = 1;
//        data['ctl00$plhMain$txtChildren'] = 0;
//        data['ctl00$plhMain$cboVisaCategory'] = 235;
//
//        res = url.resolve(host + path, 'AppSchedulingGetInfo.aspx?p=s2x6znRcBRv7WQQK7h4MTjZiPRbOsXKqJzddYBh3qCA%3d');
//        console.info(res);
//        request.post({ url: res, form: data, headers: { 'Referer': res } }, function(err,httpResponse,body){
//
//          $ = cheerio.load(body);
//          var text = $('#ctl00_plhMain_lblMsg').text();
//          console.info(text);
//        });
//
//      });
//    });
//  }
//});