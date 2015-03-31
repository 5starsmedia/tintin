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
//compression = require('compression'),
  sites = require('./middleware/sites.js'),
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
  validation: require('./services/validation')
};

app.services.sms.sendSms();
/* navigation: require('./services/navigation'),
 tasks: require('./services/tasks'),
 mail: require('./services/mail'),
 social: require('./services/social'),
 feed: new feed.FeedSvc(app),
 notification: new notification.NotificationSvc(app),
 dashboard: new dashboard.DashboardSvc(app),
 text: new text.TextSvc(app),
 relation: new relation.RelationSvc(app)
 };

 app.server.use(compression());

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

app.server.use(bodyParser.json());
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

/*
 app.server.use('/api/share', require('./routes/share.js'));

 app.server.use('/api/files', require('./routes/files.js'));

 app.server.use('/api/html-util', require('./routes/htmlUtil.js'));
 app.server.use('/api/notify', require('./routes/notify.js'));
 app.server.use('/api/blogs', require('./routes/blogs.js'));
 app.server.use('/api/relations', requireAccountMiddleware(), require('./routes/relations.js'));
 app.server.use('/api/messages', requireAccountMiddleware(), require('./routes/messages.js'));
 app.server.use('/api/breadcrumbs', require('./routes/breadcrumbs.js'));

 app.server.use('/api/upload', require('./routes/upload.js'));
 app.server.use('/api/strains', require('./routes/strains.js'));
 app.server.use('/api/likes', require('./routes/likes.js'));
 app.server.use('/api/info', require('./routes/info.js'));
 app.server.use('/api/feeds', requireAccountMiddleware(), require('./routes/feeds.js'));
 app.server.use('/api/notifications', requireAccountMiddleware(), require('./routes/notifications.js'));
 app.server.use('/api/dashboard', require('./routes/dashboard.js'));
 app.server.use('/api/export', require('./routes/export.js'));



 app.server.use(serveFavicon('public/static/favicon/favicon.ico'));
 */
//app.server.use(robots(__dirname + '/robots.txt'));
/*
 var siteMap = sm.createSitemap({
 hostname: 'https://cannasos.com',
 cacheTime: 60 * 1000 * 60,  // 60 milliseconds * 1000 * 60 minutes cache period
 urls: [
 {url: '/strains/', changefreq: 'weekly', priority: 0.7},
 {url: '/advice/', changefreq: 'daily', priority: 0.7},
 {url: '/blog/', changefreq: 'daily', priority: 0.7}
 ]
 });

 app.server.get('/sitemap.xml', function (req, res) {
 res.header('Content-Type', 'application/xml');
 res.send(siteMap.toString());
 });

 //app.server.get('/*', require('./routes/phantomRoute.js'));
 */
