'use strict';

function ValidationError(msg, field) {
  this.stack = (new Error()).stack;
  if (field) {
    this.field = field;
  }
  this.msg = msg;
  this.message = (field ? 'Field' : 'Summary') + ' error "' + field + '" - ' + msg;
  this.name = 'ValidationError';
}

ValidationError.prototype = Error.prototype;

module.exports = ValidationError;
