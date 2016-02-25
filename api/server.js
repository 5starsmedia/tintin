/**
 * Copyright 2015 5starsmedia.com.ua
 */
'use strict';

var express = require('express'),
  http = require('http'),
  serveStatic = require('serve-static'),
  _ = require('lodash'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  async = require('async'),
  cors = require('cors'),
  lynx = require('lynx'),
    fs = require('fs'),
    url = require('url'),
    path = require('path'),
  lynxExpress = require('lynx-express'),
  useragent = require('express-useragent'),
  compression = require('compression'),
  sites = require('./middleware/sites.js'),
  tasks = require('./services/tasks'),
  notification = require('./services/notification'),
  urlSvc = require('./services/url'),
  sequence = require('./services/sequence'),
  broadcast = require('./services/broadcast'),
  socket = require('./services/socket'),
  redirectsSvc = require('./services/redirects'),
  config = require('./config.js'),
  contextService = require('request-context');

var app = {};
app.log = require('./log.js');
app.server = express();
app.config = config;

app.contextService = contextService;
app.server.use(contextService.middleware('request')); // for createdBy plugin

app.models = require('./models');

app.modules = {
  each: function(callFunc) {
    _.forEach(app.modules, function(obj, name) {
      if (typeof obj == 'object') {
        callFunc(obj);
      }
    });
  }
};

var modules = config.get('modules');
_.forEach(modules, function(moduleName) {
  var module = require('./modules/' + moduleName);
  app.modules[moduleName] = new module(app);
});
app.modules.each(function(moduleObj) {
  moduleObj.initModels();
});

app.services = {
  social: require('./services/social'),
  mq: require('./services/mq'),
  modifiers: require('./services/modifiers'),
  data: require('./services/data'),
  hooks: require('./services/hooks'),
  html: new (require('./services/html'))(),
  url: new urlSvc.UrlSvc(app),
  sms: require('./services/sms'),
  mail: require('./services/mail'),
  validation: require('./services/validation'),
  redirects: new redirectsSvc.RedirectsSvc(app),
  notification: new notification.NotificationSvc(app),
  sequence: new sequence.SequenceSvc(app),
  tasks: new tasks.TasksSvc(app),
  broadcast: new broadcast.BroadcastSvc(app),
  socket: new socket.SocketSvc(app)
};

app.modules.each(function(moduleObj) {
  if (moduleObj.initServices) {
    moduleObj.initServices();
  }
});

/* navigation: require('./services/navigation'),
 mail: require('./services/mail'),
 social: require('./services/social'),
 feed: new feed.FeedSvc(app),
 notification: new notification.NotificationSvc(app),
 dashboard: new dashboard.DashboardSvc(app),
 text: new text.TextSvc(app),
 relation: new relation.RelationSvc(app)
 };


 var botRegexp = /developers\.google\.com\/\+\/web\/snippet|google\.com\/webmasters\/tools\/richsnippets|linkedinbot|spider|tumblr|redditbot/i;
 app.server.use(function (req, res, next) {
 metrics.increment('request.counter');
 if (!req.useragent.isBot) {
 if (botRegexp.test(req.headers['user-agent'])) {
 req.useragent.isBot = true;
 }
 }
 next();
 });
 */
app.server.use(compression());
app.server.use(useragent.express());
//app.server.use(responseTime());
function on_error(err) {
  console.error('!!!!!!!!!!!!!!!!!!!', err.message);
}

var metrics = new lynx(app.config.get('statd').host, app.config.get('statd').port, {on_error: on_error});

app.server.use(function (req, res, next) {
  metrics.increment('request.counter');
  next();
});
var statsdMiddleware = lynxExpress(metrics);

// Tell Express to use your statsD middleware
app.server.use(statsdMiddleware({timeByUrl: true}));

app.errors = require('./errors');

app.server.use(bodyParser.json({ limit: '50mb' }));
app.server.use(function (req, res, next) {
  var realIP = req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  req.app = app;
  req.request = {
    id: mongoose.Types.ObjectId().toString('base64'),
    url: req.url,
    method: req.method,
    remoteAddress: realIP,
    remotePort: req.connection.remotePort,
    userAgent: {
      browser: req.useragent.browser,
      version: req.useragent.version,
      os: req.useragent.os,
      platform: req.useragent.platform
    }
  };

  req.logRecord = function (name, msg, level, account, next) {
    var log = new req.app.models.logRecords();
    log.account = account || req.auth.account;
    log.name = name;
    log.level = level;
    log.msg = msg;
    log.req = req.request;

    next = next || account; // if account is not set last parameter is callback
    log.save(function (err) {
      if (err) {
        return next(err);
      }
      next();
    });
  };
  req.log = req.app.log.child({
    req: req.request
  });
  // extend request specific services
  req.services = {
    //relation: new relation.RelationSvc(app, req)
  };
  req.sendJson = function (err, data) {
    if (err) {
      return next(err);
    }
    return res.json(data);
  };
  next();
});

app.log_level = {
  debug: 0,
  info: 1,
  warning: 2,
  error: 3
};


app.server.use(sites());
var corsOptionsDelegate = function(req, callback){
  var site = req.site;
  var corsOptions = { origin: false };
  if(site && site.isCorsEnabled && req.url.search(/^\/api\/webdav/) < 0){
    corsOptions.origin = true;
    corsOptions.credentials = true;
    corsOptions.exposedHeaders = ['x-total-count'];
  }
  callback(null, corsOptions);
};
app.server.use(cors(corsOptionsDelegate));


app.server.use(require('./middleware/auth.js')());

var routes = require('./routes');
app.modules.each(function(moduleObj) {
  moduleObj.initRoutes();
});

routes.init(app);

var urlRewrite = function (rootDir, indexFile) {
  indexFile = indexFile || "index.html";
  return function (req, res, next) {
    var path = url.parse(req.url).pathname;

    return fs.readFile(rootDir + path, function (err, buf) {
      if (!err) { return next(); }
      /*if (path.substring(path.length - 4) == 'html') { // if html file not found
        res.writeHead(404);
        return res.end('Not found');
      }*/
      return fs.readFile(rootDir + '/' + indexFile, function (error, buffer) {
        var resp;
        if (error) {
          return next(error);
        }
        resp = {
          headers: {
            'Content-Type': 'text/html',
            'Content-Length': buffer.length
          },
          body: buffer
        };
        res.writeHead(200, resp.headers);
        return res.end(resp.body);
      });
    });
  };
};

app.server.get('/*', function(req, res, callback) {
  var folder = req.site.url.replace('http://', '').replace('https://', ''),
      rootDir = path.join(__dirname, '/../sites/', folder + '/prod');

  res.setHeader('X-Server', 'Paphos CMS');

  app.log.info('Redirect:', req.site.url + req.url, data.urlTo);
  app.models.redirects.findOne({ urlFrom: req.site.url + req.url, 'site._id': req.site._id }, function(err, data) {
    if (err) { return callback(err); }
    console.info(data)
    if (data) {
      res.writeHead(data.code, {'Location': data.urlTo});

      app.log.info('Redirect:', req.site.url + req.url, data.urlTo);
      return res.end();
    }

    return urlRewrite(rootDir)(req, res, function() {
      serveStatic(rootDir, { etag: false })(req, res, callback);
    });
  });
});

app.server.use(function (err, req, res, next) {
  if (err) {
    var isDev = config.get('env') === 'development';

    req.log.error({err: {name: err.name, stack: err.stack}}, err.message);
    if (err.name === app.errors.NotFoundError.name) {
      var resultErr = {msg: err.message};
      if (isDev) {
        resultErr.stack = err.stack;
      }
      return res.status(404).json(resultErr);
    } else if (err.name === app.errors.ValidationError.name) {
      var r = {hasErrors: true};
      if (err.field) {
        r.fieldErrors = [{field: err.field, msg: err.msg}];
      } else {
        r.summaryErrors = [{msg: err.msg}];
      }
      if (err.errors) {
        r.errors = err.errors;
      }
      return res.status(422).json(r);
    } else if (err.name === app.errors.OperationError.name) {
      return res.status(400).json({msg: err.message});
    }
    return next(err);
  }
  next();
});



var httpServer = null;
exports.start = function (cb) {
  var startDate = Date.now();
  app.log.debug('Starting', config.get('env'), 'configuration ...');

  async.series([
    _.partial(async.parallel, [
      _.partial(app.services.mail.init, app),
      _.partial(app.services.data.loadResources, app),
      _.partial(app.services.modifiers.loadPlugins, app),
      _.partial(app.services.validation.loadValidators, app),
      _.partial(app.services.hooks.loadPlugins, app)
    ]),
    _.partial(async.parallel,
      [
        app.services.broadcast.init.bind(app.services.broadcast),
        app.services.tasks.init.bind(app.services.tasks),
        app.services.states.init.bind(app.services.states)
      ]
    ),
    function (next) {
      app.log.debug('Connecting to mongodb...');
      mongoose.connect(config.get('mongodb'), next);
      mongoose.connection.on('error', function (err) {
        console.log(err);
      });
      mongoose.set('debug', false);
    },
    function (next) {
      app.log.debug('Connected to mongodb successfully');
      next();
    },
    function (next) {
      return next();
      app.log.info('Dropping mongodb database');

      mongoose.connection.db.dropDatabase(function (err) {
        if (err) {
          return next(err);
        }
        app.log.info('Mongodb database dropped successfully');
        next();
      });
    },
    function (next) {
      require('./migrations').migrateToActual(app, next);
    },
    function (next) {
      app.httpServer = http.createServer(app.server);
      app.services.socket.init(next);
    },
    function (next) {
      app.log.debug('Http server starting at', config.get('http.port'), '...');
      app.httpServer.listen(config.get('http.port'), next);
    },
    function (next) {
      app.modules.each(function(moduleObj) {
        if (moduleObj.initServer) {
          moduleObj.initServer();
        }
      });
      next();
    }
    //_.bind(app.services.tasks.start, app.services.tasks, {}),
    //_.bind(app.services.states.start, app.services.states, {})
  ], function (err) {
    if (err) { return cb(err); }

    app.services.tasks.start();
    app.services.states.start();

    app.log.info('Configuration "' + config.get('env') + '" successfully loaded in', Date.now() - startDate, 'ms');

    /*setInterval(function () {
     app.services.mq.push(app, 'events', {name: 'content.unfresh'});
     }, 10*60 * 60 * 1000);
     app.services.mq.push(app, 'events', {name: 'content.unfresh'});
     // app.services.mail.sendTemplate('registerConfirmation', 'vasiliy.shestakov@gmail.com', {userName:'Administrator'});
     */
    cb();
  });
};

exports.stop = function (cb) {
  async.series([
    function (next) {
      app.log.debug('Stopping http server...');
      if (!app.httpServer) { return next(); }
      app.httpServer.close(function (err) {
        if (err) { return next(err);}
        app.log.debug('Http server stopped successfully');
        app.httpServer = null;
        next();
      });
    },
    function (next) {
      app.log.debug('Closing mongodb connection...');
      mongoose.connection.close(function (err) {
        if (err) { return next(err); }
        app.log.debug('Mongodb connection successfully closed');
        next();
      });
    }
  ], cb);
};

exports.app = app;