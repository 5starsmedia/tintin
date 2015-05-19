'use strict';

var _ = require('lodash'),
  slug = require('limax');

function UrlSvc(app) {
  this.app = app;
}

UrlSvc.prototype.aliasFor = function (app, text, options, cb) {
  if (!text) { return cb(new Error('Text for alias is empty')); }
  options = _.defaults(_.clone(options || {}), {maxLength: 200});
  var result = slug(text, { lang: 'ru' });
  result = result.substr(0, options.maxLength);
  cb(null, result);
};

UrlSvc.prototype.urlFor = function (collectionName, params) {
  switch (collectionName) {
    case 'posts':
      return '/' + params.category.parentAlias + '/' + params.category.alias + '/' + params.alias + '.html';
  }
};


module.exports = UrlSvc;
