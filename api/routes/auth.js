/**
 * Copyright 2014 Cannasos.com
 * GET /api/auth
 */
'use strict';

var express = require('express'),
  mongoose = require('mongoose'),
  buffer = require('buffer'),
  pwd = require('pwd'),
  _ = require('lodash'),
  jwt = require('jsonwebtoken'),
  crypto = require('crypto'),
  request = require('request'),
  querystring = require('querystring'),
  async = require('async'),
  S = require('string'),
  config = require('../config.js');

var router = express.Router();

function generateTokenValue(id, cb) {
  var tokenSecret = config.get('auth.tokenSecret');
  var token = jwt.sign({_id: id}, tokenSecret, {expiresInMinutes: config.get('auth.persistTokenDuration')});

  cb(null, token);
}

function assignToken(req, account, cb) {
  generateTokenValue(account._id, function (err, tokenValue) {
    if (err) {
      return cb(err);
    }
    var expireAt, persist;
    if (req.body.persist) {
      persist = true;
      expireAt = Date.now() + config.get('auth.persistTokenDuration');
    } else {
      persist = false;
      expireAt = Date.now() + config.get('auth.tokenDuration');
    }
    account.tokens.push({value: tokenValue, persist: persist, expireAt: expireAt});
    account.usernameDate = Date.now();
    account.save(function (err) {
      if (err) {
        return cb(err);
      }
      cb(null, tokenValue);
    });
  });
}

function auth(req, res, account, next) {
  pwd.hash(req.body.password, account.salt, function (err, hash) {
    if (account.pwd === hash) {
      assignToken(req, account, function (err, token) {
        if (err) {
          return next(err);
        }
        req.account = account;
        req.log = req.log.child({account: _.pick(account, ['_id', 'username'])});
        req.log.info('Token generated');

        req.logRecord('login', 'Successfully login by username and password', req.app.log_level.info, account, function (err) {
          if (err) {
            return next(err);
          }
          loginResponse(req, res, token, account, next);
        });
      });
    } else {

      req.logRecord('login', 'Incorrect email or password', req.app.log_level.error, account, function (err) {
        if (err) {
          return next(err);
        }
        res.status(422).json({
          hasErrors: true, summaryErrors: [
            {msg: 'Incorrect email or password.'}
          ]
        });
      });

    }
  });
}

function loginResponse(req, res, token, account, next) {
  req.app.models.accounts.findOne({_id: account._id}, function (err, account) {
    if (err) {
      return next(err);
    }
    res.status(200).json({
      token: token,
      account: {
        _id: account._id,
        title: account.title,
        username: account.username,
        coverFile: account.coverFile,
        imageUrl: account.imageUrl,
        roles: account.roles
      }
    });
    next();
  });
}

var ver = {};

router.get('/twitter/callback', function (req, res, next) {
  /*jshint -W106 */
  var oa = req.app.services.social.twitter.getOAuth(req.app);
  var token = req.query.oauth_token;
  var tokenSecret = ver[token];
  var verifier = req.query.oauth_verifier;
  if (tokenSecret && verifier) {
    async.auto({
      accessToken: function (next) {
        oa.getOAuthAccessToken(token, tokenSecret, verifier, function (err, accessToken, accessTokenSecret, results) {
          if (err) {
            return next(err);
          }
          next(null, {
            accessToken: accessToken,
            accessTokenSecret: accessTokenSecret,
            userId: results.user_id.toString(),
            title: results.screen_name
          });
        });
      },
      account: ['accessToken', function (next, data) {
        req.app.models.accounts.findOne({accountType: 'twitter', extUser: data.accessToken.userId},
          function (err, account) {
            if (err) {
              return next(err);
            }
            if (account) {
              account.activated = true;
              account.activationDate = Date.now();
              account.extToken = data.accessToken.accessToken;
              account.extTokenSecret = data.accessToken.accessTokenSecret;
              account.save(function (err) {
                if (err) {
                  return next(err);
                }

                req.logRecord('login', 'Successfully login by twitter', req.app.log_level.info, account, function (err) {
                  if (err) {
                    return next(err);
                  }
                  req.log.info('Twitter account "' + data.accessToken.userId + '" username successfully');
                  next(null, account);
                });
              });
            } else {
              account = new req.app.models.accounts();
              account.accountType = 'twitter';
              account.username = 'twitter-' + data.accessToken.userId;
              account.extUser = data.accessToken.userId;
              account.title = data.accessToken.title;
              account.activated = true;
              account.activationDate = Date.now();
              account.extToken = data.accessToken.accessToken;
              account.extTokenSecret = data.accessToken.accessTokenSecret;
              account.roles = [
                {
                  'name': 'user',
                  'title': 'User'
                }
              ];
              account.save(function (err) {
                if (err) {
                  return next(err);
                }

                req.logRecord('registration', 'Registered by twitter', req.app.log_level.info, account, function (err) {
                  if (err) {
                    return next(err);
                  }
                  req.log.info('Twitter account "' + data.accessToken.userId + '" registered successfully');
                  next(null, account);
                });
              });
            }
          });
      }],
      profile: ['account', 'accessToken', function (next, data) {
        req.app.services.social.twitter.updateProfile(req.app, data.account._id, next);
      }],
      token: ['account', function (next, data) {
        assignToken(req, data.account, next);
      }]
    }, function (err, data) {
      if (err) {
        return next(err);
      }
      loginResponse(req, res, data.token, data.account, next);
      //res.redirect('/authByToken?token=' + data.token + '&account._id=' + data.account._id);
    });
  } else {
    next(new Error('you are not supposed to be here.'));
  }
  /*jshint +W106 */
});

