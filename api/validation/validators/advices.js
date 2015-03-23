/**
 * @module common.validators.advices
 * @copyright 2014 Cannasos.com. All rights reserved.
 */

(function () {
  'use strict';

  var validators = {
    'advices.put': function (modelState, next) {
      modelState
        .field('title').ifPresent().required().maxLength(200)
        .field('category._id').ifPresent().required()
        .field('description').maxLength(2000)
      ;
      next();
    },
    'advices.post': function (modelState, next) {

      // @ifdef NODE
      if (!modelState._req.auth.account.activated) {
        modelState.addError('Your account is inactive. Please confirm your email.');
      }
      // @endif

      modelState
        .field('title').required().maxLength(200)
        .field('category._id').required()
        .field('description').maxLength(2000)
      ;
      next();
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
    window.angular.module('common.validators.advices', ['services.validationSvc']).run(['validationSvc', function (validationSvc) {
      validationSvc.registerValidator(validators);
    }]);
  }
  // @endif
}());
