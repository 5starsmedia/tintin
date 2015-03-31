'use strict';

var _ = require('lodash'),
  cheerio = require('cheerio'),
  request = require('request');

var shorthandProperties = {
  'image': 'image:url',
  'video': 'video:url',
  'audio': 'audio:url'
};

function parse(html, options) {
  options = options || {};

  var $ = cheerio.load(html);

  // Check for xml namespace
  var namespace, $html = $('html');

  if ($html.length) {
    var attribKeys = Object.keys($html[0].attribs);

    attribKeys.some(function (attrName) {
      var attrValue = $html.attr(attrName);

      if (attrValue.toLowerCase() === 'http://opengraphprotocol.org/schema/'
        && attrName.substring(0, 6) === 'xmlns:') {
        namespace = attrName.substring(6);
        return false;
      }
    });
  }
  else if (options.strict) {
    return null;
  }

  if (!namespace) {
    // If no namespace is explicitly set..
    if (options.strict) {
      // and strict mode is specified, abort parse.
      return null;
    }
    else {
      // and strict mode is not specific, then default to "og"
      namespace = 'og';
    }
  }
  var meta = {}, metaTags = $('meta');

  metaTags.each(function () {
    var element = $(this);
    var propertyAttr = element.attr('property');

    // If meta element isn't an "og:" property, skip it
    if (!propertyAttr || propertyAttr.substring(0, namespace.length) !== namespace) {
      return;
    }

    var property = propertyAttr.substring(namespace.length + 1),
      content = element.attr('content');

    // If property is a shorthand for a longer property,
    // Use the full property
    property = shorthandProperties[property] || property;

    var key, tmp,
      ptr = meta,
      keys = property.split(':');

    // we want to leave one key to assign to so we always use references
    // as long as there's one key left, we're dealing with a sub-node and not a value

    while (keys.length > 1) {
      key = keys.shift();

      if (Array.isArray(ptr[key])) {
        // the last index of ptr[key] should become
        // the object we are examining.
        tmp = ptr[key].length - 1;
        ptr = ptr[key];
        key = tmp;
      }

      if (typeof ptr[key] === 'string') {
        // if it's a string, convert it
        ptr[key] = {'': ptr[key]};
      } else if (ptr[key] === undefined) {
        // create a new key
        ptr[key] = {};
      }

      // move our pointer to the next subnode
      ptr = ptr[key];
    }

    // deal with the last key
    key = keys.shift();

    if (ptr[key] === undefined) {
      ptr[key] = content;
    } else if (Array.isArray(ptr[key])) {
      ptr[key].push(content);
    } else {
      ptr[key] = [ptr[key], content];
    }
  });

  return meta;
}

exports['shares.formatLink'] = function (app, msg, next) {
  app.models.shares.findById(msg.body._id, function (err, share) {
    if (err) { return next(err); }
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    var match = share.text.match(urlRegex);
    if (!match || match.length !== 1) { return next(); }
    var options = {
      url: match[0],
      headers: {
        'User-Agent': 'Googlebot/2.1 (+http://www.googlebot.com/bot.html)'
      }
    };
    request(options, function (err, response, body) {
      if (err) { return next(err); }
      if (response.statusCode > 400) { return next(new app.errors.OperationError(response.statusCode)); }
      var meta = parse(body);
      share.url = match[0];
      share.meta.ogType = meta.type;
      share.meta.ogTitle = meta.title.trim();
      share.meta.ogDescription = meta.description.trim();
      if (meta.image && meta.image.url) {
        if (_.isString(meta.image)) {
          share.meta.ogImage = meta.image;
        } else if (_.isString(meta.image.url)) {
          share.meta.ogImage = meta.image.url;
        } else if (_.isArray(meta.image.url) && meta.image.url.length > 0) {
          share.meta.ogImage = meta.image.url[0];
        }
      }
      share.meta.ogSiteName = meta.site_name;
      if (meta.url) {
        share.meta.ogUrl = meta.url;
      } else {
        share.meta.ogUrl = share.url;
      }
      share.save(function (err, obj) {
        if (err) { return next(err); }
        app.models.feeds.update({resourceId: obj._id, collectionName: 'shares'}, {
          $set: {
            'resourceInfo.share': share.toObject()
          }
        }, {multi: true}, function (err) {
          if (err) {return next(err); }
          app.services.socket.sendToAccount(obj.account._id, 'shares.format', obj.toObject());
          next();
        });
      });
    });
  });
};
