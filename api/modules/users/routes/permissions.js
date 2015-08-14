/**
 * Copyright 2014 Cannasos.com
 * GET /api/auth
 */
'use strict';

var express = require('express'),
    mongoose = require('mongoose'),
    buffer = require('buffer'),
    pwd = require('pwd'),
    _ = require('lodash'),
    jwt = require('jsonwebtoken'),
    crypto = require('crypto'),
    request = require('request'),
    querystring = require('querystring'),
    async = require('async'),
    S = require('string'),
    config = require('../../../config.js');

var router = express.Router();

router.get('/', function (req, res, next) {

  req.app.services.data.getResource('permissions', function(err, data) {
    if (err) { return next(err); }

    res.json(data);
  });
});


module.exports = router;
