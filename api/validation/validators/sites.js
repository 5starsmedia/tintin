/**
 * @copyright 2015 5starsmedia.com.ua. All rights reserved.
 */
(function () {
  'use strict';

  var validators = {
    'sites.put': function (modelState, next) {
      modelState
        .field('title').ifPresent().required().notNull().maxLength(500)
        .field('domain').required().notNull().maxLength(120)
      ;
      next();
    },
    'sites.post': function (modelState, next) {
       modelState
         .field('title').ifPresent().required().notNull().maxLength(500)
         .field('domain').required().notNull().maxLength(120)
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
    window.angular.module('common.validators.sites', ['services.validationSvc']).run(['validationSvc', function (validationSvc) {
      validationSvc.registerValidator(validators);
    }]);
  }
  // @endif
}());
