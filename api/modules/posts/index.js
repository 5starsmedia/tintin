'use strict';

var nestedSet = require('../../middleware/nestedSet.js');

function PostsModule(app) {
  this.app = app;
}


PostsModule.prototype.initModels = function () {
  this.app.models.posts = require('./models/post.js');
  this.app.models.categories = require('./models/category.js');
};

PostsModule.prototype.initRoutes = function () {
  this.app.server.use('/api/posts', require('./routes/posts.js'));
  this.app.server.use('/api/categories', nestedSet('categories'));
};

module.exports = PostsModule;