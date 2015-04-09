var mysql = require('mysql'),
  _ = require('lodash'),
  async = require('async');

var saveItem = function(item, next) {
  console.info(item)

  next();
};

async.auto({
  'connection': function (next) {
    var connection = mysql.createConnection({
      host: '46.4.48.144',
      port: 33163,
      user: 'root',
      password: 'gjhndtqy777',
      database: 'vvslob_android'
    });
    connection.connect();
    next(null, connection);
  },
  'getPosts': ['connection', function(next, data) {
    data.connection.query('SELECT * FROM ander_posts WHERE post_type = "post" LIMIT 1', function (err, rows, fields) {
      if (err) throw err;
      async.each(rows, saveItem, next);
    });
  }]
}, function (err, data) {


  data.connection.end();
});