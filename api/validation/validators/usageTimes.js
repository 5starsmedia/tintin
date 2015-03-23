/**
 * @module common.validators.usageTimes
 * @copyright 2014 Cannasos.com. All rights reserved.
 */

(function () {
  'use strict';

  var validators = {
    'usageTimes.put': function (modelState, next) {
      var title = modelState.field('title').ifPresent().required().maxLength(50);
      modelState
        .field('cssClass').ifPresent().required().maxLength(50)
      ;
      title.unique('usageTimes', next);
    },
    'usageTimes.post': function (modelState, next) {
      var title = modelState.field('title').required().maxLength(50);
      modelState
        .field('cssClass').required().maxLength(50)
      ;
      title.unique('usageTimes', next);
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
    window.angular.module('common.validators.usageTimes', ['services.validationSvc']).run(['validationSvc', function (validationSvc) {
      validationSvc.registerValidator(validators);
    }]);
  }
  // @endif
}());
