'use strict';

var async = require('async'),
  moment = require('moment'),
  _ = require('lodash');

exports['db.accountBans.insert'] = exports['db.accountBans.update'] = function (app, msg, cb) {
  async.auto({
    'accountBan': function (next) {
      app.models.accountBans.findById(msg.body._id, next);
    },
    'account': ['accountBan', function (next, res) {
      app.models.accounts.findById(res.accountBan.account._id, next);
    }],
    'accountBanPeriod': ['accountBan', function (next, res) {
      app.models.accountBanPeriods.findById(res.accountBan.period._id, next);
    }],
    'accountBanCategory': ['accountBan', function (next, res) {
      app.models.accountBanCategories.findById(res.accountBan.category._id, next);
    }],
    'setAccountBan': ['account', 'accountBanPeriod', function (next, res) {
      var timeDifference = 1,
        dueDate = moment(res.accountBan.createDate).add(res.accountBanPeriod.days, 'days');
      if (res.accountBanPeriod.days === 0) {
        dueDate = moment('2100-01-01');
      }
      console.info(res.account.bans)
      var item = _.find(res.account.bans, function(item) {
        var duration = moment.duration(moment(dueDate).diff(item.dueDate));
        return duration.asHours() <= timeDifference;
      })
      if (item) {
        item.types = _.union(item.types, res.accountBan.types);
        item.dueDate = dueDate;
      } else {
        res.account.bans.push({
          _id: res.accountBan._id,
          dueDate: dueDate,
          types: res.accountBan.types
        });
      }
      res.accountBan.account.login = res.account.login;
      res.accountBan.account.title = res.account.title;
      res.accountBan.account.imageUrl = res.account.imageUrl;
      res.accountBan.account.coverFile = res.account.coverFile;

      res.accountBan.category.title = res.accountBanCategory.title;
      res.accountBan.period.title = res.accountBanPeriod.title;

      res.accountBan.save(next);
    }]
  }, function (err, res) {
    if (err) { return cb(err); }
    res.account.save(cb);
  });
};

exports['db.accountBans.delete'] = function (app, msg, next) {
  async.auto({
    'accountBan': function (next) {
      app.models.accountBans.findById(msg.body._id, next);
    },
    'account': ['accountBan', function (next, res) {
      app.models.accounts.findById(res.accountBan.account._id, next);
    }],
    deleteBan: ['account', function (next, res) {
      res.account.bans = _.reject(res.account.bans, { _id: res.accountBan._id });
      res.account.save(next);
    }]
  }, next);
};