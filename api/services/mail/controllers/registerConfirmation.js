'use strict';

exports.controller = function (app, sendOpts, model, next) {
  var tokenArr = [];
  for (var i = 0; i < model.activationToken.length; i += 1) {
    tokenArr.push(model.activationToken[i]);
  }
  model.brokenToken = tokenArr.join('&#8203;');
  sendOpts.subject = 'Account registration';
  next(null, model);
};