router.get('/twitter', function (req, res, next) {
  var oa = req.app.services.social.twitter.getOAuth(req.app);
  oa.getOAuthRequestToken(function (err, token, tokenSecret) {
    if (err) {
      return next(err);
    }
    ver[token] = tokenSecret;
    res.redirect('https://twitter.com/oauth/authenticate?oauth_token=' + token);
  });
});

router.post('/facebook/callback', function (req, res, next) {
  /*jshint -W106 */
  var code = req.body.code;
  request('https://graph.facebook.com/oauth/access_token?client_id=' + req.body.clientId + '&redirect_uri=' + req.body.redirectUri + '&client_secret=' + req.app.config.get('facebook').clientSecret + '&code=' + code,
    function (err, data, body) {
      if (err) {
        return next(err);
      }
      var ff = querystring.parse(body);
      request('https://graph.facebook.com/me?access_token=' + ff.access_token, function (err, data, b) {
        if (err) {
          return next(err);
        }
        var profile = JSON.parse(b);
        req.app.models.accounts.findOne({accountType: 'facebook', extUser: profile.id},
          function (err, account) {
            if (err) {
              return next(err);
            }
            if (account) {
              account.activated = true;
              account.activationDate = Date.now();
              account.extToken = ff.access_token;
              account.save(function (err) {
                if (err) {
                  return next(err);
                }

                req.logRecord('registration', 'Successfully login by facebook', req.app.log_level.info, account, function (err) {
                  if (err) {
                    return next(err);
                  }
                  req.log.info('Facebook account "' + profile.id + '" username successfully');
                  req.app.services.social.facebook.updateProfile(req.app, account._id, function (err) {
                    if (err) {
                      return next(err);
                    }
                    assignToken(req, account, function (err, token) {
                      if (err) {
                        return next(err);
                      }

                      loginResponse(req, res, token, account, next);
                      //res.redirect('/authByToken?token=' + token + '&account._id=' + account._id);
                    });
                  });
                });
              });
            } else {
              account = new req.app.models.accounts();
              account.accountType = 'facebook';
              account.username = 'facebook-' + profile.id;
              account.extUser = profile.id;
              account.title = profile.name;
              account.activated = true;
              account.activationDate = Date.now();
              account.extToken = ff.access_token;
              account.roles = [
                {
                  'name': 'user',
                  'title': 'User'
                }
              ];
              account.save(function (err) {
                if (err) {
                  return next(err);
                }

                req.logRecord('registration', 'Registered by facebook', req.app.log_level.info, account, function (err) {
                  if (err) {
                    return next(err);
                  }
                  req.log.info('Facebook account "' + profile.id + '" registered successfully');
                  req.app.services.social.facebook.updateProfile(req.app, account._id, function (err) {
                    if (err) {
                      return next(err);
                    }
                    assignToken(req, account, function (err, token) {
                      if (err) {
                        return next(err);
                      }

                      loginResponse(req, res, token, account, next);
                      //res.redirect('/authByToken?token=' + token + '&account._id=' + account._id);
                    });
                  });
                });
              });
            }
          });
      });
    });
  /*jshint +W106 */
});

router.get('/facebook', function (req, res) {
  var redirectUrl = encodeURIComponent(req.app.config.get('url') + '/api/auth/facebook/callback');
  res.redirect('https://www.facebook.com/dialog/oauth?scope=user_about_me,user_birthday,email&client_id=' + req.app.config.get('facebook').clientId + '&redirect_uri=' + redirectUrl);
});

