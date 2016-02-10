import posts from './posts/posts';
import categories from './categories/categories';
import dashboard from './dashboard/dashboard';
import builder from './builder/builder';

import editorSelectImages from './ckeditor_plugins/selectImage/plugin.js';

var appName = 'module.posts';

var module = angular.module(appName, [
  editorSelectImages,
  posts,
  categories,
  dashboard,
  builder
]);

import mediaembed from './ckeditor_plugins/mediaembed/plugin.js';
import more from './ckeditor_plugins/more.js';
import ad from './ckeditor_plugins/ad.js';
import link from './ckeditor_plugins/link.js';

export default appName;