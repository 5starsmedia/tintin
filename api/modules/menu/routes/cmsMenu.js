'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  router = express.Router();

router.get('/', function (req, res, next) {

  req.app.services.data.getResource('menu', function(err, data) {
    if (err) { return next(err); }

    res.json(data);
  });

});

module.exports = router;