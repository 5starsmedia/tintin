'use strict';

var _ = require('lodash'),
  locale = require('locale');

// lookup methods
var lookups = {
  'cookie': function (req, options) {
    if (req.cookies) {
      return req.cookies[options.cookie.name];
    }
  },
  'domain': function (req, options) {
    if (options.map && options.map.domain && req.host) {
      return options.map.domain[req.host];
    }
  },
  'accept-language': function (req, options) {
    var locales = new locale.Locales(req.headers['accept-language']),
      detect = locales.best(new locale.Locales(options.allowed)) || {};

    return detect.code;
  },
  'default': function (req, options) {
    return options['default'];
  }
};

// filter wrong formats (and optionally non-allowed values)
function filter(locale, options) {
  if (locale && locale.length === 5) {
    if (!options.allowed) {
      return locale;
    }
    if (options.allowed.indexOf(locale) >= 0) {
      return locale;
    }
  }
}

// complete languages to locale (if options available)
function complete(locale, options) {
  if (locale && locale.length === 2 && options.map) {
    if (options.map.language) {
      return options.map.language[locale.toLowerCase()];
    }
  }
  return locale;
}

// lookup locale using speficied source method
function lookup(source, req, options) {
  if (!lookups[source]) {
    throw Error('Locale lookup source method "' + source + '" not defined');
  }
  return filter(complete(lookups[source](req, options), options), options);
}

module.exports = function (config) {
  var options = config || {};

  options.cookie = options.cookie || {name: 'locale'};
  options.priority = options.priority || ['accept-language', 'default'];

  return function (req, res, next) {
    var host = req.headers.host, port = 80;

    if (process.env.PAPHOS_SITE) {
      host = process.env.PAPHOS_SITE;
    }

    if (!host) {
      return;
    }

    var offset = host[0] === '[' ? host.indexOf(']') + 1 : 0;
    var index = host.indexOf(':', offset)

    if (index > -1) {
      port = host.substring(index + 1);
    }
    host = (index !== -1) ? host.substring(0, index) : host;

    req.app.models.sites.findOne({ domain: host, port: port }, function (err, site) {
      if (err) {
        return next(err);
      }
      if (!site) {
        res.status(418).json({ domain: host, msg: 'I\'m a teapot', port: port });
        return;
      }
      req.site = site;

      var url = site.isHttps ? 'https' : 'http';
      url += '://' + site.domain;
      if (site.port && site.port != 80) {
        url += ':' + site.port;
      }
      req.site.url = url;
      req.app.config.set('url', url);

      options['default'] = site.defaultLocale;
      options.allowed = ['en_GB', 'ru_RU', 'uk_UA'];
      options.priority.some(function (source) {
        var locale = lookup(source, req, options);
        if (locale) {
          req.locale = {
            code: locale,
            source: source
          };
        }
        return locale;
      });
      next();
    });
  };
};