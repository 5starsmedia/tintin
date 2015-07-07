// Configuration
var config = require('../config.js');

// DNS Server settings.
var dns = require('native-dns'),
  consts = require('native-dns-packet').consts,
  tld = require('tldjs'),
  async = require('async');
//geoip = require('geoip');

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

var Record = require('./record-mongodb.js'),
  defaultTtl = config.get('dns.default-ttl');

// GeoIP setup
/*var country = new geoip.Country(config.GeoDB),
 country_v6 = new geoip.Country6(config.GeoDB6),
 isp = new geoip.Org(config.GeoISP);
 *//*
 setInterval(function() {
 country.update(config.GeoDB);
 country_v6.update(config.GeoDB6);
 isp.update(config.GeoISP);
 // console.log('GeoIP Data updated.');
 }, 86400000);
 */

if (cluster.isMaster) {
  console.log("Starting master process...");

  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  /*
   cluster.on('listening', function(worker, address){
   console.log('listening: worker ' + worker.process.pid + ', Address: ' + address.address + ":" + address.port);
   });

   cluster.on('exit', function(worker, code, signal) {
   console.log('worker ' + worker.process.pid + ' exited.');
   });*/
} else {

  var ip = config.get('dns.ip'),
    port = config.get('dns.port');
// Start servers
  var UDPserver = dns.createServer({dgram_type: 'udp4'});
  UDPserver.serve(port, ip);

// TCP server
  if (config.get('dns.enable-tcp')) {
    var TCPserver = dns.createTCPServer();
    if (config.get('dns.enable-v6')) {
      TCPserver.serve(port, '::');
    } else {
      TCPserver.serve(port, ip);
    }
  }

// IPv6
  if (config.get('dns.enable-v6')) {
    var UDPserver6 = dns.createUDPServer({dgram_type: 'udp6'});
    UDPserver6.serve(port);
    UDPserver6.on('request', minimoedns);
    UDPserver6.on('error', function (err, buff, req, res) {
      console.log('UDP6 Server ERR:\n');
      console.log(err);
    });
  }

  console.log('DNS Server started at port ' + ip + ':' + port + '.');

// Query events...
  UDPserver.on('request', minimoedns);
  TCPserver.on('request', minimoedns);

  UDPserver.on('error', function (err, buff, req, res) {
    console.log('UDP Server ERR:\n');
    console.log(err);
  });
  TCPserver.on('error', function (err, buff, req, res) {
    console.log('TCP Server ERR:\n');
    console.log(err);
  });

}

// Functions
function randomOrder() {
  return (Math.round(Math.random()) - 0.5);
}

