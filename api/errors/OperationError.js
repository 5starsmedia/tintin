'use strict';

function OperationError(message) {
  this.stack = (new Error()).stack;
  this.message = message;
  this.name = 'OperationError';
}

OperationError.prototype = Error.prototype;

module.exports = OperationError;
