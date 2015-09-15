/**
 * @ngdoc factory
 * @name modelState
 * @module common.services.modelSrv.modelState
 * @copyright 2014 Cannasos.com. All rights reserved.
 */

(function () {
  'use strict';

  var isFloatRegex = /^(?:-?(?:[0-9]+))?(?:\.[0-9]+)?$/;
  var isIntRegex = /^(?:-?(?:0|[1-9][0-9]*))$/;
  var isHexColorRegex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  var isEmailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

  function ValidationContext(modelState, fieldName, value, presents, _
                             // @ifdef NODE
    , req
                             // @endif
  ) {
    this.modelState = modelState;
    this.fieldName = fieldName;
    this._ = _;
    this.skip = false;
    this.value = value;
    this.presents = presents;
    // @ifdef NODE
    this._req = req;
    // @endif
  }

  ValidationContext.prototype.ifPresent = function () {
    if (!this.skip) {
      if (!this.presents) {
        this.skip = true;
      }
    }
    return this;
  };

  ValidationContext.prototype.required = function () {
    if (!this.skip) {
      if (typeof this.value === 'undefined' || (typeof this.value === 'string' && !this.value)) {
        console.log(this.value);
        this.modelState.addError('Field is required', this.fieldName);
        this.skip = true;
      }
    }
    return this;
  };

  ValidationContext.prototype.notNull = function () {
    if (!this.skip) {
      if (this.value === null) {
        this.modelState.addError('Field is required', this.fieldName);
        this.skip = true;
      }
    }
    return this;
  };

  ValidationContext.prototype.minArrayCount = function (length) {
    if (!this.skip && this._.isArray(this.value)) {
      if (this.value.length < length) {
        this.modelState.addError('Minimum length is ' + length, this.fieldName);
        this.skip = true;
      }
    }
    return this;
  };

  ValidationContext.prototype.maxLength = function (length) {
    if (!this.skip && this._.isString(this.value)) {
      if (this.value.length > length) {
        this.modelState.addError('Maximum length is ' + length, this.fieldName);
        this.skip = true;
      }
    }
    return this;
  };

  ValidationContext.prototype.isInt = function () {
    if (!this.skip && this.presents && this.value) {
      if (!isIntRegex.test(this.value)) {
        this.modelState.addError('Must be a integer', this.fieldName);
        this.skip = true;
      }
    }
    return this;
  };

  ValidationContext.prototype.range = function (minValue, maxValue) {
    return this.min(minValue).max(maxValue);
  };

  ValidationContext.prototype.min = function (minValue) {
    if (!this.skip && this.presents) {
      if (this.value < minValue) {
        this.modelState.addError('Must be >= ' + minValue, this.fieldName);
        this.skip = true;
      }
    }
    return this;
  };

  ValidationContext.prototype.max = function (maxValue) {
    if (!this.skip && this.presents) {
      if (this.value > maxValue) {
        this.modelState.addError('Must be <= ' + maxValue, this.fieldName);
        this.skip = true;
      }
    }
    return this;
  };

  ValidationContext.prototype.isEmail = function () {
    if (!this.skip && this.presents && this.value) {
      if (!isEmailRegex.test(this.value)) {
        this.modelState.addError('Must be a valid email', this.fieldName);
        this.skip = true;
      }
    }
  };

  ValidationContext.prototype.isFloat = function () {
    if (!this.skip && this.presents && this.value) {
      if (!isFloatRegex.test(this.value)) {
        this.modelState.addError('Must be a floating point', this.fieldName);
        this.skip = true;
      }
    }
    return this;
  };

  ValidationContext.prototype.isHexColor = function () {
    if (!this.skip && this.presents && this.value) {
      if (!isHexColorRegex.test(this.value)) {
        this.modelState.addError('Must be a hex color', this.fieldName);
        this.skip = true;
      }
    }
    return this;
  };

  ValidationContext.prototype.field = function (fieldName) {
    return this.modelState.field(fieldName);
  };

  ValidationContext.prototype.unique = function (modelName, cb) {
    cb();
  };

  // @ifdef NODE
  ValidationContext.prototype.unique = function (modelName, cb) {
    var self = this;
    var query = {};
    if (this.modelState.model._id) {
      query._id = {$ne: this.modelState.model._id};
    }
    query[this.fieldName] = this.value;
    this._req.app.models[modelName].count(query, function (err, count) {
      if (err) { return cb(err); }
      if (count !== 0) {
        self.modelState.addError('Must be unique', self.fieldName);
      }
      cb();
    });
  };
  // @endif

  /**
   * Creates a new ModelState instance
   * @constructor
   */
  function ModelState(model, _
                      // @ifdef NODE
    , req
                      // @endif
  ) {
    /**
     * true, if have field or summary errors, otherwise have false value
     * @type {boolean}
     */
    this.hasErrors = false;
    /**
     * Array with field errors
     * @type {Array}
     */
    this.fieldErrors = [];
    /**
     * Array with summary errors
     * @type {Array}
     */
    this.summaryErrors = [];
    // @ifdef NODE
    this._req = req;
    // @endif
    this._ = _;
    /**
     * Model for validation
     */
    this.model = model;
  }

  ModelState.prototype.toJSON = function () {
    return this._.pick(this, ['hasErrors', 'fieldErrors', 'summaryErrors']);
  };

  /**
   * Reset the model state to default values (clean fieldErrors, summaryErrors, hasErrors,...)
   */
  ModelState.prototype.reset = function () {
    this.hasErrors = false;
    this.fieldErrors.length = 0;
    this.summaryErrors.length = 0;
  };

  ModelState.prototype.has = function (field) {
    return this._.has(this.model, field);
  };

  /**
   * Add error information to model state
   * @param {string} message Error message
   * @param {string} [field] Associate error message with field (for example, account.name)
   */
  ModelState.prototype.addError = function (message, field) {
    this.hasErrors = true;
    if (typeof field === 'undefined') {
      this.summaryErrors.push({msg: message});
    } else {
      this.fieldErrors.push({msg: message, field: field});
    }
  };

  function getFieldInfo(_, model, fieldName) {
    if (fieldName.length > 1 && _.has(model, fieldName[0])) {
      return getFieldInfo(_, model[fieldName[0]], fieldName.slice(1));
    } else {
      return {
        presents: _.has(model, fieldName[0]),
        value: model[fieldName[0]]
      };
    }
  }

  ModelState.prototype.field = function (field) {
    var spl = field.split('.');
    var info = {};
// @ifdef NODE
    if (typeof module !== 'undefined' && module.exports) {
      info = {presents: this._.has(this.model, field), value: this.model[field]};
    } else {
// @endif
      info = getFieldInfo(this._, this.model, spl.length > 0 ? spl : [field]);
// @ifdef NODE
    }
    // @endif
    return new ValidationContext(this, field, info.value, info.presents, this._, this._req);
  };

// @ifdef NODE
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = function (model, req) {return new ModelState(model, require('lodash'), req);};
  }
// @endif

// @ifdef BROWSER
  if (typeof window !== 'undefined' && window.angular) {
    window.angular.module('common.factories.modelStateFactory', []).factory('modelStateFactory', function () {
      return function (model) {
        return new ModelState(model, window._);
      };
    });
  }
// @endif
}());
