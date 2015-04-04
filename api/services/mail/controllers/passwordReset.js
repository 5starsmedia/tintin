'use strict';

exports.controller = function (app, sendOpts, model, next) {
  var tokenArr = [];
  for (var i = 0; i < model.token.length; i += 1) {
    tokenArr.push(model.token[i]);
  }
  model.brokenToken = tokenArr.join('&#8203;');
  sendOpts.subject = 'Password reset';
  next(null, model);
};
