import posts from './posts/posts';
import categories from './categories/categories';
import dashboard from './dashboard/dashboard';

import editorSelectImages from './ckeditor_plugins/selectImage/plugin.js';
import editorSelectFiles from './ckeditor_plugins/selectImage/plugin2.js';

var appName = 'module.posts';

var module = angular.module(appName, [
  editorSelectImages,
  editorSelectFiles,
  posts,
  categories,
  dashboard
]);

import mediaembed from './ckeditor_plugins/mediaembed/plugin.js';
import more from './ckeditor_plugins/more.js';
import ad from './ckeditor_plugins/ad.js';

export default appName;