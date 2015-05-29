'use strict';

exports['mail.send'] = function (app, msg, cb) {
  app.services.mail.sendTemplate(msg.body.template, msg.body.email, msg.body.options, cb);
};
