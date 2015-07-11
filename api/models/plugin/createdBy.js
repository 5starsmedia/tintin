var mongoose = require("mongoose"),
  _ = require('lodash'),
  contextService = require('request-context');

module.exports = function createdByPlugin(schema, options) {

  if (options == null) {
    options = {};
  }
  _.defaults(options, {
    isRequired: false,
    UserSchema: {
      _id: { type: mongoose.Schema.Types.ObjectId, required: true },
      title: { type: String, required: true },
      imageUrl: { type: String },
      coverFile: { _id: mongoose.Schema.Types.ObjectId }
    }
  });

  if (!options.defaultUser) {
    options.defaultUser = null;
  }

  schema.add({
    createdBy: {
      type: options.UserSchema,
      "default": options.defaultUser,
      required: options.isRequired
    }
  });

  schema.pre('save', function (next) {
    var account = contextService.get('request:account'),
      keys =  _.keys(options.UserSchema);

    if (!this.createdBy && account) {
      this.createdBy = _.pick(account, keys);
    }
    next();
  })
};