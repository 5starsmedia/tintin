'use strict';

function NotFoundError(message) {
  this.message = message;
  this.stack = (new Error()).stack;
  this.name = 'NotFoundError';
}

NotFoundError.prototype = Error.prototype;

module.exports = NotFoundError;
