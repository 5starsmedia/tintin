/**
 * Message queue service
 * @module services/mq
 * @copyright 2015 5starsmedia.com.ua. All rights reserved.
 */
'use strict';

/**
 * Push new message to message queue
 * @param {object} app Application instance
 * @param {string} queue Queue name
 * @param {object} body Message body
 * @param {function} next Callback
 */

exports.push = function (app, queue, body, next) {
  app.models.queueMessages.create({queue: queue, body: body});
  app.services.tasks.push(body, next);
};


/**
 * @callback mqPopCallback
 * @param {object} err Error object
 * @param {{body, createDate, queue}} msg Message
 * @param {function} done Mark message as processed (or remove it directly)
 */

/**
 * Pop message from message queue
 * @param {object} app Application instance
 * @param {string} queue Queue name
 * @param {mqPopCallback} cb Callback
 */
exports.pop = function (app, queue, cb) {
  app.models.queueMessages.findOneAndUpdate(
    {queue: queue, locked: false},
    {locked: true, lockDate: Date.now()},
    {sort: {_id: 1}},
    function (err, msg) {
      if (err) { return cb(err); }

      var done = function () {
        app.models.queueMessages.remove({_id: msg._id}, function (err) {
          if (err) { return app.log.error('Can not remove processed message from message Queue', msg); }
        });
      };
      cb(null, msg, done);
    });
};
