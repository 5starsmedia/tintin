var config = require('../config.js'),
  MongoClient = require('mongodb').MongoClient,
  format = require('util').format;

MongoClient.connect(config.get('mongodb'), function (err, db) {
  if (err) {
    return err;
  }

  exports.queryRecord = function (name, type, callback) {
    var collection = db
      .collection('dnsRecords')
      .find({
        'domain.name': name.toLowerCase(),
        type: type
      })
      .toArray(function (err, docs) {
        if (err) {
          return callback(err, null);
        }
        callback(null, docs);
      });
  };

  exports.queryGeo = function (name, type, dest, isp, sourceIP, callback) {
    if (dest === null) {
      return callback(null);
    }
    var collection = db
      .collection('dnsRecords')
      .find({
        'domain.name': name.toLowerCase(),
        type: type/*,
        geo: {
          $in: [
            dest.country_code,
            dest.country_code3,
            dest.country_name,
            dest.continent_code
          ]
        }*/
      })
      .toArray(function (err, docs) {
        if (err) {
          return callback(err, null);
        }
        callback(null, docs);
      });
  };

  exports.querySOA = function (name, callback) {
    exports.queryRecord(name, 'SOA', callback);
  };

  exports.queryNS = function (name, callback) {
    exports.queryRecord(name, 'NS', callback);
  };

  exports.queryA = function (name, callback) {
    exports.queryRecord(name, 'A', callback);
  };

  exports.queryAAAA = function (name, callback) {
    exports.queryRecord(name, 'AAAA', callback);
  };

  exports.queryCNAME = function (name, callback) {
    exports.queryRecord(name, 'CNAME', callback);
  };

  exports.queryMX = function (name, callback) {
    exports.queryRecord(name, 'MX', callback);
  };

  exports.querySRV = function (name, callback) {
    exports.queryRecord(name, 'SRV', callback);
  };

  exports.queryTXT = function (name, callback) {
    exports.queryRecord(name, 'TXT', callback);
  };
});

