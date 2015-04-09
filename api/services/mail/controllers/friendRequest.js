'use strict';

var async = require('async');

exports.controller = function (app, sendOpts, model, next) {
  async.auto({
    notification: function (next) {
      app.models.notifications.findById(model._id, next);
    },
    account: ['notification', function (next, data) {
      app.models.accounts.findById(data.notification.account._id, next);
    }],
    senderAccount: ['notification', function (next, data) {
      app.models.accounts.findById(data.notification.resourceInfo.account._id, next);
    }],
    randomAccounts: ['account', 'senderAccount', function (next, data) {
      var query = {
        removed: {$exists: false},
        randomField: {$gte: Math.random()},
        _id: {$not: {$in: [data.account._id, data.senderAccount._id]}},
        $or: [
          {'coverFile._id': {$exists: true}},
          {'imageUrl': {$exists: true}}
        ]
      };
      app.models.accounts.find(query, 'title imageUrl coverFile', {limit: 5}, next);
    }],
    relations: ['notification', function (next, data) {
      app.services.relation.getMutual('friend', data.notification.account._id,
        data.notification.resourceInfo.account._id, next);
    }]
  }, function (err, data) {
    if (err) { return next(err); }
    var addrParts = [];
    if (data.senderAccount.profile.country && data.senderAccount.profile.country._id) {
      addrParts.push(data.senderAccount.profile.country.title);
    }
    if (data.senderAccount.profile.state && data.senderAccount.profile.state._id) {
      addrParts.push(data.senderAccount.profile.state.title);
    }
    if (data.senderAccount.profile.city && data.senderAccount.profile.city.length > 0) {
      addrParts.push(data.senderAccount.profile.city);
    }
    model.senderAddress = addrParts.join(', ');
    model.senderInterests = app.services.text.trimText(data.senderAccount.profile.interests, 200);
    model.account = data.account;
    model.senderAccount = data.senderAccount;
    model.randomAccounts = data.randomAccounts;
    model.notification = data.notification;
    model.relations = data.relations;


    sendOpts.subject = data.senderAccount.title + ' wants to be your friend on CannaSOS!';
    next(null, model);
  });
};
