'use strict';
var async = require('async'),
  mongoose = require('mongoose');

// params:
//   account:{_id}
exports['contribution.ownerContribution'] = function (app, msg, next) {
  async.auto({
    aggregate: function (next) {
      app.models.contributionPoints.aggregate([
        {
          $match: {
            'ownerAccount._id': mongoose.Types.ObjectId(msg.body.account._id)
          }
        },
        {
          $group: {
            _id: null,
            total: {$sum: '$value'}
          }
        }
      ], next);
    },
    updateAccount: ['aggregate', function (next, data) {
      app.models.accounts.update({_id: msg.body.account._id}, {
        $set: {
          'contribution.total': (data.aggregate && data.aggregate.length > 0) ? data.aggregate[0].total : 0
        }
      }, next);
    }],
    updateAccounts: ['aggregate', function (next, data) {
      app.models.relations.update({'account._id': msg.body.account._id}, {
        $set: {
          'account.contribution.total': (data.aggregate && data.aggregate.length > 0) ? data.aggregate[0].total : 0
        }
      }, {multi: true}, next);
    }],
    updateRelatedAccounts: ['aggregate', function (next, data) {
      app.models.relations.update({'relatedAccount._id': msg.body.account._id}, {
        $set: {
          'relatedAccount.contribution.total': (data.aggregate && data.aggregate.length > 0) ? data.aggregate[0].total : 0
        }
      }, {multi: true}, next);
    }]
  }, next);
};

exports['contribution.accountResources'] = function (app, msg, next) {
  async.auto({
    aggregate: function (next) {
      app.models.contributionPoints.aggregate([
        {
          $match: {
            'account._id': mongoose.Types.ObjectId(msg.body.account._id)
          }
        },
        {
          $project: {
            negativeValue: {
              $cond: {if: {$lt: ['$value', 0]}, then: 1, else: 0}
            },
            positiveValue: {
              $cond: {if: {$gt: ['$value', 0]}, then: 1, else: 0}
            }
          }
        },
        {
          $group: {
            _id: null,
            spend: {$sum: 1},
            spendNegative: {$sum: '$negativeValue'},
            spendPositive: {$sum: '$positiveValue'}
          }
        }
      ], next);
    },
    lastContribution: function (next) {
      var query = {'account._id': msg.body.account._id};
      var queryOpts = {limit: 30, sort: '-createDate'};
      app.models.contributionPoints.find(query, 'collectionName resourceId createDate value', queryOpts, next);
    },
    updateAccount: ['lastContribution', 'aggregate', function (next, data) {
      app.models.accounts.update({_id: msg.body.account._id}, {
        $set: {
          'contribution.resources': data.lastContribution,
          'contribution.spend': data.aggregate && data.aggregate.length > 0 ? data.aggregate[0].spend : 0,
          'contribution.spendNegative': data.aggregate && data.aggregate.length > 0 ? data.aggregate[0].spendNegative : 0,
          'contribution.spendPositive': data.aggregate && data.aggregate.length > 0 ? data.aggregate[0].spendPositive : 0
        }
      }, next);
    }]
  }, next);
};

// params:
//  collectionName
//  resourceId
exports['contribution.resource'] = function (app, msg, next) {
  var model = app.models[msg.body.collectionName];
  if (!model || !model.schema || !model.schema.paths) {
    return next(new app.errors.OperationError('Invalid collection name ' + msg.body.collectionName));
  }
  if (!model.schema.paths.contributionPoints) {
    return next(new app.errors.OperationError('Model ' + msg.body.collectionName + ' do not supports contributionPoints'));
  }
  async.auto({
    aggregate: function (next) {
      app.models.contributionPoints.aggregate([
        {
          $match: {
            collectionName: msg.body.collectionName,
            resourceId: mongoose.Types.ObjectId(msg.body.resourceId)
          }
        },
        {
          $group: {
            _id: null,
            totalValue: {$sum: '$value'}
          }
        }
      ], next);
    },
    updateFeeds: ['aggregate', function (next, data) {
      app.models.feeds.update({resourceId: msg.body.resourceId, collectionName: msg.body.collectionName}, {
        $set: {
          'contributionPoints': data.aggregate && data.aggregate.length > 0 ? data.aggregate[0].totalValue : 0
        }
      }, {multi: true}, next);
    }],
    updateResource: ['aggregate', function (next, data) {
      model.update({_id: msg.body.resourceId}, {
        $set: {
          'contributionPoints': data.aggregate && data.aggregate.length > 0 ? data.aggregate[0].totalValue : 0
        }
      }, next);
    }]
  }, next);
};


