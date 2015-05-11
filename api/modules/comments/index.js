'use strict';

var nestedSet = require('../../middleware/nestedSet.js');

function PostsModule(app) {
  this.app = app;
}


PostsModule.prototype.initModels = function () {
  this.app.models.comments = require('./models/comments.js');
};

PostsModule.prototype.initRoutes = function () {
};

module.exports = PostsModule;