router.post('/login', function (req, res, next) {
  req.body.username = req.body.username || req.body.email;
  if (!req.body.username) {
    res.status(422).json({
      hasErrors: true, fieldErrors: [
        {field: 'username', msg: 'email is required'}
      ]
    });
  }
  else if (!req.body.password) {
    res.status(422).json({
      hasErrors: true, fieldErrors: [
        {field: 'password', msg: 'password is required'}
      ]
    });
  } else {
    req.app.models.accounts.findOne({username: req.body.username}, function (err, account) {
      if (err) {
        return next(err);
      }
      if (!account) {
        return res.status(422).json({
          hasErrors: true, summaryErrors: [
            {msg: 'Incorrect email or password.'}
          ]
        });
      }
      if (!account.activated) {
        return res.status(422).json({
          hasErrors: true, summaryErrors: [
            {msg: 'Account is not activated, check your email'}
          ]
        });
      }
      auth(req, res, account, next);
    });
  }
});

router.get('/activate/:activationToken', function (req, res, next) {
  req.app.models.accounts.findOne({activationToken: req.params.activationToken}, function (err, account) {
    if (err) {
      return next(err);
    }
    if (!account.activated) {
      account.activated = true;
      account.activationDate = Date.now();
      account.save(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect('/login');
        req.log.info('Account ' + account.username + ' successfully activated');
        req.app.services.mail.sendTemplate('activated', account.email,
          {userName: account.title});
      });
    } else {
      res.redirect('/login');
    }
  });
});

router.post('/activation-resend', require('../middleware/auth.js')(), function (req, res, next) {
  if (req.auth.isGuest) {
    res.status(401).end();
  } else {
    if (req.auth.account.activated) {
      res.json({msg: 'Your account is activated already.'});
    }
    else {
      req.app.services.mail.sendTemplate('registerConfirmation', req.auth.account.email, {
        userName: req.auth.account.title,
        activationToken: req.auth.account.activationToken
      }, function (err) {
        if (err) {
          return next(err);
        }
        res.json({msg: 'Confirmation message was sent to ' + req.auth.account.email + '.'});
      });
    }
  }
});

var isEmailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

router.post('/reset-confirm', function (req, res, next) {
  async.auto({
    validate: function (next) {
      if (!req.body.password) {
        res.status(422).json({
          hasErrors: true,
          fieldErrors: [{field: 'password', msg: 'Password is required'}]
        });
      } else if (req.body.password.length < 6) {
        res.status(422).json({
          hasErrors: true,
          fieldErrors: [{field: 'password', msg: 'Password must be at least 6 characters length'}]
        });
      } else if (req.body.password.length > 50) {
        res.status(422).json({
          hasErrors: true,
          fieldErrors: [{field: 'password', msg: 'Maximum length is 50 characters'}]
        });
      } else {
        next();
      }
    },
    account: ['validate', function (next) {
      req.app.models.accounts.findOne({passwordResetToken: req.body.token}, function (err, account) {
        if (err) {
          return next(err);
        }
        if (!account) {
          res.status(422).json({
            hasErrors: true, summaryErrors: [{msg: 'Password reset token is invalid'}]
          });
        } else if (new Date(account.passwordResetDate.getTime() + 3 * 60 * 60000) < new Date()) {
          res.status(422).json({
            hasErrors: true, summaryErrors: [{msg: 'Password reset token is expired'}]
          });
        } else {
          next(null, account);
        }
      });
    }],
    saltAndHash: ['account', function (next) {
      pwd.hash(req.body.password, function (err, salt, hash) {
        if (err) {
          return next(err);
        }
        next(null, {salt: salt, hash: hash});
      });
    }],
    resetPassword: ['saltAndHash', function (next, res) {
      req.app.models.accounts.update({_id: res.account._id}, {
        $set: {
          tokens: [],
          pwd: res.saltAndHash.hash,
          salt: res.saltAndHash.salt,
          passwordResetToken: null,
          passwordResetDate: null
        }
      }, next);
    }]
  }, function (err, data) {
    if (err) {
      return next(err);
    }
    assignToken(req, data.account, function (err, token) {
      if (err) {
        return next(err);
      }
      req.account = data.account;
      req.log = req.log.child({account: _.pick(data.account, ['_id', 'username'])});
      req.log.info('Token generated');
      loginResponse(req, res, token, data.account, next);
    });
    //res.status(204).end();
  });
});

