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

exports['db.newMessages.delete'] = exports['db.newMessages.insert'] = function (app, msg, next) {
  async.auto({
    newMessage: function (next) {
      app.models.newMessages.findById(msg.body._id, next);
    },
    newMessagesCount: ['newMessage', function (next, data) {
      app.models.newMessages.count({'account._id': data.newMessage.account._id, removed: {$exists: false}}, next);
    }],
    updateAccount: ['newMessage', 'newMessagesCount', function (next, data) {
      app.models.accounts.update({_id: data.newMessage.account._id}, {
        $set: {
          newMessagesCount: data.newMessagesCount,
          modifyDate: Date.now()
        }
      }, next);
    }]
  }, next);
};

exports['stat.accounts.relations'] = function (app, msg, next) {
  var _id = msg.body._id;
  async.auto({
    followersCount: function (next) {
      app.models.relations.count({'relatedAccount._id': _id, relationType: 'follow'}, next);
    },
    followingCount: function (next) {
      app.models.relations.count({'account._id': _id, relationType: 'follow'}, next);
    },
    friendsCount: function (next) {
      app.models.relations.count({'relatedAccount._id': _id, relationType: 'friend'}, next);
    },
    friendRequestsCount: function (next) {
      app.models.relations.count({'relatedAccount._id': _id, relationType: 'friendRequest'}, next);
    },
    account: function (next) {
      app.models.accounts.findById(_id, 'followersCount followingCount friendRequestsCount friendsCount', next);
    }
  }, function (err, data) {
    if (err) { return next(err); }
    data.account.followersCount = data.followersCount;
    data.account.followingCount = data.followingCount;
    data.account.friendsCount = data.friendsCount;
    data.account.friendRequestsCount = data.friendRequestsCount;
    data.account.save(next);
  });
};

exports['stat.accounts.groups'] = function (app, msg, next) {
  var _id = msg.body._id;
  async.auto({
    memberCount: function (next) {
      app.models.groupMembers.count({'account._id': _id, memberType: 'member', removed: {$exists: false}}, next);
    },
    adminCount: function (next) {
      app.models.groupMembers.count({'account._id': _id, memberType: 'admin', removed: {$exists: false}}, next);
    },
    ownerCount: function (next) {
      app.models.groupMembers.count({'account._id': _id, memberType: 'owner', removed: {$exists: false}}, next);
    },
    moderatorCount: function (next) {
      app.models.groupMembers.count({'account._id': _id, memberType: 'moderator', removed: {$exists: false}}, next);
    },
    requestCount: function (next) {
      app.models.groupMembers.count({'account._id': _id, memberType: 'request', removed: {$exists: false}}, next);
    },
    inviteCount: function (next) {
      app.models.groupMembers.count({'account._id': _id, memberType: 'invite', removed: {$exists: false}}, next);
    },
    account: function (next) {
      app.models.accounts.findById(_id, 'groups', next);
    }
  }, function (err, data) {
    if (err) { return next(err); }
    data.account.groups.memberCount = data.memberCount;
    data.account.groups.adminCount = data.adminCount;
    data.account.groups.ownerCount = data.ownerCount;
    data.account.groups.moderatorCount = data.moderatorCount;
    data.account.groups.requestCount = data.requestCount;
    data.account.groups.inviteCount = data.inviteCount;
    app.services.socket.sendToAccount(_id, 'accounts.groups.change', data);
    data.account.save(next);
  });
};
