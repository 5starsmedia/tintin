'use strict';

var dns = require('native-dns'),
  consts = require('native-dns-packet').consts,
  tld = require('tldjs'),
  _ = require('lodash'),
  url = require('url'),
  psl = require('psl'),
  async = require('async');
var nestedSet = require('../../middleware/nestedSet.js'),
  dnsSvc = require('./services/dns'),
  defaultTtl = 360;

function DnsModule(app) {
  this.app = app;
}


DnsModule.prototype.initModels = function () {
  this.app.models.dnsRecords = require('./models/dnsRecord.js');
  this.app.models.dnsDomains = require('./models/dnsDomain.js');
};

DnsModule.prototype.initServices = function () {
  this.app.services.dns = new dnsSvc.DnsSvc(this.app);
};

DnsModule.prototype.initRoutes = function () {
//  this.app.server.use('/api/issues', require('./routes/issues.js'));
};

DnsModule.prototype.initServer = function () {

  var ip = this.app.config.get('dns.ip'),
    port = this.app.config.get('dns.port');

  defaultTtl = this.app.config.get('dns.default-ttl');

  // Start servers
  var UDPserver = dns.createServer({dgram_type: 'udp4'});
  UDPserver.serve(port, ip);

  // TCP server
  if (this.app.config.get('dns.enable-tcp')) {
    var TCPserver = dns.createTCPServer();
    if (this.app.config.get('dns.enable-v6')) {
      TCPserver.serve(port, '::');
    } else {
      TCPserver.serve(port, ip);
    }
  }

  var log = this.app.log;
  // IPv6
  if (this.app.config.get('dns.enable-v6')) {
    var UDPserver6 = dns.createUDPServer({dgram_type: 'udp6'});
    UDPserver6.serve(port);
    UDPserver6.on('request', _.bind(this.onDnsRequest, this));
    UDPserver6.on('error', function (err, buff, req, res) {
      log.error('UDP6 Server ERR:\n');
      log.error(err);
    });
  }

  this.app.log.info('DNS Server started at port ' + ip + ':' + port + '.');

  // Query events...
  UDPserver.on('request', _.bind(this.onDnsRequest, this));
  TCPserver.on('request', _.bind(this.onDnsRequest, this));

  UDPserver.on('error', function (err, buff, req, res) {
    log.error('UDP Server ERR:\n');
    log.error(err);
  });
  TCPserver.on('error', function (err, buff, req, res) {
    log.error('TCP Server ERR:\n');
    log.error(err);
  });
};




// Functions
function randomOrder() {
  return (Math.round(Math.random()) - 0.5);
}

DnsModule.prototype.authorityNS = function(res, queryName, callback) {
  var testv4 = new RegExp(/\d\d?\d?\.\d\d?\d?\.\d\d?\d?\.\d\d?\d?/),
    nameservers = this.app.config.get('dns.nameservers');
  // Send authority NS records.

  for (var nameserver in nameservers) {
    if (!nameservers.hasOwnProperty(nameserver)) {
      continue;
    }

    res.authority.push(dns.NS({
      name: queryName,
      data: nameserver,
      ttl: defaultTtl
    }));
    nameservers[nameserver].forEach(function (nsIP) {
      if (testv4.test(nsIP)) {
        res.additional.push(dns.A({
          name: nameserver,
          address: nsIP,
          ttl: defaultTtl
        }));
      } else {
        res.additional.push(dns.AAAA({
          name: nameserver,
          address: nsIP,
          ttl: defaultTtl
        }));
      }
    });
  }
  callback();
}

function notfound(res, SOA) {
  var content = SOA[0].content.split(" ");
  res.authority.push(dns.SOA({
    name: SOA[0].domain.name,
    primary: content[0],
    admin: content[1].replace("@", "."),
    serial: content[2],
    refresh: content[3],
    retry: content[4],
    expiration: content[5],
    minimum: content[6],
    ttl: SOA[0].ttl || defaultTtl
  }));
  res.header.rcode = consts.NAME_TO_RCODE.NOTFOUND;
  return res.send();
}

