'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  router = express.Router();

router.get('/current', function (req, res, next) {
  res.json(req.site);
});

module.exports = router;