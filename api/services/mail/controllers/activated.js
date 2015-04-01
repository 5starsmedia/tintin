'use strict';

exports.controller = function (app, sendOpts, model, next) {
  sendOpts.subject = 'Welcome to CannaSOS!';
  next(null, model);
};
