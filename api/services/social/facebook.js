/**
 * @copyright 2014 Cannasos.com
 */

'use strict';

var OAuth2 = require('oauth').OAuth2,
    moment = require('moment'),
    async = require('async'),
    request = require('request');

exports.getOAuth = function (app) {
    return new OAuth2('752709758098603',
        '8bf304984a0836194d188f6103ae011f',
        'https://api.facebook.com/',
        null,
        'oauth2/token',
        null);
};

exports.updateProfile = function (app, accountId, cb) {
    /*jshint -W106 */
    app.models.accounts.findOne({_id: accountId}, function (err, account) {
        if (err) {
            return cb(err);
        }
        async.auto({
            profile: function (next) {
                request('https://graph.facebook.com/' + account.extUser + '?access_token=' + account.extToken,
                    function (err, data, b) {
                        if (err) {
                            return next(err);
                        }
                        next(null, JSON.parse(b));
                    });
            },
            photo: function (next) {
                request('https://graph.facebook.com/' + account.extUser + '/picture?access_token=' + account.extToken + '&redirect=false&width=200&height=200',
                    function (err, data, b) {
                        if (err) {
                            return next(err);
                        }
                        next(null, JSON.parse(b));
                    });
            },
            updateGender: ['profile', function (next, data) {
                if (data.profile.gender) {
                    app.models.genders.findOne({title: new RegExp('^' + data.profile.gender + '$', 'i')}, function (err, gender) {
                        if (err) {
                            return next(err);
                        }
                        account.profile.gender = gender.toObject();
                        next();
                    });
                } else {
                    next();
                }
            }],
            updateProfile: ['profile', 'photo', function (next, data) {
                account.title = data.profile.name;
                account.profile.facebookUrl = data.profile.link;
                account.profile.firstName = data.profile.first_name;
                account.email = data.profile.email;
                account.profile.lastName = data.profile.last_name;
                if (data.profile.birthday) {
                    account.profile.dateOfBirth = moment.utc(data.profile.birthday, 'MM/DD/YYYY');
                }
                if (data.photo && data.photo.data && data.photo.data.url) {
                    account.imageUrl = data.photo.data.url;
                }
                next();
            }]
        }, function (err) {
            if (err) {
                return cb(err);
            }
            account.save(function (err) {
                if (err) {
                    return cb(err);
                }
                app.services.mq.push(app, 'events', {name: 'db.accounts.insert', _id: account._id});
                cb();
            });
        });
    });
    /*jshint +W106 */
};

