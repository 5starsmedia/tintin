/**
 * @copyright 2015 5starsmedia.com.ua. All rights reserved.
 */
(function () {
  'use strict';

  var validators = {
    'posts.put': function (modelState, next) {
      modelState
        .field('title').required().notNull().maxLength(500)
        .field('status').required().isInt()
      ;

      if (modelState.model.status != 1) {
        modelState.field('category._id').required().notNull()
          .field('body').required().notNull().maxLength(20000)
        ;
      }
      next();
    },
    'posts.post': function (modelState, next) {
       modelState
         .field('title').required().notNull().maxLength(500)
         .field('status').required().isInt()
       ;

      if (modelState.model.status != 1) {
        modelState.field('category._id').required().notNull()
          .field('body').required().notNull().maxLength(20000)
        ;
      }
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
    window.angular.module('common.validators.posts', ['services.validationSvc']).run(['validationSvc', function (validationSvc) {
      validationSvc.registerValidator(validators);
    }]);
  }
  // @endif
}());
