/**
 * Copyright 2015 5starsmedia.com.ua
 */
'use strict';

var express = require('express'),
  http = require('http'),
//responseTime = require('response-time'),
//serveFavicon = require('serve-favicon'),
  serveStatic = require('serve-static'),
  _ = require('lodash'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  async = require('async'),
  cors = require('cors'),
  lynx = require('lynx'),
  lynxExpress = require('lynx-express'),
  useragent = require('express-useragent'),
  compression = require('compression'),
  sites = require('./middleware/sites.js'),
  tasks = require('./services/tasks'),
  sequence = require('./services/sequence'),
  crawler = require('./services/crawler'),
  googleSvc = require('./services/google'),
  yandexSvc = require('./services/yandex'),
  config = require('./config.js');
//phantom = require('node-phantom'),
//robots = require('robots.txt'),
//sm = require('sitemap');

var app = {};
app.log = require('./log.js');
app.server = express();
app.config = config;

app.models = require('./models');
app.services = {
  social: require('./services/social'),
  mq: require('./services/mq'),
  modifiers: require('./services/modifiers'),
  data: require('./services/data'),
  hooks: require('./services/hooks'),
  html: new (require('./services/html'))(),
  url: require('./services/url'),
  sms: require('./services/sms'),
  mail: require('./services/mail'),
  validation: require('./services/validation'),
  sequence: new sequence.SequenceSvc(app),
  crawler: new crawler.CrawlerSvc(app),
  tasks: new tasks.TasksSvc(app),
  google: new googleSvc.GoogleSvc(app),
  yandex: new yandexSvc.YandexSvc(app)
};

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
  var realIP = null;//req.header('x-real-ip');
  req.app = app;
  req.request = {
    id: mongoose.Types.ObjectId().toString('base64'),
    url: req.url,
    method: req.method,
    remoteAddress: realIP || req.connection.remoteAddress,
    remotePort: req.connection.remotePort,
    userAgent: {
      browser: req.useragent.Browser,
      version: req.useragent.Version,
      os: req.useragent.OS,
      platform: req.useragent.Platform
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
  if(site && site.isCorsEnabled){
    corsOptions.origin = true;
    corsOptions.credentials = true;
  }
  callback(null, corsOptions);
};
app.server.use(cors(corsOptionsDelegate));


var routes = require('./routes');
routes.init(app);

app.server.get('/*', serveStatic(__dirname + '/..', {etag: false}));

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
      _.partial(app.services.hooks.loadPlugins, app),
      app.services.tasks.init.bind(app.services.tasks)
    ]),
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
      app.log.debug('Http server starting at', config.get('http.port'), '...');
      httpServer = http.createServer(app.server);
      httpServer.listen(config.get('http.port'), next);
    },
    function (next) {
      app.log.debug('Http server started successfully');
      //refreshStrainsStats(app, next);
      next();
    },
    _.bind(app.services.tasks.start, app.services.tasks)
  ], function (err) {
    if (err) {
      return cb(err);
    }
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
