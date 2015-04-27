/**
 * @copyright 2015 5starsmedia.com.ua. All rights reserved.
 */
(function () {
  'use strict';

  var validators = {
    'productCurrencies.put': function (modelState, next) {
      modelState
        .field('title').required().notNull().maxLength(500)
      ;
      next();
    },
    'productCurrencies.post': function (modelState, next) {
      modelState
        .field('title').required().notNull().maxLength(500)
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
    window.angular.module('common.validators.productCategories', ['services.validationSvc']).run(['validationSvc', function (validationSvc) {
      validationSvc.registerValidator(validators);
    }]);
  }
  // @endif
}());
