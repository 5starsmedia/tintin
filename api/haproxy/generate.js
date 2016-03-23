var domains = require('./domains.json'),
  fs = require('fs'),
  util = require('util'),
  _ = require('lodash');


var template = __dirname + '/templates/default.haproxycfg.tmpl',
  handlebars = require('handlebars');


// template helper for outputing FrontEnd acl rules
handlebars.registerHelper('aclRule', function (rule) {
  var rand = Math.random().toString(36).substring(3);
  var name = rule.type + '_' + rand;

  if (rule.type === 'path' || rule.type === 'url') {
    return util.format("acl %s %s %s\nuse_backend %s if %s\n", name, rule.operation, rule.value, rule.backend, name);
  }
  else if (rule.type === 'header') {
    return util.format("acl %s %s(%s) %s\nuse_backend %s if %s\n", name, rule.operation, rule.header, rule.value, rule.backend, name);
  }
});

handlebars.registerHelper('frontendHelper', function (frontend) {
  var output = [];
  var hasRules = frontend.rules && frontend.rules.length > 0;
  var hasNatives = frontend.natives && frontend.natives.length > 0;

  output.push("bind " + frontend.bind);
  output.push("  mode " + frontend.mode);
  output.push("  default_backend " + frontend.backend);

  // http only default options
  if (frontend.mode === 'http') {
    output.push("  option httplog");

    // The default keep-alive behavior is to use keep-alive if clients and
    // backends support it. However, if haproxy will only process rules when
    // a connection is first established so if any rules are used then server-close
    // should be specified at least and haproxy will let clients use keep-alive
    // to haproxy but close the backend connections each time.
    //
    // If there are any rules, the default behavior is to use http-server-close
    // and http-pretend-keepalive
    if (frontend.keepalive === 'server-close') {
      output.push("  option http-server-close");
      output.push("  option http-pretend-keepalive");
    }
    else if (frontend.keepalive === 'close'){
      output.push("  option forceclose");
    }
    // the default if there are rules is to use server close
    else if (hasRules) {
      output.push("  option http-server-close");
      output.push("  option http-pretend-keepalive");
    }
  }
  if (frontend.https) {
    output.push("  bind 0.0.0.0:443 ssl crt /root/.ssl/5starsmedia.com.ua.pem");
    output.push("  redirect scheme https if { hdr(Host) -i 5starsmedia.com.ua } !{ ssl_fc }");
  }

  /*output.push("  acl user-agent-bot hdr_sub(User-Agent) -i baiduspider twitterbot facebookexternalhit rogerbot linkedinbot embedly showyoubot outbrain pinterest slackbot vkShare W3C_Validator");
  output.push("  acl url-asset path_end js css xml less png jpg jpeg gif pdf doc txt ico rss zip mp3 rar exe wmv doc avi ppt mpg mpeg tif wav mov psd ai xls mp4 m4a swf dat dmg iso flv m4v torrent ttf woff");
  output.push("  acl url-escaped-fragment url_sub _escaped_fragment_");
  output.push("  use_backend prerender if user-agent-bot !url-asset");
  output.push("  use_backend prerender if url-escaped-fragment !url-asset");*/

  if (hasRules) {
    frontend.rules.forEach(function (rule) {
      var rand = Math.random().toString(36).substring(13);
      var name = rule.type + '_' + rand;

      if (rule.type === 'path' || rule.type === 'url') {
        output.push(util.format("  acl %s %s %s\n  use_backend %s if %s",
          name, rule.operation, rule.value, rule.backend, name));
      }
      else if (rule.type === 'header') {
        output.push(util.format("  acl %s %s(%s) %s\n  use_backend %s if %s",
          name, rule.operation, rule.header, rule.value, rule.backend, name));
      }
    });
  }

  if (hasNatives) {
    frontend.natives.forEach(function (native) {
      output.push(native);
    });
  }

  return output.join('\n');
});


// helper to output http check and servers block
handlebars.registerHelper('backendHelper', function (backend) {
  var host = backend.host;
  var health = backend.health;
  var members = backend.members;
  var output = [];
  var hasNatives = backend.natives && backend.natives.length > 0;

  // output mode and balance options
  output.push("mode " + backend.mode);
  output.push("  balance " + backend.balance);

  // host header propagation
  if (backend.host) {
    output.push("  reqirep ^Host:\\ .*  Host:\\ " + backend.host);
  }

  // option httpchk
  if (backend.mode === 'http' && health) {
    var httpVersion = (health.httpVersion === 'HTTP/1.1') ?
      ('HTTP/1.1\\r\\nHost:\\ ' + backend.host) :
      health.httpVersion;
    output.push(util.format("  option httpchk %s %s %s", health.method, health.uri, httpVersion));
  }

  if (hasNatives) {
    backend.natives.forEach(function (native) {
      output.push(native);
    });
  }

  if (members) {
    // server lines for each member
    members.forEach(function (member) {
      var name = backend.key;// util.format("%s_%s:%s", backend.key, member.host, member.port);
      var interval = (health) ? health.interval : 2000;
      output.push(util.format("  server %s %s:%s check inter %s", name, member.host, member.port, interval));
    });
  }

  return output.join('\n');
});


var frontends = {},
  backends = {}, rules = [];


domains = _.sortByAll(domains, function(item) {
  return -item.domain.length;
}, function(item) {
  return -(item.domain.match(/\./g) || []).length;
});


_.forEach(domains, function(item) {
  var key = 'frontend_' + item.domain.replace(/\./g, '_'),
    backendKey = 'backend_' + item.ip.replace(/\./g, '_');

  /*frontends[key] = {
    bind: '0.0.0.0:80',
    mode: 'http',
    backend: backendKey,
    rules: [
      {
        type: 'url',
        operation: 'hdr_end(host)',
        value: item.domain,
        backend: backendKey
      }
    ]
  };*/

  rules.push({
    type: 'url',
    operation: 'hdr_end(host)',
    value: item.domain,
    backend: backendKey
  });

  backends[backendKey] = {
    key: backendKey,
    mode: 'http',
    balance: 'roundrobin',
    members: [{
      host: item.ip,
      port: 80
    }]
  };
});


//docker run -d -p 1337:3000 --name "Prerender5" --restart always earlyclaim/docker-prerender-with-redis
//docker run -d -p 1338:3000 --name "Prerender6" --restart always earlyclaim/docker-prerender-with-redis
/*
backends['prerender'] = {
  key: 'prerender',
  mode: 'http',
  balance: 'roundrobin',
  members: [{
    host: '88.198.122.150',
    port: 1333
  }, {
    host: '88.198.122.150',
    port: 1334
  }, {
    host: '88.198.122.150',
    port: 1335
  }, {
    host: '88.198.122.150',
    port: 1336
  }, {
    host: '88.198.122.150',
    port: 1337
  }, {
    host: '88.198.122.150',
    port: 1338
  }]
};*/

frontends['main'] = {
  bind: '0.0.0.0:80',
  mode: 'http',
  rules: rules,
  https: true,
  backend: 'backend_10_0_0_20'
};

template = handlebars.compile(fs.readFileSync(template, 'utf-8'));

var data = {
  frontends: frontends,
  backends: backends,
  haproxySocketPath: ''
};

var config = template(data);

console.info(config)