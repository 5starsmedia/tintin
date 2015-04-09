/**
 * @copyright 2015 5starsmedia.com.ua. All rights reserved.
 */
(function () {
  'use strict';

  var validators = {
    'products.put': function (modelState, next) {
      modelState
        .field('title').ifPresent().maxLength(500)
        .field('category._id').ifPresent().required()
        .field('body').ifPresent().maxLength(65000)
      ;
      next();
    },
    'products.post': function (modelState, next) {
       modelState
         .field('title').required().notNull().maxLength(500)
         .field('category._id').ifPresent().required()
         .field('body').ifPresent().maxLength(65000)
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
    window.angular.module('common.validators.products', ['services.validationSvc']).run(['validationSvc', function (validationSvc) {
      validationSvc.registerValidator(validators);
    }]);
  }
  // @endif
}());
