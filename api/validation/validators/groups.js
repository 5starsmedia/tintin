/**
 * @module common.validators.groups
 * @copyright 2014 Cannasos.com. All rights reserved.
 */

(function () {
  'use strict';

  var validators = {
    'groups.put': function (modelState, next) {
      var title = modelState.field('title').ifPresent().required().maxLength(200);
      modelState
        .field('description').maxLength(2000)
        .field('rules').maxLength(2000);
      title.unique('groups', next);
    },
    'groups.post': function (modelState, next) {

      // @ifdef NODE
      if (!modelState._req.auth.account.activated) {
        modelState.addError('Your account is inactive. Please confirm your email.');
      }
      // @endif

      var title = modelState.field('title').required().maxLength(200);
      modelState
        .field('description').maxLength(2000)
        .field('rules').maxLength(2000);
      title.unique('groups', next);
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
    window.angular.module('common.validators.groups', ['services.validationSvc']).run(['validationSvc',
      function (validationSvc) {
        validationSvc.registerValidator(validators);
      }]);
  }
  // @endif
}());
