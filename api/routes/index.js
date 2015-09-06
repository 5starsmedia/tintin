var git = require('git-rev');

exports.init = function (app) {

  var access = require('../middleware/access.js'),
    resourceRoute = require('./resource.js');

  app.server.get('/api', function(req, res, next){
    git.short(function (short) {
      git.branch(function (branch) {
        var version = branch + '@' + short;

        res.json({ version: version })
      });
    });
  });

  app.server.get('/api/:resource', access(), resourceRoute);
  app.server.get('/api/:resource/:_id', access(), resourceRoute);
  app.server.post('/api/:resource', access(), resourceRoute);
  app.server.put('/api/:resource/:_id', access(), resourceRoute);
  app.server.delete('/api/:resource/:_id', access(), resourceRoute);

};