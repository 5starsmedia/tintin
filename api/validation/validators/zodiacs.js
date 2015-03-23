/**
 * @module common.validators.zodiacs
 * @copyright 2014 Cannasos.com. All rights reserved.
 */

(function () {
  'use strict';

  var validators = {
    'zodiacs.put': function (modelState, next) {
      var title = modelState.field('title').ifPresent().required().maxLength(50);
      modelState
        .field('cssClass').ifPresent().required().maxLength(50)
        .field('begin.month').ifPresent().required().isInt().range(1, 12)
        .field('end.month').ifPresent().required().isInt().range(1, 12)
        .field('begin.day').ifPresent().required().isInt().range(1, 31)
        .field('end.day').ifPresent().required().isInt().range(1, 31)
        .field('description').ifPresent().required().maxLength(500)
      ;
      title.unique('zodiacs', next);

    },
    'zodiacs.post': function (modelState, next) {
      var title = modelState.field('title').required().maxLength(50);
      modelState
        .field('cssClass').required().maxLength(50)
        .field('begin.month').required().isInt().range(1, 12)
        .field('end.month').required().isInt().range(1, 12)
        .field('begin.day').required().isInt().range(1, 31)
        .field('end.day').required().isInt().range(1, 31)
        .field('description').maxLength(500)
      ;
      title.unique('zodiacs', next);
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
    window.angular.module('common.validators.zodiacs', ['services.validationSvc']).run(['validationSvc', function (validationSvc) {
      validationSvc.registerValidator(validators);
    }]);
  }
  // @endif
}());
