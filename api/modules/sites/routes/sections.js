'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  router = express.Router(),
    sass = require('node-sass');

router.put('/:id', function (req, res, next) {
  console.info(req.body)

  var scssCode = ".section" + req.body._id + " {\n" + (req.body.scssCode || '') + "\n}";
  sass.render({
    data: scssCode,
    outputStyle: 'nested'
  }, function(err, result) {
    if (!err) {
      req.body.cssCode = result.css;
    } else {
      return next(new req.app.errors.ValidationError(err.message, 'scssCode'))
    }
    next();
  });
});

module.exports = router;