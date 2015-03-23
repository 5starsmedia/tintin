/**
 * Copyright 2015 5starsmedia.com.ua
 */
'use strict';

var convict = require('convict');
var path = require('path');

var conf = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  url: {
    doc: 'Primary site url',
    default: 'http://localhost',
    format: 'url'
  },
  mail: {
    imagesPath: {doc: 'Mail images path', format: String, default: 'https://dev.cannasos.com/static/mail'}
  },
  mongodb: {doc: 'Mongodb connection string', format: String, default: ''},
  http: {
    serveStatic: {doc: 'Enable processing static content requests', format: Boolean, default: true},
    port: {doc: 'Http listening port', format: 'port', default: 8080}
  },
  notificationMailingDelay: {doc: 'Delay mailing notification (ms)', format: Number, default: 5000},
  auth: {
    maxTokensCount: {doc: 'Maximum tokens count', format: Number, default: 5},
    tokenLength: {doc: 'Token length', format: Number, default: 20},
    tokenDuration: {doc: 'Token duration', format: Number, default: 0},
    persistTokenDuration: {doc: 'Token duration for persist tokens', format: Number, default: 0},
    guestRoleName: {doc: 'Name of the guest role', format: String, default: 'guest'}
  }
});

var filePath = path.resolve(__dirname, '..', 'api', 'cfg', conf.get('env') + '.json');
conf.loadFile(filePath);
conf.validate();

module.exports = conf;
