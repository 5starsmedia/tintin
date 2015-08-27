/**
 * @copyright 2015 5starsmedia.com.ua. All rights reserved.
 */
(function () {
  'use strict';

  var validators = {
    'keywordGroups.put': function (modelState, next) {
      modelState
      //  .field('title').required().notNull().maxLength(500)
      //  .field('keywords').required().notNull().maxLength(500)
      ;
      next();
    },
    'keywordGroups.post': function (modelState, next) {
       modelState
         .field('title').required().notNull().maxLength(500)
         .field('keywords').required().notNull().maxLength(500)
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
    window.angular.module('common.validators.menuElements', ['services.validationSvc']).run(['validationSvc', function (validationSvc) {
      validationSvc.registerValidator(validators);
    }]);
  }
  // @endif
}());
