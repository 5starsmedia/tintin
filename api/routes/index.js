exports.init = function (app) {

  var access = require('../middleware/access.js'),
    requireAccount = require('../middleware/requireAccount.js'),
    nestedSet = require('../middleware/nestedSet.js'),
    resourceRoute = require('./resource.js');

  app.server.use(require('../middleware/auth.js')());

  app.server.use('/api/auth/permissions', requireAccount(), require('./permissions.js'));
  app.server.use('/api/auth', require('./auth.js'));

  app.server.use('/api/posts', require('./posts.js'));

  app.server.use('/api/upload', require('./upload.js'));
  app.server.use('/api/files', require('./files.js'));

  app.server.use('/api/productTypes', nestedSet('productTypes'));
  app.server.use('/api/productCategories', nestedSet('productCategories'));

  app.server.get('/api/:resource', access(), resourceRoute);
  app.server.get('/api/:resource/:_id', access(), resourceRoute);
  app.server.post('/api/:resource', access(), resourceRoute);
  app.server.put('/api/:resource/:_id', access(), resourceRoute);
  app.server.delete('/api/:resource/:_id', access(), resourceRoute);

};