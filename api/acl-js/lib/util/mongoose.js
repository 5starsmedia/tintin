'use strict';

var _ = require('lodash');

/**
 * Internal recursive schema walker
 * @param {object} schema Mongoose schema
 * @param {string[]} array Accumulator array
 * @param {string} prefix Property prefix
 * @param {int} level Property level
 * @private
 */
function schemaWalk(schema, array, prefix, level) {
  /**
   * @param {string} pathName
   * @param {{options:{auto, type}, schema}} pathType
   * @private
   */
  function f(pathName, pathType) {
    var thisName = (prefix ? prefix + '.' : '') + pathName;
    if (_.isArray(pathType.options.type)) {
      schemaWalk(pathType.schema, array, thisName, level + 1);
    } else if (level === 0 || !pathType.options.auto) {
      array.push(thisName);
    }
  }
  schema.eachPath(f);
}

/**
 * Get plain fields from mongoose schema
 * @function getFields
 * @memberOf util.mongoose
 * @param schema Mongoose schema
 * @returns {string[]} Returns plain array of schema fields
 * @example
 * var schema = mongoose.Schema({
 *   x:String,
 *   y:{ a:String, z:String }
 * });
 * getFields(schema);
 * // returns ['x', 'y.a', 'y.z']
 */
exports.getFields = function (schema) {
  var props = [];
  schemaWalk(schema, props, '', 0);
  return props;
};
