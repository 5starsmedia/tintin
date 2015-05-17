'use strict';

var async = require('async'),
  moment = require('moment'),
  _ = require('lodash');

exports['db.accounts.insert'] = exports['db.accounts.update'] = function (app, msg, cb) {
  async.auto({
    'account': function (next) {
      app.models.accounts.findById(msg.body._id, next);
    },
    'setZodiac': ['account', function (next, res) {
      if (res.account.profile.dateOfBirth) {
        var tmp = moment.utc(res.account.profile.dateOfBirth);
        var birthDate = {month: tmp.get('month'), day: tmp.get('day')};
        app.models.zodiacs.find({}, 'title cssClass begin end', function (err, zodiacs) {
          if (err) { return next(err); }
          var zodiac = _.find(zodiacs, function (z) {
            var begin = {month: z.begin.month - 1, day: z.begin.day};
            var end = {month: z.end.month - 1, day: z.end.day};
            return begin.month === birthDate.month && begin.day <= birthDate.day
              || end.month === birthDate.month && end.day >= birthDate.day;
          });
          res.account.profile.zodiac = _.pick(zodiac.toObject(), '_id', 'title', 'cssClass');
          next();
        });
      } else {
        next();
      }
    }],
    'ageCategory': ['account', function (next, res) {
      if (!res.account.profile.dateOfBirth) {
        return next();
      }
      var age = moment.utc().diff(res.account.profile.dateOfBirth, 'years');
      app.models.ageCategories.findOne({'begin': {$lte: age}, 'end': {$gte: age}}, function (err, ageCategory) {
        if (err) { return next(err); }
        res.account.profile.age = age;
        res.account.profile.ageCategory = _.pick(ageCategory.toObject(), '_id', 'title', 'cssClass');
        next();
      });
    }],
    profileStrength: ['account', function (next, data) {
      var fieldsCount = 0;
      var filledFields = 0;
      var profile = data.account.profile;

      fieldsCount += 1;
      filledFields += data.account.title && data.account.title.length > 0 ? 1 : 0;

      fieldsCount += 1;
      filledFields += profile.firstName && profile.firstName.length > 0 ? 1 : 0;

      fieldsCount += 1;
      filledFields += profile.lastName && profile.lastName.length > 0 ? 1 : 0;

      fieldsCount += 1;
      filledFields += profile.city && profile.city.length > 0 ? 1 : 0;

      fieldsCount += 1;
      filledFields += profile.interests && profile.interests.length > 0 ? 1 : 0;

      fieldsCount += 1;
      filledFields += profile.country && profile.country._id ? 1 : 0;

      fieldsCount += 1;
      filledFields += profile.primaryLanguage && profile.primaryLanguage._id ? 1 : 0;

      fieldsCount += 1;
      filledFields += profile.gender && profile.gender._id ? 1 : 0;

      fieldsCount += 1;
      filledFields += profile.dateOfBirth ? 1 : 0;

      var fillingLevel = Math.round(filledFields * 100 / fieldsCount);

      app.models.accounts.update({_id: data.account._id}, {$set: {profileStrength: fillingLevel}}, next);
    }]

  }, function (err, res) {
    if (err) { return cb(err); }
    res.account.save(cb);
  });
};