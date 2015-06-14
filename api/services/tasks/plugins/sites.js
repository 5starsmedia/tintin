'use strict';

var async = require('async'),
     _ = require('lodash');

function createRecord(app, domain, type, host, priority, content, next) {
  var record = new app.models.dnsRecords({
    domain: {
      _id: domain._id,
      name: domain.name
    },
    type: type,
    content: content,
    priority: priority
  });
  record.save(next);
}

function createRecords(app, domain, next) {
  async.auto({
    'SOA': function(next) {
      createRecord(app, domain, 'SOA', '@', null, 'ns1.5stars.link admin.mistinfo.com. 2015052801 10800 7200 604800 86400', next);
    },
    'NS1': function(next) {
      createRecord(app, domain, 'NS', '@', null, 'ns1.5stars.link', next);
    },
    'NS2': function(next) {
      createRecord(app, domain, 'NS', '@', null, 'ns2.5stars.link', next);
    },
    'NS3': function(next) {
      createRecord(app, domain, 'NS', '@', null, 'ns3.5stars.link', next);
    },
    'A1': function(next) {
      createRecord(app, domain, 'A', '@', null, '46.4.48.144', next);
    },
    'A2': function(next) {
      createRecord(app, domain, 'A', 'www', null, '46.4.48.144', next);
    },
    'A3': function(next) {
      createRecord(app, domain, 'A', '*', null, '46.4.48.144', next);
    },
    'TXT': function(next) {
      createRecord(app, domain, 'TXT', '*', null, 'v=spf1 a -all', next);
    }
  }, next);
}
/*
 +------+---------+-------+------+------+-------------+-------------------+---------------------+------------+---------+-------+--------+---------+---------------------+---------------------+
 | id   | zone_id | ttl   | type | host | mx_priority | data              | resp_person         | serial     | refresh | retry | expire | minimum | created_at          | updated_at          |
 +------+---------+-------+------+------+-------------+-------------------+---------------------+------------+---------+-------+--------+---------+---------------------+---------------------+
 | 1203 |     153 | 86400 | SOA  | @    |        NULL | ns1.mistinfo.com. | admin.mistinfo.com. | 2015052801 |   10800 |  7200 | 604800 |   86400 | 2015-05-28 13:37:06 | 2015-05-28 13:37:06 |
 | 1204 |     153 | 86400 | NS   | @    |        NULL | ns1.mistinfo.com. | NULL                |       NULL |    NULL |  NULL |   NULL |    NULL | 2015-05-28 13:37:06 | 2015-05-28 13:37:06 |
 | 1205 |     153 | 86400 | NS   | @    |        NULL | ns2.mistinfo.com. | NULL                |       NULL |    NULL |  NULL |   NULL |    NULL | 2015-05-28 13:37:06 | 2015-05-28 13:37:06 |
 | 1206 |     153 | 86400 | NS   | @    |        NULL | ns3.mistinfo.com. | NULL                |       NULL |    NULL |  NULL |   NULL |    NULL | 2015-05-28 13:37:06 | 2015-05-28 13:37:06 |
 | 1207 |     153 | 86400 | A    | @    |        NULL | 46.4.48.144       | NULL                |       NULL |    NULL |  NULL |   NULL |    NULL | 2015-05-28 13:37:06 | 2015-05-28 16:37:47 |
 | 1208 |     153 | 86400 | A    | www  |        NULL | 46.4.48.144       | NULL                |       NULL |    NULL |  NULL |   NULL |    NULL | 2015-05-28 13:37:06 | 2015-05-28 16:37:44 |
 | 1209 |     153 | 86400 | A    | *    |        NULL | 46.4.48.144       | NULL                |       NULL |    NULL |  NULL |   NULL |    NULL | 2015-05-28 13:37:06 | 2015-05-28 16:37:44 |
 | 1210 |     153 | 86400 | TXT  | @    |        NULL | v=spf1 a -all     | NULL                |       NULL |    NULL |  NULL |   NULL |    NULL | 2015-05-28 13:37:06 | 2015-05-28 13:37:06 |
 +------+---------+-------+------+------+-------------+-------------------+---------------------+------------+---------+-------+--------+---------+---------------------+---------------------+
 8 rows in set (0.00 sec)
*/
exports['db.sites.insert'] = exports['db.posts.update'] = function (app, msg, cb) {
  async.auto({
    'site': function(next) {
      app.models.sites.findById(msg.body._id, next);
    },
    'domain': ['site', function(next, res) {
      app.models.dnsDomains.findOne({ name: res.site.domain }, function(err, domain) {
        if (err) { return next(err); }
        if (!domain) {
          domain = new app.models.dnsDomains({
            name: res.site.domain
          });
        }
        domain.save(function(err, domain) {
          if (err) { return next(err); }
          next(null, domain);
        });
      });
    }],
    'records': ['domain', function(next, data) {
      app.models.dnsRecords.find({ 'domain._id': data.domain._id }, next);
    }],
    'saveRecords': ['records', 'domain', function(next, data) {
      if (data.records.length) { return next(); }

      createRecords(app, data.domain, next);
    }]
  }, cb);
};

exports['db.sites.delete'] = function (app, msg, cb) {
  async.auto({
    'site': function(next) {
      app.models.sites.findById(msg.body._id, next);
    },
    'domain': ['site', function(next, res) {
      app.models.dnsDomains.findOne({ name: res.site.domain }, next);
    }],
    'records': ['domain', function(next, data) {
      app.models.dnsRecords.remove({ 'domain._id': data.domain._id }, next);
    }],
    'removeDomain': ['records', 'domain', function(next, data) {
      if (data.records.length) { return next(); }

      data.domain.remove(next);
    }]
  }, cb);
};