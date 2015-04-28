import posts from './posts/posts';
import categories from './categories/categories';

import editorSelectImages from './ckeditor_plugins/selectImage/plugin.js';

var appName = 'module.news';

var module = angular.module(appName, [
  editorSelectImages,
  posts,
  categories
]);

import mediaembed from './ckeditor_plugins/mediaembed/plugin.js';
import more from './ckeditor_plugins/more.js';
import ad from './ckeditor_plugins/ad.js';

export default appName;