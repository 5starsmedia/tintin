/**
 * Url helpers
 * @module services/url
 * @copyright 2014 Cannasos.com. All rights reserved.
 */
'use strict';

var _       = require('lodash'),
    soap = require('soap'),
    Cookie = require('soap-cookie');

var url = 'http://turbosms.in.ua/api/wsdl.html';

exports.sendSms = function (app, text, options, cb) {


  soap.createClient(url, function(err, client){
    var args = {
      'login': 'esvit',
      'password': 'VS23061988'
    };

    client.Auth(args, function(err, result){
      if(err){
        throw err;
      }
      client.setSecurity(new Cookie(client.lastResponseHeaders));
      args = {
        'MessageId': 'c62957c6-5519-fef5-8364-2e829ece3435'
      };
      client.GetMessageStatus(args, function(err, result){
        if(err){
          throw err;
        }
        console.log(result);
      });
      /*args = {
        'sender': 'HellVin',
        'destination': '+380933636569',
        'text': 'Тернопіль - доступна вільна дата: 05.Чер.2015'
      };
      client.SendSMS(args, function(err, result){
        if(err){
          throw err;
        }
        console.log(result);
      });*/
    });
  });


};
