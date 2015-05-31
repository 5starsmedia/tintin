'use strict';

var mongoose = require('mongoose');

function commonF(search, req, resource, next) {
  if (req.auth.isGuest) {
    return next(null, []);
  }
  var model = req.app.models[resource];
  if (!model) {
    return next(null, []);
  }
  if (!model.schema.paths['account._id']) {
    return next(null, []);
  }

  model.findOne(search, 'account', function (err, item) {
    var modifiers = [];
    if (err) { return next(err); }
    if (item && item.account && item.account._id && item.account._id.toString() === req.auth.account._id.toString()) {
      modifiers.push('owner');
    }
    return next(null, modifiers);
  });
}

exports['get/*?_id'] = exports['post/*?_id'] = exports['put/*?_id'] = exports['delete/*?_id'] =
  function (req, resource, params, next) {
    if (!mongoose.Types.ObjectId.isValid(params._id)) {
      return next(new req.app.errors.NotFoundError('ObjectId "' + params._id + '" is not valid for resource "' + resource + '"'));
    }
    commonF({_id: params._id}, req, resource, next);
  };

exports['get/*?alias'] = exports['post/*?alias'] = exports['put/*?alias'] = exports['delete/*?alias'] =
  function (req, resource, params, next) {
    commonF({alias: params.alias}, req, resource, next);
  };

exports['get/*?account._id'] = function (req, resource, params, next) {
  if (req.auth.isGuest) {
    return next(null, []);
  }
  if (params['account._id'] === req.auth.account._id.toString()) {
    return next(null, ['owner']);
  } else {
    return next(null, []);
  }
};
