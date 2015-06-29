/**
 * Mail sending service
 * @module services/mail
 * @copyright 2014 Cannasos.com. All rights reserved.
 */

'use strict';

var nodemailer = require('nodemailer'),
  path = require('path'),
  fs = require('fs'),
  async = require('async'),
  minify = require('html-minifier').minify,
  cssmin = require('cssmin'),
  juice = require('juice'),
  handlebars = require('handlebars'),
  _ = require('lodash');

var transporter;
var app;

var htmlMinOpts = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  conservativeCollapse: true,
  removeAttributeQuotes: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true
};

var juiceOpts = {};
var controllers = {};

function registerControllers(app, next) {
  var controllersPath = path.join(__dirname, 'controllers');
  fs.readdir(controllersPath, function (err, files) {
    if (err) { return next(err); }
    async.each(files, function (fileName, next) {
      if (path.extname(fileName) !== '.js') { return next(); }
      var name = path.basename(fileName, '.js');
      app.log.info('[MailSvc] loading controller "' + name + '"...');
      var controller = require(path.join(controllersPath, fileName));
      if (!controller) { return next(); }
      controllers[path.basename(fileName, '.js')] = controller;
      app.log.info('[MailSvc] controller "' + name + '" loaded.');
      if (controller.init && typeof controller.init === 'function') {
        controller.init(app, next);
      }
      else {
        next();
      }
    }, next);
  });
}

function registerPartials(next) {
  var partialPath = path.join(__dirname, 'partials');
  fs.readdir(partialPath, function (err, files) {
    if (err) { return next(err); }
    async.each(files, function (fileName, next) {
      app.log.info('[MailSvc] loading partial "' + fileName + '"...');
      fs.readFile(path.join(partialPath, fileName), {encoding: 'utf8'}, function (err, data) {
        if (err) { return next(err); }
        if (path.extname(fileName) === '.css') {
          data = cssmin(data);
        }
        handlebars.registerPartial(fileName, data);
        app.log.info('[MailSvc] partial "' + fileName + '" loaded.');
        next();
      });
    }, next);
  });
}

function getTemplate(templateName, format, next) {
  var templatePath = path.join(__dirname, 'templates', templateName + '.' + format);
  fs.exists(templatePath, function (exists) {
    if (!exists) { return next(); }
    fs.readFile(templatePath, {encoding: 'utf8'}, function (err, data) {
      if (err) { return next(err); }
      next(null, handlebars.compile(data));
    });
  });
}

exports.init = function (_app, next) {
  app = _app;
  transporter = nodemailer.createTransport(app.config.get('mail.transport'));
  app.log.info('Mail service initialized "%s"', app.config.get('mail.transport.service'));
  async.parallel([registerPartials, _.partial(registerControllers, app)], next);
};

exports.sendTemplate = function (name, email, options, cb) {
  async.auto({
    htmlTemplate: _.partial(getTemplate, name, 'html'),
    txtTemplate: _.partial(getTemplate, name, 'txt'),
    sendOptions: function (next) {
      next(null, {
        from: app.config.get('mail').noReply,
        to: email,
        subject: 'Notification',
        xMailer: 'Mailer'
      });
    },
    model: ['sendOptions', function (next, data) {
      var model = _.clone(options);
      model.email = email;
      model.config = {
        url: app.config.get('url'),
        urls: app.config.get('urls'),
        images: app.config.get('mail.imagesPath')
      };
      var controller = controllers[name];
      if (!controller || typeof controller.controller !== 'function') { return next(null, model); }
      controller.controller(app, data.sendOptions, model, next);
    }],
    send: ['htmlTemplate', 'txtTemplate', 'sendOptions', 'model', function (next, data) {
      var send = function (next) {
        transporter.sendMail(data.sendOptions, function (err, info) {
          if (err) { return next(err); }
          app.log.debug('Message ' + name + ' sent to ' + email + ': ' + info.response);
          next();
        });
      };

      if (!data.txtTemplate && !data.htmlTemplate) {
        return next(new app.errors.OperationError('[MailSvc] Template "' + name + '" not found.'));
      }

      if (data.txtTemplate) {
        data.sendOptions.text = data.txtTemplate(data.model);
      }

      if (data.htmlTemplate) {
        var mailHtml = data.htmlTemplate(data.model);
        juice.juiceResources(mailHtml, _.extend({url: app.config.get('url')}, juiceOpts), function (err, html) {
          if (err) { return next(err); }
          mailHtml = minify(html, htmlMinOpts);
          data.sendOptions.html = mailHtml;
          send(next);
        });
      } else {
        send(next);
      }
    }]
  }, function (err) {
    if (err) {
      if (typeof cb !== 'function') {
        return app.log.error(err);
      } else {
        return cb(err);
      }
    }
    if (typeof cb === 'function') {
      return cb();
    }
  });
};