router.post('/reset', function (req, res, next) {
  async.auto({
    validateData: function (next) {
      var errors = [];
      if (!req.body.username) {
        errors.push({field: 'username', msg: 'Email is required'});
      } else if (!isEmailRegex.test(req.body.username)) {
        errors.push({field: 'username', msg: 'Must be a valid email'});
      } else if (req.body.username.length > 50) {
        errors.push({field: 'username', msg: 'Maximum length is 50 characters'});
      }

      if (errors.length > 0) {
        res.status(422).json({
          hasErrors: true, fieldErrors: errors
        });
      } else {
        next();
      }
    },
    account: ['validateData', function (next) {
      req.app.models.accounts.findOne({username: req.body.username}, function (err, account) {
        if (err) {
          return next(err);
        }
        if (!account) {
          res.status(422).json({
            hasErrors: true, fieldErrors: [
              {field: 'username', msg: 'email not found'}
            ]
          });
        } else {
          next(null, account);
        }
      });
    }],
    reset: ['account', function (next, data) {
      generateTokenValue(data.account._id, function (err, token) {
        if (err) {
          return next(err);
        }
        req.app.models.accounts.update({_id: data.account._id}, {
          $set: {
            passwordResetToken: token,
            passwordResetDate: new Date()
          }
        }, function (err) {
          if (err) {
            return next(err);
          }
          req.app.services.mail.sendTemplate('passwordReset', data.account.email, {
            userName: data.account.title,
            token: token
          }, next);
        });
      });
    }]
  }, function (err) {
    if (err) {
      return next(err);
    }
    res.status(204).end();
  });
});

router.post('/register', function (req, res, next) {
  async.auto({
    deniedEmailDomains: function (next) {
      req.app.services.data.getResource('deniedEmailDomains', next);
    },
    validateData: ['deniedEmailDomains', function (next, data) {
      var errors = [];
      if (!req.body.username) {
        errors.push({field: 'username', msg: 'Email is required'});
      } else if (!isEmailRegex.test(req.body.username)) {
        errors.push({field: 'username', msg: 'Must be a valid email'});
      } else if (req.body.username.length > 50) {
        errors.push({field: 'username', msg: 'Maximum length is 50 characters'});
      } else {
        var atIndex = req.body.username.indexOf('@');
        if (atIndex !== -1 && data.deniedEmailDomains.indexOf(req.body.username.substr(atIndex + 1)) !== -1) {
          errors.push({field: 'username', msg: 'Domain name is restricted'});
        }
      }

      if (!req.body.password) {
        errors.push({field: 'password', msg: 'Password is required'});
      } else if (req.body.password.length < 6) {
        errors.push({field: 'password', msg: 'Password must be at least 6 characters length'});
      } else if (req.body.password.length > 50) {
        errors.push({field: 'password', msg: 'Maximum length is 50 characters'});
      }

      if (errors.length > 0) {
        res.status(422).json({
          hasErrors: true, fieldErrors: errors
        });
      } else {
        //req.body.dateOfBirth = new Date(req.body.birthYear, req.body.birthMonth, req.body.birthDay, 12);
        next();
      }
    }],
    validateEmailExists: ['validateData', function (next) {
      req.app.models.accounts.findOne({username: req.body.username}, function (err, account) {
        if (err) {
          return next(err);
        }
        if (account) {
          auth(req, res, account, next);
          /*res.status(422).json({
           hasErrors: true, fieldErrors: [
           {field: 'email', msg: 'email already registered'}
           ]
           });*/
        } else {
          next();
        }
      });
    }],
    action: ['validateEmailExists', function (next) {
      pwd.hash(req.body.password, function (err, salt, hash) {
        if (err) {
          return next(err);
        }
        generateTokenValue('', function (err, token) {
          if (err) {
            return next(err);
          }
          var account = new req.app.models.accounts();
          account.activated = false;
          account.activationToken = token;
          account.email = req.body.username;
          account.username = req.body.username;
          account.title = req.body.username.substr(0, req.body.username.indexOf('@'));
          account.pwd = hash;
          account.salt = salt;
          account.receiveNews = true;
          account.roles = [
            {
              'name': 'admin',
              'title': 'Administrator'
            },
            {
              'name': 'user',
              'title': 'User'
            }
          ];

          account.save(function (err, acc) {
            if (err) {
              return next(err);
            }
            req.app.services.mq.push(req.app, 'events', {name: 'db.accounts.insert', _id: acc._id});
            req.app.services.mail.sendTemplate('registerConfirmation', account.email, {
              userName: account.title,
              activationToken: token
            });
            assignToken(req, account, function (err, token) {
              if (err) {
                return next(err);
              }
              req.log.info('Token generated');
              loginResponse(req, res, token, account, next);
            });
          });
        });
      });
    }]
  }, next);

});

module.exports = router;
