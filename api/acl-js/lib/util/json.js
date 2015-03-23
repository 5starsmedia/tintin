/**
 * Json util functions
 * @file
 * @copyright 2014 Cannasos.com. All rights reserved.
 * @license GPL V2 (https://github.com/cannasos/acl-js/blob/master/LICENSE)
 */
'use strict';

var _ = require('lodash');

function schemaWalk(array, prefix, level, jsonObject) {
  _.forOwn(jsonObject, function (value, key) {
    var thisName = (prefix ? prefix + '.' : '') + key;
    var next = _.partial(schemaWalk, array, thisName, level + 1);
    if (_.isArray(value)) {
      _.each(value, next);
    } else if (_.isPlainObject(value)) {
      next(value);
    } else {
      array.push(thisName);
    }
  });
}

/**
 * Returns plain fields from json object
 * @function getFields
 * @memberOf util.json
 * @param {object} jsonObject Json object
 * @returns {string[]} Returns plain array of object fields
 * @public
 * @example
 * var obj = {
 *   x:10,
 *   y:{ a:20, z:13 }
 * };
 * getFields(obj);
 * // returns ['x', 'y.a', 'y.z']
 */
exports.getFields = function (jsonObject) {
  var props = [];
  schemaWalk(props, '', 0, jsonObject);
  return _.uniq(props);
};
