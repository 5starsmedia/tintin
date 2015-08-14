'use strict';

var _ = require('lodash');
var roles = require('./roles.js');

/**
 * Compares rule
 * @param reqRoles Roles from request
 * @param reqModifiers Request modifiers
 * @param reqMethod Request method
 * @param reqParams Request params
 * @param {object} rule ACL rule
 * @returns {boolean}
 * @private
 */
exports.compareRule = function (reqRoles, reqModifiers, reqMethod, reqParams, rule) {
  if (_.isBoolean(rule) && rule === false) {
    return false;
  }
  reqParams = _.isArray(reqParams) ? reqParams : [reqParams];

  for (var aclMethod in rule) {
    if (rule.hasOwnProperty(aclMethod)) {
      var aclRoles = rule[aclMethod];
      var aclParams = [];
      if (aclMethod.indexOf('?') !== -1) {
        var sp = aclMethod.split('?');
        aclMethod = sp[0];
        aclParams = [sp[1]];
        if (aclParams[0].indexOf('&') !== -1) {
          aclParams = aclParams[0].split('&');
        }
      }
      if (aclMethod === reqMethod &&
        aclParams.length === reqParams.length &&
        _.intersection(aclParams, reqParams).length === aclParams.length &&
        roles.compareRoles(reqRoles, reqModifiers, aclRoles)) {
        return true;
      }
    }
  }
  return false;
};
