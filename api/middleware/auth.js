'use strict';
var config = require('../config.js'),
  moment = require('moment'),
  jwt = require('jsonwebtoken'),
  _ = require('lodash');

var inheritCache = {};

function inheritRoles(req, roles, next) {
  var strName = roles.join();
  var resRoles = inheritCache[strName];
  if (resRoles) {
    return next(null, resRoles);
  }
  resRoles = [];
  req.app.services.data.getResource('roles', function (err, rolesRes) {
    if (err) {
      return next(err);
    }
    for (var i = 0; i <= roles.length; i += 1) {
      var roleName = roles[i];
      for (var j = 0; j < rolesRes.length; j += 1) {
        var roleRes = rolesRes[j];
        if (roleRes.name === roleName && roleRes.inherits) {
          for (var k = 0; k < roleRes.inherits.length; k += 1) {
            var roleToInherit = roleRes.inherits[k];
            if (resRoles.indexOf(roleToInherit) === -1 && roles.indexOf(roleToInherit) === -1) {
              resRoles.push(roleToInherit);
            }
          }
        }
      }
    }
    inheritCache[strName] = resRoles;
    next(null, resRoles);
  });
}

function authAsAccount(account, role, req, res, next) {
  req.auth.account = account;
  req.auth.role = role;
  req.auth.permissions = _.pluck(role.permissions, 'name');
  /*var roles = _.pluck(req.auth.account.roles, 'name');
  inheritRoles(req, roles, function (err, inheritedRoles) {
    if (err) {
      return next(err);
    }
    req.auth.roles = roles.concat(inheritedRoles);
    req.log = req.log.child({account: {_id: account._id, login: account.login}});

    next();
  });*/
  next();
}

function authAsGuest(req, res, next) {
  req.auth.isGuest = true;
  req.auth.roles = [config.get('auth.guestRoleName')];
  next();
}

module.exports = function () {
  return function (req, res, next) {
    req.auth = req.auth || {};

    if (!req.headers.authorization || req.headers.authorization.length == 0) {
      authAsGuest(req, res, next);
      return;
    }

    var token = req.headers.authorization.split(' ')[1];
    if (token && token.length > 0) {
      var payload = jwt.decode(token, config.get('auth.tokenSecret'));
      if (!payload || payload.exp <= moment().unix()) {
        authAsGuest(req, res, next);
        return;
      }
      req.app.models.accounts.findOne({ '_id': payload._id, removed: { $exists: false } }, function (err, account) {
        if (err) { return next(err); }

        req.app.models.roles.findOne({ '_id': payload.role_id, removed: { $exists: false } }, function (err, role) {
          if (err) { return next(err); }

          if (account && role) {
            authAsAccount(account.toObject(), role, req, res, next);
            if (!account.activityDate || Date.now() - account.activityDate.getTime() > 30000) {
              req.log.debug('Updating activity date ', account.username);
              account.activityDate = Date.now();
              account.save(function (err) {
                if (err) {
                  req.log.error(err);
                }
              });
            }
            return;
          }
          authAsGuest(req, res, next);
        });
      });
    } else {
      authAsGuest(req, res, next);
    }
  };
};
