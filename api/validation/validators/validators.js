/**
 * @module common.validators
 * @copyright 2014 Cannasos.com. All rights reserved.
 */

(function () {
  'use strict';

  // @ifdef BROWSER
  if (typeof window !== 'undefined' && window.angular) {
    window.angular.module('common.validators', [
      'common.validators.strains',
      'common.validators.strainConditions',
      'common.validators.strainFlavors',
      'common.validators.strainCategories',
      'common.validators.strainSymptoms',
      'common.validators.strainEffects',

      'common.validators.strainFlavorCategories',
      'common.validators.strainFlavorGroups',

      'common.validators.users',
      'common.validators.ageCategories',
      'common.validators.animals',
      'common.validators.usageTimes',
      'common.validators.zodiacs',

      'common.validators.advices',
      'common.validators.blogs',

      'common.validators.accountBans',
      'common.validators.groups'
    ]);
  }
  // @endif
}());