//app.server.get('/*', function (req, res) {
/*if (req.useragent.isBot) {
 // req.log.warn('!!!!!!!!!!!!!!!!!!!!!!!!!!!', req.url);
 phantom.create(function (err, ph) {
 if (err) { return next(err); }

 //  req.log.warn('!!!!!!!!!!!!!!!!!!!!!!!!!!! phantom created');

 ph.onError = function (msg, trace) {
 var msgStack = ['PHANTOM ERROR: ' + msg];
 if (trace && trace.length) {
 msgStack.push('TRACE:');
 trace.forEach(function (t) {
 msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : ''));
 });
 }
 req.log.error(msgStack.join('\n'));
 ph.exit();
 };

 var domain = req.headers.host.indexOf(':') !== -1
 ? req.headers.host.substring(0, req.headers.host.indexOf(':'))
 : req.headers.host;

 ph.addCookie({
 name: 'cannasos.isBot',
 value: 'true',
 domain: domain
 });

 if (req.useragent.isMobile) {
 ph.addCookie({
 name: 'cannasos.isMobile',
 value: 'true',
 domain: domain
 });
 }

 ph.createPage(function (err, page) {
 if (err) { return next(err); }
 page.set('viewportSize', {width: 1200, height: 900});
 var url = req.app.config.get('url') + req.url;
 req.log.debug('phantomjs ' + url);

 page.onResourceRequested = function (request) {
 //req.log.debug('onResourceRequested: ' + request[0].url);
 };

 page.onResourceTimeout = function (request) {
 req.log.debug('Response (#' + request.id + '): ' + JSON.stringify(request));
 };

 page.onResourceReceived = function (response) {
 if (response.contentType === 'image/svg+xml;charset=US-ASCII') {
 response.url = '';
 }
 //req.log.debug('onResourceReceived,  id: ' + response.id + ', stage: "' + response.stage + '", response: ' + JSON.stringify(response));
 };

 page.onLoadStarted = function () {
 //var currentUrl = page.evaluate(function () {
 //noinspection JSHint
 //return window.location.href;
 //});
 //req.log.debug('onLoadStarted, leaving url: ' + currentUrl);
 };

 page.onLoadFinished = function (status) {
 //req.log.debug('onLoadFinished, status: ' + status);
 };

 page.onNavigationRequested = function (url, type, willNavigate, main) {
 //req.log.debug('onNavigationRequested, destination_url: ' + url + ', type (cause): ' + type + ', will navigate: ' + willNavigate + ', from page\'s main frame: ' + main);
 };

 page.onResourceError = function (resourceError) {
 req.log.debug('onResourceError, unable to load url: "' + resourceError.url + '", error code: ' + resourceError.errorCode + ', description: ' + resourceError.errorString);
 };

 page.onError = function (msg, trace) {
 var msgStack = ['ERROR: ' + msg];
 if (trace) {
 msgStack.push('TRACE:');
 trace.forEach(function (t) {
 msgStack.push('  -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
 });
 }
 req.log.error('onError: ' + msgStack.join('\n'));
 };

 page.open(url, function (err, status) {
 if (err) { return next(err); }

 if (status === 'success') {
 var intervalFn;
 var period = 100;
 var timeSpent = 0;
 var checker = function () {
 page.evaluate(function () {
 //noinspection JSHint
 var body = document.getElementsByTagName('body')[0];
 if (body.getAttribute('data-status') === 'ready') {
 var scripts = body.getElementsByTagName('script');
 for (var i = scripts.length - 1; i >= 0; i -= 1) {
 body.removeChild(scripts[i]);
 }
 //noinspection JSHint
 return document.getElementsByTagName('html')[0].outerHTML;
 }
 }, function (err, result) {
 if (err) {
 req.log.error(err);
 res.status(503).json({message: 'Service Temporarily Unavailable'});
 ph.exit();
 }

 if (result) {
 clearTimeout(intervalFn);
 req.log.debug('phantomjs ok ' + url);
 res.send(result);
 ph.exit();
 } else if (timeSpent >= 5000) {
 clearTimeout(intervalFn);
 req.log.error('phantomjs timeout error ' + url);
 res.status(503).json({message: 'Service Temporarily Unavailable'});
 ph.exit();
 }
 });
 timeSpent += period;
 };
 intervalFn = setInterval(checker, period);
 }

 if (status === 'fail') {
 req.log.error('phantomjs page open failed ' + url);
 res.status(404).json({message: 'Not Found'});
 ph.exit();
 }
 });
 });
 }, {
 phantomPath: require('phantomjs').path,
 parameters: {
 'ignore-ssl-errors': 'yes',
 'disk-cache': true,
 'max-disk-cache-size': 100 * 1024,
 'load-images': false
 }
 });
 } else {*/
// res.sendFile('index.html', {root: __dirname + '/../'});
//}
//});

app.server.get('/*', serveStatic(__dirname + '/../', {etag: false}));

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
      _.partial(app.services.data.loadResources, app),
      _.partial(app.services.modifiers.loadPlugins, app),
      _.partial(app.services.validation.loadValidators, app),
      _.partial(app.services.hooks.loadPlugins, app),
      //app.services.tasks.init.bind(app.services.tasks),
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
    //_.partial(app.services.tasks.startProcessQueue, app)
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


// close application
process.on('SIGINT', function () {
  exports.stop(function (err) {
    if (err) {
      return app.log.error(err);
    }
    app.log.debug('Application closed successfully');
  });
});

exports.stop = function (cb) {
  async.series([
    function (next) {
      app.log.debug('Stopping http server...');
      if (!httpServer) {
        return next();
      }
      httpServer.close(function (err) {
        if (err) {
          return next(err);
        }
        app.log.debug('Http server stopped successfully');
        next();
      });
    },
    function (next) {
      app.log.debug('Closing mongodb connection...');
      mongoose.connection.close(function (err) {
        if (err) {
          return next(err);
        }
        app.log.debug('Mongodb connection successfully closed');
        next();
      });
    }
  ], cb);
};