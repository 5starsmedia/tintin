'use strict';

var nestedSet = require('../../middleware/nestedSet.js');

function PostsModule(app) {
  this.app = app;
}


PostsModule.prototype.initModels = function () {
  this.app.models.posts = require('./models/post.js');
  this.app.models.categories = require('./models/category.js');
  this.app.models.pageSections = require('./models/pageSection.js');
};

PostsModule.prototype.initRoutes = function () {
  this.app.server.use('/api/posts/feed', require('./routes/feed.js'));
  this.app.server.use('/api/posts', require('./routes/posts.js'));
  this.app.server.use('/api/categories', nestedSet('categories', { fields: ['postType'] }));
};

module.exports = PostsModule;