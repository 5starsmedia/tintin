'use strict';

var nestedSet = require('../../middleware/nestedSet.js');

function ContactsModule(app) {
  this.app = app;
}


ContactsModule.prototype.initModels = function () {
  this.app.models.contacts = require('./models/contact.js');
  this.app.models.feedbacks = require('./models/feedback.js');
  this.app.models.contactsGeo = require('./models/contactsGeo.js');
};

ContactsModule.prototype.initServices = function () {
};

ContactsModule.prototype.initRoutes = function () {
//  this.app.server.use('/api/issues', require('./routes/issues.js'));
};

module.exports = ContactsModule;