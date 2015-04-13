import posts from './posts/posts';
import categories from './categories/categories';

var appName = 'module.news';

var module = angular.module(appName, [
  posts,
  categories
]);

import editorSelectImages from './ckeditor_plugins/select-images.js';
import mediaembed from './ckeditor_plugins/mediaembed/plugin.js';
module.directive('editorSelectImages', editorSelectImages);

export default appName;