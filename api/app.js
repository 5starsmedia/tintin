/**
 * Copyright 2015 5starsmedia.com.ua
 */
'use strict';

var server = require('./server.js');

server.start(function (err) {
  if (err) { return console.error(err); }
});
/**
 * @callback callbackFunction
 * @param [err] Error or null
 */