/**
 * @module common.validators.strainCategories
 * @copyright 2014 Cannasos.com. All rights reserved.
 */


(function () {
  'use strict';

  var validators = {
    'strainCategories.put': function (modelState, next) {
      modelState
        .field('title').ifPresent().required().maxLength(50)
        .field('textColor').ifPresent().required().isHexColor()
        .field('bgColor').ifPresent().required().isHexColor()
        .field('arcBgColor').ifPresent().required().isHexColor()
      ;
      next();
    },
    'strainCategories.post': function (modelState, next) {
      modelState
        .field('title').required().maxLength(50)
        .field('textColor').required().isHexColor()
        .field('bgColor').required().isHexColor()
        .field('arcBgColor').required().isHexColor()
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
    window.angular.module('common.validators.strainCategories', ['services.validationSvc']).run(['validationSvc', function (validationSvc) {
      validationSvc.registerValidator(validators);
    }]);
  }
  // @endif
}());
