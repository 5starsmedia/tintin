import posts from './posts/posts';

var appName = 'module.news';

var module = angular.module(appName, [
  posts
]);

import editorSelectImages from './ckeditor_plugins/select-images.js';
import mediaembed from './ckeditor_plugins/mediaembed/plugin.js';
module.directive('editorSelectImages', editorSelectImages);

export default appName;