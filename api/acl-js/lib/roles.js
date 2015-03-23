/**
 * Roles functions
 * @file
 * @copyright 2014 Cannasos.com. All rights reserved.
 * @license GPL V2 (https://github.com/cannasos/acl-js/blob/master/LICENSE)
 */
'use strict';

var _ = require('lodash');

exports.parseRolesString = function (roles) {
  var parsed = [];
  var spl;
  if (!_.isArray(roles)) {
    spl = _.without(roles.trim().split(','), '');
  }
  else {
    spl = roles;
  }
  for (var i = spl.length - 1; i >= 0; i -= 1) {
    var item = spl[i].trim().split(':');
    var modifiers = item.length > 1 ? item[1].split('&') : [];
    parsed.push({name: item[0], modifiers: modifiers});
  }
  return parsed;
};

/**
 * Compares two roles
 * @param reqRole Request role
 * @param reqModifiers Request modifiers
 * @param aclRole ACL role
 * @returns {boolean}
 * @private
 */
exports.compareRole = function (reqRole, reqModifiers, aclRole) {
  if (reqRole === aclRole.name || aclRole.name === '*') {
    for (var i = aclRole.modifiers.length - 1; i >= 0; i -= 1) {
      if (_.indexOf(reqModifiers, aclRole.modifiers[i]) === -1) {
        return false;
      }
    }
    return true;
  }
  return false;
};

/**
 * Compares roles by pairs
 * @param reqRoles Request roles
 * @param reqModifiers Request modifiers
 * @param aclRoles ACL roles
 * @returns {boolean}
 * @private
 */
exports.compareRoles = function (reqRoles, reqModifiers, aclRoles) {
  if (_.isString(aclRoles) && aclRoles === '*') {
    return true;
  }

  reqRoles = _.isArray(reqRoles) ? reqRoles : [reqRoles];
  aclRoles = exports.parseRolesString(aclRoles);

  for (var i = reqRoles.length - 1; i >= 0; i -= 1) {
    var reqRole = reqRoles[i];
    for (var j = aclRoles.length - 1; j >= 0; j -= 1) {
      var aclRole = aclRoles[j];
      if (exports.compareRole(reqRole, reqModifiers, aclRole)) {
        return true;
      }
    }
  }
  return false;
};
