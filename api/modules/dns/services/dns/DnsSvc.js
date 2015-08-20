'use strict';

var url = require('url');

function DnsSvc(app) {
  this.app = app;
}

DnsSvc.prototype.queryRecord = function (name, type, next) {
  console.info({
    'domain.name': name.toLowerCase(),
    type: type
  })
  this.app.models.dnsRecords.find({
    'domain.name': name.toLowerCase(),
    type: type
  }, next);
};


DnsSvc.prototype.queryGeo = function (name, type, dest, isp, sourceIP, next) {
  if (dest === null) {
    return callback(null);
  }
  this.app.models.dnsRecords.find({
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
  }, next);
};

DnsSvc.prototype.querySOA = function (name, callback) {
  this.queryRecord(name, 'SOA', callback);
};

DnsSvc.prototype.queryNS = function (name, callback) {
  this.queryRecord(name, 'NS', callback);
};

DnsSvc.prototype.queryA = function (name, callback) {
  this.queryRecord(name, 'A', callback);
};

DnsSvc.prototype.queryAAAA = function (name, callback) {
  this.queryRecord(name, 'AAAA', callback);
};

DnsSvc.prototype.queryCNAME = function (name, callback) {
  this.queryRecord(name, 'CNAME', callback);
};

DnsSvc.prototype.queryMX = function (name, callback) {
  this.queryRecord(name, 'MX', callback);
};

DnsSvc.prototype.querySRV = function (name, callback) {
  this.queryRecord(name, 'SRV', callback);
};

DnsSvc.prototype.queryTXT = function (name, callback) {
  this.queryRecord(name, 'TXT', callback);
};

module.exports = DnsSvc;
