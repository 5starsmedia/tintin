/**
 * @copyright 2014 Cannasos.com
 */

'use strict';

var OAuth = require('oauth').OAuth;

exports.getOAuth = function (app) {
  return new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    app.config.get('twitter.consumerKey'),
    app.config.get('twitter.consumerSecret'),
    '1.0a',
    app.config.get('url') + '/api/auth/twitter/callback',
    'HMAC-SHA1'
  );
};

exports.updateProfile = function (app, accountId, cb) {
  /*jshint -W106 */
  var oa = exports.getOAuth(app);
  app.models.accounts.findOne({_id: accountId}, function (err, account) {
    if (err) { return cb(err); }
    oa.get('https://api.twitter.com/1.1/users/show.json?user_id=' + account.extUser, account.extToken,
      account.extTokenSecret, function (err, data) {
        if (err) { return cb(err); }
        var jsonData = JSON.parse(data);
        account.title = jsonData.name;
        account.imageUrl = jsonData.profile_image_url_https;
        account.save(cb);
      });
  });
  /*jshint +W106 */
};
