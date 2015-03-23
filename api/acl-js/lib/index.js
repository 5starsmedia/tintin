/**
 * Acl functions
 * @file
 * @copyright 2014 Cannasos.com. All rights reserved.
 * @license GPL V2 (https://github.com/cannasos/acl-js/blob/master/LICENSE)
 */
'use strict';

var _ = require('lodash'),
    util = require('util');
var roles = require('./roles.js');
var rules = require('./rules.js');

/**
 * @namespace
 * @alias util
 */
exports.util = {};

/**
 * @namespace
 * @alias util.mongoose
 */
exports.util.mongoose = require('./util/mongoose.js');

/**
 * @namespace
 * @alias util.json
 */
exports.util.json = require('./util/json.js');

/**
 * @typedef {Object} compareAclResult
 * @property {string[]} fields Allowed fields
 * @property {boolean} hasAccess true, if access granted by ACL
 * @property {string[]} deniedFields Denied fields
 */

/**
 * Returns array of allowed fields for request
 * @param {string[]} props Resource properties list
 * @param {object} acl Access control list
 * @param {{roles,modifiers,method,params,fields}} params Parameters
 * @returns {compareAclResult}
 */
exports.compareAcl = function (props, acl, params) {
  var reqRoles = params.roles;
  var reqModifiers = params.modifiers;
  var reqMethod = params.method;
  var reqParams = params.params;
  var reqFields = params.fields;
  var allowedFields = [], hasAccess = true;

  for (var pathIndex = props.length - 1; pathIndex >= 0; pathIndex -= 1) {
    var pathKey = props[pathIndex];
    var found = false;
    if (_.has(acl, pathKey)) {
      found = true;
      if (rules.compareRule(reqRoles, reqModifiers, reqMethod, reqParams, acl[pathKey])) {
        allowedFields.push(pathKey);
      }
    } else if (pathKey.indexOf('.') !== -1) {
      var pathKeyParts = pathKey.split('.');
      for (var i = pathKeyParts.length - 1; i >= 0; i -= 1) {
        var part = _.first(pathKeyParts, i);

          part = util.isArray(part) ? part.join('.') : part;
        if (_.has(acl, part)) {
          found = true;
          if (rules.compareRule(reqRoles, reqModifiers, reqMethod, reqParams, acl[part])) {
            allowedFields.push(pathKey);
          }
          break;
        }
      }
    }
    if (!found && _.has(acl, '*')) {
      if (rules.compareRule(reqRoles, reqModifiers, reqMethod, reqParams, acl['*'])) {
        allowedFields.push(pathKey);
      }
    }
  }

  if (allowedFields.length === 0) {
    return {fields: [], hasAccess: false, deniedFields: [], reason: 'There is no allowed fields'};
  }

  /* if there are not fields in request.params, then return allowed fields */
  if (!reqFields || reqFields.length === 0) {
    return {fields: allowedFields, hasAccess: hasAccess, deniedFields: []};
  }

  /* if fields in request.params is not empty then get them from allowed fields */
  reqFields = _.isArray(reqFields) ? reqFields : [reqFields];

  var fields = [];
  var deniedFields = [];
  for (var n = reqFields.length - 1; n >= 0; n -= 1) {
    var reqField = reqFields[n];
    var foundInFields = false;
    for (var m = allowedFields.length - 1; m >= 0; m -= 1) {
      var allowedField = allowedFields[m];
      var dotIndex = allowedField.indexOf('.');
      if (allowedField === reqField || (dotIndex !== -1 && allowedField.substr(0, dotIndex) === reqField)) {
        fields.push(allowedField);
        foundInFields = true;
      }
    }
    if (!foundInFields) {
      hasAccess = false;
      deniedFields.push(reqField);
    }
  }

  if (!fields || fields.length === 0) {
    hasAccess = false;
  }

  if (deniedFields.length > 0) {
    hasAccess = false;
  }

  return {fields: fields, hasAccess: hasAccess, deniedFields: deniedFields};
};

/**
 * Get options
 * @param options
 * @param {{roles,modifiers}} params Parameters
 * @returns {object} Object with options
 */
exports.getOptions = function (options, params) {
  return _.transform(options, function (result, value, option) {
    if (_.isArray(value)) {
      for (var i = 0; i < value.length; i += 1) {
        if (value[i].role !== '*' && roles.compareRoles(params.roles, params.modifiers, value[i].role)) {
          result[option] = value[i].value;
          break;
        }
      }
      if (!result[option]) {
        var wildcard = _.find(value, {role: '*'});
        if (wildcard) {
          result[option] = wildcard.value;
        }
      }
    } else {
      result[option] = value;
    }
  });
};
