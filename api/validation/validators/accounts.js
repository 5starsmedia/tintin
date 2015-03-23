/**
 * @module common.validators.users
 * @copyright 2014 Cannasos.com. All rights reserved.
 */

(function () {
  'use strict';

  var validators = {
    'accounts.put': function (modelState, next) {
      modelState.field('title').ifPresent().required().maxLength(50);
      modelState.field('pwd').ifPresent().required().maxLength(50);
      //modelState.field('email').ifPresent().required().isEmail().maxLength(100);
      var login = modelState.field('login').ifPresent().required().maxLength(50);

      // @ifdef NODE
      var async = require('async');
      return async.parallel([function (next) {
        login.unique('accounts', next);
      }, function (next) {
        modelState._req.app.services.data.getResource('deniedUserNames', function (err, data) {
          if (err) { return next(err); }
          if (modelState.model.title && data.indexOf(modelState.model.title.toLowerCase()) !== -1) {
            modelState.addError('Invalid username', 'title');
          }
          next();
        });
      }], next);
      // @endif
      next();
    },
    'accounts.post': function (modelState, next) {
      modelState.field('title').required().maxLength(50);
      modelState.field('pwd').required().maxLength(50);
      //modelState.field('email').required().isEmail().maxLength(100);
      var login = modelState.field('login').required().maxLength(50);
      login.unique('accounts', next);

    }
  };

  // @ifdef NODE
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = function (app) {
      app.services.validation.registerValidator(validators);
    };
  }
  // @endif

  // @ifdef BROWSER
  if (typeof window !== 'undefined' && window.angular) {
    window.angular.module('common.validators.users', ['services.validationSvc']).run(['validationSvc',
      function (validationSvc) {
        validationSvc.registerValidator(validators);
      }]);
  }
  // @endif
}());
