'use strict';

var fs = require('fs');

module.exports = function (app, name, cb) {
  fs.readFile(name, function (err, content) {
    if (err) { return cb(err); }
    var obj;
    try {
      obj = JSON.parse(content);
    } catch (e) {
      return cb(e);
    }
    app.log.debug('Json resource ' + name + ' loaded successfully');
    cb(null, function (f) {return f(null, obj);});
  });
};
