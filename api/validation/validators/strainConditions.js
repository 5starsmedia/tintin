/**
 * @module common.validators.strainConditions
 * @copyright 2014 Cannasos.com. All rights reserved.
 */

(function () {
  'use strict';

  var validators = {
    'strainConditions.put': function (modelState, next) {
      modelState
        .field('title').ifPresent().required().maxLength(50)
      ;
      next();
    },
    'strainConditions.post': function (modelState, next) {
      modelState
        .field('title').required().maxLength(50)
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
    window.angular.module('common.validators.strainConditions', ['services.validationSvc']).run(['validationSvc', function (validationSvc) {
      validationSvc.registerValidator(validators);
    }]);
  }
  // @endif
}());
