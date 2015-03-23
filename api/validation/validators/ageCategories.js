/**
 * @module common.validators.ageCategories
 * @copyright 2014 Cannasos.com. All rights reserved.
 */

(function () {
  'use strict';

  var validators = {
    'ageCategories.put': function (modelState, next) {
      var title = modelState.field('title').ifPresent().required().maxLength(50);
      modelState
        .field('begin').ifPresent().required().isInt().range(0, 100)
        .field('end').ifPresent().required().isInt().range(0, 999)
        .field('cssClass').ifPresent().required().maxLength(50)
      ;
      title.unique('ageCategories', next);
    },
    'ageCategories.post': function (modelState, next) {
      var title = modelState.field('title').required().maxLength(50);
      modelState
        .field('begin').required().isInt().range(0, 100)
        .field('end').required().isInt().range(0, 999)
        .field('cssClass').required().maxLength(50)
      ;
      title.unique('ageCategories', next);
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
    window.angular.module('common.validators.ageCategories', ['services.validationSvc']).run(['validationSvc', function (validationSvc) {
      validationSvc.registerValidator(validators);
    }]);
  }
  // @endif
}());
