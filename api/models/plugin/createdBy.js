var mongoose = require("mongoose"),
  _ = require('lodash'),
  contextService = require('request-context');

module.exports = function createdByPlugin(schema, options) {

  if (options == null) {
    options = {};
  }
  _.defaults(options, {
    UserSchema: {
      _id: { type: mongoose.Schema.Types.ObjectId, required: options.isRequired || false },
      title: { type: String, required: options.isRequired || false },
      imageUrl: { type: String },
      coverFile: { _id: mongoose.Schema.Types.ObjectId }
    }
  });

  schema.add({
    createdBy: options.UserSchema
  });

  schema.pre('save', function (next) {
    var account = contextService.get('request:account'),
      keys =  _.keys(options.UserSchema);

    if (!this.createdBy || !this.createdBy._id && account) {
      this.createdBy = _.pick(account, keys);
    }
    next();
  })
};