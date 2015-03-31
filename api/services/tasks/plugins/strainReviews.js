'use strict';

var async = require('async'),
  moment = require('moment'),
  _ = require('lodash');

exports['db.strainReviews.insert'] = exports['db.strainReviews.update'] = function (app, msg, cb) {
  async.auto({
    strainReview: function (next) {
      app.models.strainReviews.findById(msg.body._id, next);
    },
    setZodiac: ['strainReview', function (next, res) {
      if (res.strainReview.dateOfBirth) {
        var tmp = moment.utc(res.strainReview.dateOfBirth);
        var birthDate = {month: tmp.get('month'), day: tmp.get('day')};
        app.models.zodiacs.find({}, 'title cssClass begin end', function (err, zodiacs) {
          if (err) { return next(err); }
          var zodiac = _.find(zodiacs, function (z) {
            var begin = {month: z.begin.month - 1, day: z.begin.day};
            var end = {month: z.end.month - 1, day: z.end.day};
            return begin.month === birthDate.month && begin.day <= birthDate.day
              || end.month === birthDate.month && end.day >= birthDate.day;
          });
          if (!zodiac) {
            app.log.error('Can\'t find zodiac for ' + res.strainReview.dateOfBirth.toString());
            return next();
          }
          res.strainReview.zodiac = _.pick(zodiac.toObject(), '_id', 'title', 'cssClass');
          next();
        });
      } else {
        next();
      }
    }],
    age: ['strainReview', function (next, res) {
      if (res.strainReview.dateOfBirth) {
        res.strainReview.age = moment.utc().diff(res.strainReview.dateOfBirth, 'years');
        next();
      } else {
        next();
      }
    }],
    ageCategory: ['strainReview', 'age', function (next, res) {
      if (res.strainReview.age) {
        app.models.ageCategories.findOne({'begin': {$lt: res.strainReview.age}, 'end': {$gte: res.strainReview.age}},
          function (err, ageCategory) {
            if (err) { return next(err); }
            res.strainReview.ageCategory = _.pick(ageCategory.toObject(), '_id', 'title', 'cssClass');
            next();
          });
      }
      else {
        next();
      }
    }]
  }, function (err, res) {
    if (err) { return cb(err); }
    res.strainReview.save(cb);
  });
};

exports['db.accounts.update'] = function (app, msg, cb) {
  app.models.accounts.findById(msg.body._id, function (err, account) {
    if (err) { return cb(err); }
    if (account.coverFile) {
      app.models.strainReviews.update({'account._id': account._id}, {account: account.toObject()}, {multi: true}, cb);
    } else {
      cb();
    }
  });
};
