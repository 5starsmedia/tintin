/**
 * @module common.validators.strains
 * @copyright 2014 Cannasos.com. All rights reserved.
 */

(function () {
  'use strict';

  var validators = {
    'strains.put': function (modelState, next) {
      modelState
        .field('title').ifPresent().required().maxLength(25)
        .field('shortTitle.first').maxLength(5)
        .field('shortTitle.second').maxLength(5)
        .field('category._id').ifPresent().required()
        .field('description').maxLength(500)
        .field('typeOfHigh').maxLength(250)
        .field('origin').maxLength(250)
        .field('keywords').maxLength(200)
        .field('THC.min').isFloat().range(0, 100)
        .field('THC.max').isFloat().range(0, 100)
        .field('CBD.min').isFloat().range(0, 100)
        .field('CBD.max').isFloat().range(0, 100)
        .field('CBN.min').isFloat().range(0, 100)
        .field('CBN.max').isFloat().range(0, 100);
      next();
    },
    'strains.post': function (modelState, next) {
      modelState
        .field('title').required().maxLength(25)
        .field('shortTitle.first').required().maxLength(5)
        .field('shortTitle.second').maxLength(5)
        .field('category._id').required()
        .field('description').maxLength(500)
        .field('typeOfHigh').maxLength(250)
        .field('origin').maxLength(250)
        .field('keywords').maxLength(200)
        .field('THC.min').isFloat().range(0, 100)
        .field('THC.max').isFloat().range(0, 100)
        .field('CBD.min').isFloat().range(0, 100)
        .field('CBD.max').isFloat().range(0, 100)
        .field('CBN.min').isFloat().range(0, 100)
        .field('CBN.max').isFloat().range(0, 100);
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
    window.angular.module('common.validators.strains', ['services.validationSvc']).run(['validationSvc', function (validationSvc) {
      validationSvc.registerValidator(validators);
    }]);
  }
  // @endif
}());
