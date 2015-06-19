'use strict';

var nestedSet = require('../../middleware/nestedSet.js'),
  crawler = require('./services/crawler'),
  googleSvc = require('./services/google'),
  yandexSvc = require('./services/yandex'),
  seoSvc = require('./services/seo');

function KeywordsModule(app) {
  this.app = app;
}


KeywordsModule.prototype.initModels = function () {
  this.app.models.crawledUrls = require('./models/crawledUrl.js');
  this.app.models.keywordProjects = require('./models/keywordProject.js');
  this.app.models.keywordGroups = require('./models/keywordGroup.js');
  this.app.models.seoTasks = require('./models/seoTask.js');
  this.app.models.seoUrls = require('./models/seoUrl.js');
  this.app.models.seoStatHistories = require('./models/seoStatHistory.js');
};

KeywordsModule.prototype.initServices = function () {
  this.app.services.google = new googleSvc.GoogleSvc(this.app);
  this.app.services.yandex = new yandexSvc.YandexSvc(this.app);
  this.app.services.crawler = new crawler.CrawlerSvc(this.app);
  this.app.services.seo = new seoSvc.SeoSvc(this.app);
};

KeywordsModule.prototype.initRoutes = function () {
  //this.app.server.use('/api/keywordProjects', require('./routes/keywordProjects.js'));
  this.app.server.use('/api/keywordGroups', require('./routes/keywordGroups.js'));
  this.app.server.use('/api/crawledUrls', require('./routes/crawledUrls.js'));
  this.app.server.use('/api/text-unique', require('./routes/text-unique.js'));
  this.app.server.use('/api/seoTasks', require('./routes/seoTasks.js'));
  this.app.server.use('/api/seoStatHistories', require('./routes/seoStatHistories.js'));
};

module.exports = KeywordsModule;