DnsModule.prototype.onDnsRequest = function (request, response) {
  //this.app.log.info(request);
  // this.app.log.info(JSON.stringify(request.edns_options[0].data));
  // this.app.log.info(request.edns_options[0].data);

  var Record = this.app.services.dns,
    self = this;

  var name = request.question[0].name,
    type = consts.qtypeToName(request.question[0].type),
    sourceIP = request.address.address.slice(0, request.address.address.lastIndexOf('.')) + '.0';
  var tldname = tld.getDomain(name);

  // EDNS options
  // TODO IPv6 support.
  if (request.edns_options[0]) {
    // response.edns_version = request.edns_version;
    var tempip = request.edns_options[0].data.slice(4);
    // this.app.log.info(request.edns_options[0].data.toJSON())
    if (request.edns_options[0].data.toJSON()[1] === 1) {
      // client is IPv4
      tempip = tempip.toJSON().join('.');
      if (request.edns_options[0].data.toJSON()[2] < 32) {
        for (var i = request.edns_options[0].data.toJSON()[2]; i <= 24; i += 8) {
          tempip += '.0';
        }
      }
      sourceIP = tempip;
      // this.app.log.info(sourceIP);
      response.edns_options.push(request.edns_options[0]);
      response.additional.push({
        name: '',
        type: 41,
        class: 4096,
        rdlength: 8
      });
    } else if (request.edns_options[0].data.toJSON()[2] === 128) {
      // client is IPv6
      // TODO implement IPv6 edns_options
    }
  }

  // Get source IP
  // this.app.log.info(sourceIP);
  var sourceDest = '',//country.lookupSync(sourceIP),
    sourceISP = '';//isp.lookupSync(sourceIP);
  if (!sourceDest) {
    sourceDest = '';//country_v6.lookupSync(sourceIP)
  }
  // this.app.log.info(sourceDest);
  // this.app.log.info(sourceISP);

  if (!tld.isValid(name)) {
    response.header.rcode = consts.NAME_TO_RCODE.NOTFOUND;
    return response.send();
  }

  this.app.log.info(sourceIP + ' requested ' + name + ' for ' + type);

  // return version if quested version.bind
  if (name === 'version.bind' && type === 'TXT') {
    response.answer.push(dns.TXT({
      name: 'version.bind',
      data: this.app.config.get('dns.version'),
      ttl: 5
    }));
    response.answer[0].class = 3;
    // this.app.log.info(response);
    return response.send();
  }
  var info = psl.parse(tldname),
    domain = info.domain,
    subdomain = info.subdomain;
  if (info.tld == 'localhost') {
    domain = info.tld;
  }
  Record.querySOA(domain, function (err, SOAresult) {
    if (err) {
      this.app.log.info(err);
    } else if (!SOAresult[0]) {
      response.header.rcode = consts.NAME_TO_RCODE.NOTFOUND;
      response.send();
    } else {
      response.header.aa = 1;
      switch (type) {
        case "SOA":
          var content = SOAresult[0].content.split(" ");
          response.answer.push(dns.SOA({
            name: SOAresult[0].domain.name,
            primary: content[0],
            admin: content[1].replace("@", "."),
            serial: content[2],
            refresh: content[3],
            retry: content[4],
            expiration: content[5],
            minimum: content[6],
            ttl: SOAresult[0].ttl || defaultTtl
          }));
          self.authorityNS(response, tldname, function () {
            response.send();
          });
          break;
        case "NS":
          Record.queryNS(name, function (err, res) {
            if (err) {
              return this.app.log.info('MiniMoeDNS ERR:\n' + err + '\n');
            }
            if (res[0]) {
              res = res.sort(randomOrder);
              res.forEach(function (record) {
                response.answer.push(dns.NS({
                  name: record.domain.name,
                  data: record.content,
                  ttl: record.ttl || defaultTtl
                }));
              });
              self.authorityNS(response, tldname, function () {
                return response.send();
              });
            } else {
              notfound(response, SOAresult);
            }
          });
          break;
        case "A":
        case "ANY":
          // GeoDNS for A record is supported. Processing with edns-client-subnet support
          Record.queryGeo(name, type, sourceDest, sourceISP, sourceIP, function (err, georecords) {
            if (err) {
              this.app.log.info(err);
            }
            if (georecords[0]) {
              // Geo Records found, sending optimized responses..
              georecords = georecords.sort(randomOrder);
              georecords.forEach(function (record) {
                switch (record.type) {
                  case "A":
                    response.answer.push(dns.A({
                      name: record.domain.name,
                      address: record.content,
                      ttl: record.ttl || defaultTtl
                    }));
                    break;
                  case "CNAME":
                    response.answer.push(dns.CNAME({
                      name: record.domain.name,
                      data: record.content,
                      ttl: record.ttl || defaultTtl
                    }));
                    break;
                }
              });
              self.authorityNS(response, tldname, function () {
                return response.send();
              });
            } else {
              // Geo record not found, sending all available records...
              Record.queryA(name, function (err, result) {
                if (err) {
                  return this.app.log.info('MiniMoeDNS ERR:\n' + err + '\n');
                }
                // this.app.log.info(result);
                if (result[0]) {
                  result = result.sort(randomOrder);
                  result.forEach(function (record) {
                    switch (record.type) {
                      case "A":
                        response.answer.push(dns.A({
                          name: record.domain.name,
                          address: record.content,
                          ttl: record.ttl || defaultTtl
                        }));
                        break;
                      case "CNAME":
                        response.answer.push(dns.CNAME({
                          name: record.domain.name,
                          data: record.content,
                          ttl: record.ttl || defaultTtl
                        }));
                        break;
                    }
                  });
                  self.authorityNS(response, tldname, function () {
                    return response.send();
                  });
                } else {
                  // Current querying name not found, trying if its wildcard.
                  var sub = tld.getSubdomain(name);
                  // var pattern = new RegExp(/\./);
                  if (sub == '') {
                    notfound(response, SOAresult);
                  } else {
                    var queryName = name;
                    async.until(function () {
                      return !tld.getSubdomain(queryName);
                    }, function (callback) {
                      queryName = queryName.substr(queryName.indexOf('.') + 1);
                      // this.app.log.info(queryName);
                      Record.queryA('*.' + queryName, function (err, doc) {
                        // this.app.log.info(doc)
                        if (err) {
                          this.app.log.info(err);
                        }
                        if (doc[0]) {
                          doc = doc.sort(randomOrder);
                          doc.forEach(function (docResult) {
                            switch (docResult.type) {
                              case "A":
                                response.answer.push(dns.A({
                                  name: name,
                                  address: docResult.content,
                                  ttl: docResult.ttl || defaultTtl
                                }));
                                break;
                              case "CNAME":
                                response.answer.push(dns.CNAME({
                                  name: name,
                                  data: docResult.content,
                                  ttl: docResult.ttl || defaultTtl
                                }));
                                break;
                            }
                          });
                          self.authorityNS(response, tldname, function () {
                            return response.send();
                          });
                        }
                        callback();
                      });
                    }, function () {
                      // Nothing found, sending NXDOMAIN
                      notfound(response, SOAresult);
                    });
                  }
                }
              });
            }
          });
          break;
        case "AAAA":
          // GeoDNS for AAAA record is supported. Processing WITHOUT edns-client-subnet support
          Record.queryGeo(name, type, sourceDest, sourceISP, sourceIP, function (err, georecords) {
            // this.app.log.info(georecords);
            if (err) {
              this.app.log.info(err);
            }
            if (georecords[0]) {
              // Geo Records found, sending optimized responses..
              georecords = georecords.sort(randomOrder);
              georecords.forEach(function (record) {
                switch (record.type) {
                  case "AAAA":
                    response.answer.push(dns.AAAA({
                      name: record.domain.name,
                      address: record.content,
                      ttl: record.ttl || defaultTtl
                    }));
                    break;
                  case "CNAME":
                    response.answer.push(dns.CNAME({
                      name: record.domain.name,
                      data: record.content,
                      ttl: record.ttl || defaultTtl
                    }));
                    break;
                }
              });
              self.authorityNS(response, tldname, function () {
                return response.send();
              });
            } else {
              // Geo record not found, sending all available records...
              Record.queryAAAA(name, function (err, result) {
                if (err) {
                  return this.app.log.info('MiniMoeDNS ERR:\n' + err + '\n');
                }
                if (result[0]) {
                  result = result.sort(randomOrder);
                  result.forEach(function (record) {
                    switch (record.type) {
                      case "AAAA":
                        response.answer.push(dns.AAAA({
                          name: record.domain.name,
                          address: record.content,
                          ttl: record.ttl || defaultTtl
                        }));
                        break;
                      case "CNAME":
                        response.answer.push(dns.CNAME({
                          name: record.domain.name,
                          data: record.content,
                          ttl: record.ttl || defaultTtl
                        }));
                        break;
                      case "A":
                        var content = SOAresult[0].content.split(" ");
                        response.authority.push(dns.SOA({
                          name: SOAresult[0].domain.name,
                          primary: content[0],
                          admin: content[1].replace("@", "."),
                          serial: content[2],
                          refresh: content[3],
                          retry: content[4],
                          expiration: content[5],
                          minimum: content[6],
                          ttl: SOAresult[0].ttl || defaultTtl
                        }));
                        response.header.rcode = consts.NAME_TO_RCODE.NOERROR;
                        return response.send();
                        break;
                    }
                  });
                  self.authorityNS(response, tldname, function () {
                    return response.send();
                  });
                } else {
                  // Current querying name not found, trying if its wildcard.
                  var sub = tld.getSubdomain(name);
                  // var pattern = new RegExp(/\./);
                  if (sub == '') {
                    // directly send SOA as we queried before.
                    notfound(response, SOAresult);
                  } else {
                    var queryName = name;
                    async.until(function () {
                      return !tld.getSubdomain(queryName);
                    }, function (callback) {
                      queryName = queryName.substr(queryName.indexOf('.') + 1);
                      // this.app.log.info(queryName);
                      Record.queryAAAA('*.' + queryName, function (err, doc) {
                        // this.app.log.info(doc)
                        if (err) {
                          this.app.log.info(err);
                        }
                        if (doc[0]) {
                          doc = doc.sort(randomOrder);
                          doc.forEach(function (docResult) {
                            switch (docResult.type) {
                              case "AAAA":
                                response.answer.push(dns.AAAA({
                                  name: name,
                                  address: docResult.content,
                                  ttl: docResult.ttl || defaultTtl
                                }));
                                break;
                              case "CNAME":
                                response.answer.push(dns.CNAME({
                                  name: name,
                                  data: docResult.content,
                                  ttl: docResult.ttl || defaultTtl
                                }));
                                break;
                              case "A":
                                var content = SOAresult[0].content.split(" ");
                                response.authority.push(dns.SOA({
                                  name: SOAresult[0].domain.name,
                                  primary: content[0],
                                  admin: content[1].replace("@", "."),
                                  serial: content[2],
                                  refresh: content[3],
                                  retry: content[4],
                                  expiration: content[5],
                                  minimum: content[6],
                                  ttl: SOAresult[0].ttl || defaultTtl
                                }));
                                response.header.rcode = consts.NAME_TO_RCODE.NOERROR;
                                return response.send();
                                break;
                            }
                          });
                          self.authorityNS(response, tldname, function () {
                            return response.send();
                          });
                        }
                        callback();
                      });
                    }, function () {
                      // Nothing found, sending NXDOMAIN
                      notfound(response, SOAresult);
                    });
                  }
                }
              });
            }
          });
          break;
        case "CNAME":
          // GeoDNS for CNAME record is supported. Processing with edns-client-subnet support
          Record.queryGeo(name, type, sourceDest, sourceISP, sourceIP, function (err, georecords) {
            // this.app.log.info(georecords);
            if (err) {
              this.app.log.info(err);
            }
            if (georecords[0]) {
              // Geo Records found, sending optimized responses..
              georecords = georecords.sort(randomOrder);
              georecords.forEach(function (record) {
                response.answer.push(dns.CNAME({
                  name: record.domain.name,
                  data: record.content,
                  ttl: record.ttl || defaultTtl
                }));
              });
              self.authorityNS(response, tldname, function () {
                return response.send();
              });
            } else {
              // Geo record not found, sending all available records...
              Record.queryCNAME(name, function (err, result) {
                if (err) {
                  return this.app.log.info('MiniMoeDNS ERR:\n' + err + '\n');
                }
                if (result[0]) {
                  result = result.sort(randomOrder);
                  result.forEach(function (record) {
                    response.answer.push(dns.CNAME({
                      name: record.domain.name,
                      data: record.content,
                      ttl: record.ttl || defaultTtl
                    }));
                  });
                  self.authorityNS(response, tldname, function () {
                    return response.send();
                  });
                } else {
                  // Current querying name not found, trying if its wildcard.
                  var sub = tld.getSubdomain(name);
                  // var pattern = new RegExp(/\./);
                  if (sub == '') {
                    // directly send SOA as we queried before.
                    notfound(response, SOAresult);
                  } else {
                    var queryName = name;
                    async.until(function () {
                      return !tld.getSubdomain(queryName);
                    }, function (callback) {
                      queryName = queryName.substr(queryName.indexOf('.') + 1);
                      // this.app.log.info(queryName);
                      Record.queryCNAME('*.' + queryName, function (err, doc) {
                        // this.app.log.info(doc)
                        if (err) {
                          this.app.log.info(err);
                        }
                        if (doc[0]) {
                          doc = doc.sort(randomOrder);
                          doc.forEach(function (docResult) {
                            response.answer.push(dns.CNAME({
                              name: docResult.domain.name,
                              data: docResult.content,
                              ttl: docResult.ttl || defaultTtl
                            }));
                          });
                          self.authorityNS(response, tldname, function () {
                            return response.send();
                          });
                        }
                        callback();
                      });
                    }, function () {
                      // Nothing found, sending NXDOMAIN
                      notfound(response, SOAresult);
                    });
                  }
                }
              });
            }
          });
          break;
        case "MX":
          Record.queryMX(name, function (err, res) {
            if (err) {
              return this.app.log.info('MiniMoeDNS ERR:\n' + err + '\n');
            }
            if (res[0]) {
              res = res.sort(randomOrder);
              res.forEach(function (record) {
                response.answer.push(dns.MX({
                  name: record.domain.name,
                  priority: record.priority,
                  exchange: record.content,
                  ttl: record.ttl || defaultTtl
                }));
              });
              self.authorityNS(response, tldname, function () {
                return response.send();
              });
            } else {
              notfound(response, SOAresult);
            }
          });
          break;
        case "SRV":
          Record.querySRV(name, function (err, res) {
            if (err) {
              return this.app.log.info('MiniMoeDNS ERR:\n' + err + '\n');
            }
            if (res[0]) {
              res.forEach(function (record) {
                var content = record.content.split(" ");
                response.answer.push(dns.SRV({
                  name: record.domain.name,
                  priority: record.priority,
                  weight: content[0],
                  port: content[1],
                  target: content[2],
                  ttl: record.ttl || defaultTtl
                }));
              });
              self.authorityNS(response, tldname, function () {
                return response.send();
              });
            } else {
              notfound(response, SOAresult);
            }
          });
          break;
        case "TXT":
          Record.queryTXT(name, function (err, res) {
            if (err) {
              return this.app.log.info('MiniMoeDNS ERR:\n' + err + '\n');
            }
            if (res[0]) {
              res.forEach(function (record) {
                response.answer.push(dns.TXT({
                  name: record.domain.name,
                  data: record.content,
                  ttl: record.ttl || defaultTtl
                }));
              });
              self.authorityNS(response, tldname, function () {
                return response.send();
              });
            } else {
              notfound(response, SOAresult);
            }
          });
          break;
        default:
          response.header.rcode = consts.NAME_TO_RCODE.CONNREFUSED;
          return response.send();
      }
    }
  });
};

module.exports = DnsModule;