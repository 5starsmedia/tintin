'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  router = express.Router();

router.get('/mainmenu', function (req, res, next) {

  async.auto({
    'mainMenu': function(next) {
      return req.app.models.menuElements.findOne({ 'site._id': req.site._id, isMainMenu: true, removed: { $exists: false } }, next);
    }
  }, function (err, data) {
    if (err) { return next(err); }

    if (!data.mainMenu) {
      return next(new req.app.errors.NotFoundError('Main menu not found'));
    }
    return res.json(data.mainMenu);
  });

});

module.exports = router;