/**
 * @module common.validators.accountBans
 * @copyright 2014 Cannasos.com. All rights reserved.
 */
(function () {
  'use strict';

  var validators = {
    'accountBans.put': function (modelState, next) {
      modelState
        .field('category._id').required()
        .field('types').required()
        .field('period._id').required()
        .field('description').maxLength(20000)
      ;
      next();
    },
    'accountBans.post': function (modelState, next) {
       modelState
         .field('category._id').required().notNull()
         .field('types').required().minArrayCount(1)
         .field('period._id').required().notNull()
         .field('description').maxLength(20000)
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
    window.angular.module('common.validators.accountBans', ['services.validationSvc']).run(['validationSvc', function (validationSvc) {
      validationSvc.registerValidator(validators);
    }]);
  }
  // @endif
}());
