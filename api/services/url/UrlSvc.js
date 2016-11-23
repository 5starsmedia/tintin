'use strict';

var _ = require('lodash'),
  moment = require('moment'),
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
      var url = '/';
      if (params.postType == 'news') {
        return url + 'news/' + moment(params.createDate).format('YYYY/MM/DD/') + params.alias;
      }
      if (params.category.parentAlias) {
        url += params.category.parentAlias + '/';
      }
      return url + params.category.alias + '/' + params.alias + '.html';

    case 'categories':
      if (!params.parentAlias) {
        if (!params.alias) {
          return null;
        }
        return '/' + params.alias;
      }
      return '/' + params.parentAlias + '/' + params.alias;

    case 'files':
      return '/api/files/' + params._id;
  }
};


module.exports = UrlSvc;
