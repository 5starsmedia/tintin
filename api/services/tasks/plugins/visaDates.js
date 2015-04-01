'use strict';

var async = require('async'),
  mongoose = require('mongoose'),
  url = require('url'),
  cheerio = require('cheerio'),
  moment = require('moment'),
  request = require('request'),
  _ = require('lodash');

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


function checkVisa(model, callback) {

  var num = model.id;

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
          next(undefined, data);
        }
      });
    },
    'secondPage': ['firstPage', function(next, resData) {

      request.post({ url: host + path, form: resData.firstPage }, function(err,httpResponse,body){
        var $ = cheerio.load(body),
          forms = $('form'),
          fields = $(forms[0]).serializeArray();
        action = $(forms[0]).attr('action');

        var data = {};
        _.forEach(fields, function(item) {
          data[item.name] = item.value;
        });
        data['ctl00$plhMain$cboVAC'] = num;
        data['ctl00$plhMain$cboPurpose'] = 1;
        data['ctl00$plhMain$btnSubmit'] = 'Підтвердити';
        next(undefined, data);
      });
    }],
    'thirdPage': ['secondPage', function(next, resData) {

      var res = url.resolve(host + path, action);
      console.info(res);
      request.post({ url: res, form: resData.secondPage, headers: { 'Referer': host + path } }, function(err,response,body){

        path = response.request.uri.path;

        var $ = cheerio.load(body),
          forms = $('form'),
          fields = $(forms[0]).serializeArray();
        action = $(forms[0]).attr('action');
        var data = {};
        _.forEach(fields, function(item) {
          data[item.name] = item.value;
        });
        data['ctl00$plhMain$tbxNumOfApplicants'] = 1;
        data['ctl00$plhMain$txtChildren'] = 0;
        data['ctl00$plhMain$cboVisaCategory'] = 235;

        next(undefined, data);
      });
    }],
    'fourPage': ['thirdPage', function(next, resData) {
      var res = url.resolve(host + path, 'AppSchedulingGetInfo.aspx?p=s2x6znRcBRv7WQQK7h4MTjZiPRbOsXKqJzddYBh3qCA%3d');
      request.post({ url: res, form: resData.thirdPage, headers: { 'Referer': res } }, function(err,httpResponse,body){
        var $ = cheerio.load(body),
          text = $('#ctl00_plhMain_lblMsg').text();

        if (text == '') {
          next(undefined, {hasError: true, response: body});
          return;
        }
        next(undefined, {hasError: false, msg: text});
      });
    }]
  }, function(err, data) {
    if (err) { return callback(err); }

    model.response = '';
    model.isSuccess = !data.fourPage.hasError;
    if (data.fourPage.hasError) {
      model.response = data.fourPage.response;
    } else if ((data.fourPage.msg || '').match(/No date/i) == null) {
      console.info(moment(data.fourPage.msg, 'DD.MMM.YYYY'));
      model.lastResultDate = model.freeDate;
      model.freeDate = moment(data.fourPage.msg, 'DD.MMM.YYYY');
      model.isFree = true;
    } else {
      model.isFree = false;
      model.lastResultDate = null;
    }
    model.save(callback);
  });
}

exports['visaDates.check'] = function (app, msg, cb) {
  console.info('visaDates.check');

  app.models.visaDates.find({ isEnabled: true }, function(err, visas) {
    if (err) { return cb(err); }
    async.map(visas, checkVisa, function(err, results){
      console.info('visaDates.check - complete', results);
      cb();
    });
  });
};