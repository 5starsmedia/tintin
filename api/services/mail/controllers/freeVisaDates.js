'use strict';

exports.controller = function (app, sendOpts, model, next) {
  sendOpts.subject = 'Звільнились дати';
  next(null, model);
};
