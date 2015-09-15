'use strict';

var pwd = require('pwd'),
  async = require('async'),
  NotFoundError = require('../../../errors/NotFoundError.js');

exports['accounts.pwd'] = function (req, data, cb) {
  req.log.info({
    refs: [
      {resourceId: data._id, collectionName: 'accounts'}
    ]
  }, 'Generating new password and salt for account');
  pwd.hash(data.pwd, function (err, salt, hash) {
    if (err) { return cb(err); }
    data.pwd = hash;
    data.salt = salt;
    cb();
  });
};

exports['put.accounts.profile.primaryLanguage._id'] = function (req, data, next) {
  var langId = data['profile.primaryLanguage._id'];
  delete data['profile.primaryLanguage._id'];
  if (langId) {
    req.app.models.languages.findById(langId, function (err, language) {
      if (err) { return next(err); }
      if (!language) { return next(new NotFoundError('Language with _id "' + langId + '" not found')); }
      data['profile.primaryLanguage'] = language.toObject();
      next();
    });
  } else {
    data['profile.primaryLanguage'] = null;
    next();
  }
};

exports['put.accounts.profile.secondaryLanguage._id'] = function (req, data, next) {
  var langId = data['profile.secondaryLanguage._id'];
  delete data['profile.secondaryLanguage._id'];
  if (langId) {
    req.app.models.languages.findById(langId, function (err, language) {
      if (err) { return next(err); }
      if (!language) { return next(new NotFoundError('Language with _id "' + langId + '" not found')); }
      data['profile.secondaryLanguage'] = language.toObject();
      next();
    });
  } else {
    data['profile.secondaryLanguage'] = null;
    next();
  }
};

exports['accounts.profile.gender._id'] = function (req, data, next) {
  var genderId = data['profile.gender._id'];
  delete data['profile.gender._id'];
  delete data['profile.gender.title'];
  if (genderId) {
    req.app.models.genders.findById(genderId, function (err, gender) {
      if (err) { return next(err); }
      if (!gender) { return next(new NotFoundError('Gender with _id "' + genderId + '" not found')); }
      data['profile.gender'] = gender.toObject();
      next();
    });
  } else {
    data['profile.gender'] = null;
    next();
  }
};

exports['put.accounts'] = function (req, data, next) {
  async.auto({
    'account': function(next) {
      req.app.models.accounts.findById(data._id, 'username email', next);
    },
    'checkUsername': ['account', function(next, res) {
      if (!res.username && !data.username) {
        data.username = data.email || res.email;
      }
      console.info(data);
      next();
    }]
  }, next);
};
