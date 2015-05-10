/**
 * Url helpers
 * @module services/url
 * @copyright 2014 Cannasos.com. All rights reserved.
 */
'use strict';

var _ = require('lodash'),
  slug = require("limax");

exports.aliasFor = function (app, text, options, cb) {
  if (!text) { return cb(new Error('Text for alias is empty')); }
  options = _.defaults(_.clone(options || {}), {maxLength: 200});
  var result = slug(text);
  result = result.substr(0, options.maxLength);
  cb(null, result);
};

exports.urlFor = function(collectionName, params) {

  switch (collectionName) {
    case 'posts':
      return '/' + params.category.parentAlias + '/' + params.category.alias + '/' + params.alias + '.html';
  }

};