/**
 * @module common.validators.blogs
 * @copyright 2014 Cannasos.com. All rights reserved.
 */

(function () {
  'use strict';

  var validators = {
    'blogs.put': function (modelState, next) {
      modelState
        .field('title').required().maxLength(100)
        .field('category._id').ifPresent().required()
        .field('preview').ifPresent().required().maxLength(160)
        .field('description').maxLength(20000)
      ;
      next();
    },
    'blogs.post': function (modelState, next) {
      /* modelState
       .field('title').ifPresent().required().maxLength(200)
       .field('category._id').ifPresent().required()
       .field('preview').ifPresent().required().maxLength(200)
       .field('description').ifPresent().maxLength(20000)
       ;*/
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
    window.angular.module('common.validators.blogs', ['services.validationSvc']).run(['validationSvc', function (validationSvc) {
      validationSvc.registerValidator(validators);
    }]);
  }
  // @endif
}());