function authorityNS(res, queryName, callback) {
  var testv4 = new RegExp(/\d\d?\d?\.\d\d?\d?\.\d\d?\d?\.\d\d?\d?/),
    nameservers = config.get('dns.nameservers');
  // Send authority NS records.

  for (nameserver in nameservers) {
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

function minimoedns(request, response) {
   //console.log(request);
  // console.log(JSON.stringify(request.edns_options[0].data));
  // console.log(request.edns_options[0].data);

  var name = request.question[0].name,
    type = consts.qtypeToName(request.question[0].type),
    sourceIP = request.address.address.slice(0, request.address.address.lastIndexOf('.')) + '.0';
  var tldname = tld.getDomain(name);

  // EDNS options
  // TODO IPv6 support.
  if (request.edns_options[0]) {
    // response.edns_version = request.edns_version;
    var tempip = request.edns_options[0].data.slice(4);
    // console.log(request.edns_options[0].data.toJSON())
    if (request.edns_options[0].data.toJSON()[1] === 1) {
      // client is IPv4
      tempip = tempip.toJSON().join('.');
      if (request.edns_options[0].data.toJSON()[2] < 32) {
        for (var i = request.edns_options[0].data.toJSON()[2]; i <= 24; i += 8) {
          tempip += '.0';
        }
      }
      sourceIP = tempip;
      // console.log(sourceIP);
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
  // console.log(sourceIP);
  var sourceDest = '',//country.lookupSync(sourceIP),
    sourceISP = '';//isp.lookupSync(sourceIP);
  if (!sourceDest) {
    sourceDest = '';//country_v6.lookupSync(sourceIP)
  }
  // console.log(sourceDest);
  // console.log(sourceISP);

  if (!tld.isValid(name)) {
    response.header.rcode = consts.NAME_TO_RCODE.NOTFOUND;
    return response.send();
  }

  console.log(sourceIP + ' requested ' + name + ' for ' + type);

  // return version if quested version.bind
  if (name === 'version.bind' && type === 'TXT') {
    response.answer.push(dns.TXT({
      name: 'version.bind',
      data: config.get('dns.version'),
      ttl: 5
    }));
    response.answer[0].class = 3;
    // console.log(response);
    return response.send();
  }
  Record.querySOA(tldname, function (err, SOAresult) {
    if (err) {
      console.log(err);
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
          authorityNS(response, tldname, function () {
            response.send();
          });
          break;
        case "NS":
          Record.queryNS(name, function (err, res) {
            if (err) {
              return console.log('MiniMoeDNS ERR:\n' + err + '\n');
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
              authorityNS(response, tldname, function () {
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
              console.log(err);
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
              authorityNS(response, tldname, function () {
                return response.send();
              });
            } else {
              // Geo record not found, sending all available records...
              Record.queryA(name, function (err, result) {
                if (err) {
                  return console.log('MiniMoeDNS ERR:\n' + err + '\n');
                }
                // console.log(result);
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
                  authorityNS(response, tldname, function () {
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
                      // console.log(queryName);
                      Record.queryA('*.' + queryName, function (err, doc) {
                        // console.log(doc)
                        if (err) {
                          console.log(err);
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
                          authorityNS(response, tldname, function () {
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
            // console.log(georecords);
            if (err) {
              console.log(err);
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
              authorityNS(response, tldname, function () {
                return response.send();
              });
            } else {
              // Geo record not found, sending all available records...
              Record.queryAAAA(name, function (err, result) {
                if (err) {
                  return console.log('MiniMoeDNS ERR:\n' + err + '\n');
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
                  authorityNS(response, tldname, function () {
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
                      // console.log(queryName);
                      Record.queryAAAA('*.' + queryName, function (err, doc) {
                        // console.log(doc)
                        if (err) {
                          console.log(err);
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
                          authorityNS(response, tldname, function () {
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
            // console.log(georecords);
            if (err) {
              console.log(err);
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
              authorityNS(response, tldname, function () {
                return response.send();
              });
            } else {
              // Geo record not found, sending all available records...
              Record.queryCNAME(name, function (err, result) {
                if (err) {
                  return console.log('MiniMoeDNS ERR:\n' + err + '\n');
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
                  authorityNS(response, tldname, function () {
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
                      // console.log(queryName);
                      Record.queryCNAME('*.' + queryName, function (err, doc) {
                        // console.log(doc)
                        if (err) {
                          console.log(err);
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
                          authorityNS(response, tldname, function () {
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
              return console.log('MiniMoeDNS ERR:\n' + err + '\n');
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
              authorityNS(response, tldname, function () {
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
              return console.log('MiniMoeDNS ERR:\n' + err + '\n');
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
              authorityNS(response, tldname, function () {
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
              return console.log('MiniMoeDNS ERR:\n' + err + '\n');
            }
            if (res[0]) {
              res.forEach(function (record) {
                response.answer.push(dns.TXT({
                  name: record.domain.name,
                  data: record.content,
                  ttl: record.ttl || defaultTtl
                }));
              });
              authorityNS(response, tldname, function () {
                return response.send();
              });
            } else {
              notfound(response, SOAresult);
            }
          });
          break;
        default:
          response.header.rcode = consts.NAME_TO_RCODE.CONNREFUSED;
          return response.cancel();
      }
    }
  });
}

