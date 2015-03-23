/**
 * @module common.validators.strainFlavorCategories
 * @copyright 2014 Cannasos.com. All rights reserved.
 */

(function () {
  'use strict';

  var validators = {
    'strainFlavorCategories.put': function (modelState, next) {
      modelState
        .field('title').ifPresent().required().maxLength(50)
      ;
      next();
    },
    'strainFlavorCategories.post': function (modelState, next) {
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
    window.angular.module('common.validators.strainFlavorCategories', ['services.validationSvc']).run(['validationSvc', function (validationSvc) {
      validationSvc.registerValidator(validators);
    }]);
  }
  // @endif
}());
