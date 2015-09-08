var expect = require('chai').expect,
  mocha = require('mocha'),
  request = require('request');

var domain = 'lgz.5stars.link';

var apiUrl = 'http://' + domain,
  apiVersion = '2.0.0',
  phpVersion = '5.6.2-1~dotdeb.1',
  phpUploadLimit = '100M',
  phpPostLimit = '200M';

describe('server response', function () {

  it('should redirect from www subdomain', function (done) {
    var options = {
      url: apiUrl.replace('http://', 'http://www.') + '/',
      followRedirect: false
    };
    request.get(options, function (err, res, body){
      expect(res.statusCode).to.equal(301);
      expect(res.headers['location']).to.equal(apiUrl + '/');

      done();
    });
  });

  it('should get file from gridfs (/)', function (done) {
    var options = {
      url: apiUrl + '/',
      followRedirect: false
    };
    request.get(options, function (err, res, body){
      expect(res.statusCode).to.equal(200);
      expect(res.headers['x-gridfs-file']).to.equal('/gridfs/' + domain + '/index.html');

      done();
    });
  });

  it('should get file from gridfs (/index.html)', function (done) {
    var options = {
      url: apiUrl + '/index.html',
      followRedirect: false
    };
    request.get(options, function (err, res, body){
      expect(res.statusCode).to.equal(200);
      expect(res.headers['x-gridfs-file']).to.equal('/gridfs/' + domain + '/index.html');

      done();
    });
  });

  it('should get file from gridfs (/favicon.png)', function (done) {
    var options = {
      url: apiUrl + '/favicon.png',
      followRedirect: false
    };
    request.get(options, function (err, res, body){
      expect(res.statusCode).to.equal(200);
      expect(res.headers['x-gridfs-file']).to.equal('/gridfs/' + domain + '/favicon.png');

      done();
    });
  });

  /*it('should redirect from /admin/ to /cabinet/', function (done) {
    var options = {
      url: apiUrl + '/admin/',
      followRedirect: false
    };
    request.get(options, function (err, res, body){
      expect(res.statusCode).to.equal(301);
      expect(res.headers['location']).to.equal(apiUrl + '/cabinet/');

      done();
    });
  });*/

  it('should work api url (/api)', function (done) {
    var response = '{"success":true}';

    request.get(apiUrl + '/api', function (err, res, body){
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.equal(response);

      request.get(apiUrl + '/api/', function (err, res, body){
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.equal(response);
        done();
      });
    });
  });

  /*it('should work tracking (/track.gif)', function (done) {
    var response = 'R0lGODlhAQABAO+/vQEAAAAA77+977+977+9Ie+/vQQBAAABACwAAAAAAQABAAACAkwBADs=';

    request.get(apiUrl + '/track.gif', function (err, res, body){
      expect(res.statusCode).to.equal(200);
      expect(new Buffer(res.body).toString('base64')).to.equal(response);
      done();
    });
  });*/

  /*it('should enabled gzip (/)', function (done) {
    var options = {
      url: apiUrl + '/',
      headers: {
        'Accept-Encoding': 'gzip,deflate,sdch'
      }
    };
    request.get(options, function (err, res, body){
      expect(res.statusCode).to.equal(200);
      console.info(res.headers)
      expect(res.headers['content-encoding']).to.equal('gzip');
      done();
    });
  });*/

  it('should denied for scanners', function (done) {
    var options = {
      url: apiUrl + '/',
      headers: {
        'User-Agent': 'Morfeus Fucking Scanner'
      }
    };
    request.get(options, function (err, res, body){
      expect(res.statusCode).to.equal(500);
      done();
    });
  });

  /*it('should proxy to elasticsearch', function (done) {
    var options = {
      url: apiUrl + '/es_test/_status'
    };
    request.get(options, function (err, res, body){
      expect(res.statusCode).to.equal(404);
      expect(res.body).to.equal('{"error":"IndexMissingException[[es_test] missing]","status":404}');

      options.method = 'OPTIONS';
      request(options, function (err, res, body){
        expect(res.headers['access-control-allow-headers']).to.equal('X-Requested-With, Content-Type, Authorization');
        expect(res.headers['access-control-allow-credentials']).to.equal('true');
        //expect(res.headers['access-control-allow-origin']).to.equal('*');
        //expect(res.headers['access-control-allow-methods']).to.equal('*');
        done();
      });
    });
  });*/
  /*it('should work share script', function (done) {
    var options = {
      url: apiUrl + '/?__share=1'
    };
    request.get(options, function (err, res, body){
      expect(res.headers['x-share-url']).to.equal(apiUrl + '/?__share=1');

      var options = {
        url: apiUrl + '/',
        headers: {
          'Content-Type': 'text/html',
          'User-Agent': 'facebookexternalhit/1.0 (+http://www.facebook.com/externalhit_uatext.php)'
        }
      };
      request.get(options, function (err, res, body){
        expect(res.headers['x-share-url']).to.equal(apiUrl + '/');


        done();
      });
    });
  });*/
  /*it('should work prerender', function (done) {
    var options = {
      url: apiUrl + '/?__prerender=1'
    };
    request.get(options, function (err, res, body){
      expect(res.headers['x-prerender-url']).to.equal(apiUrl + '/?__prerender=1');

      expect(res.body).to.match(/Добро пожаловать в Collaborator/);
      done();
    });
  });*/
  /*it('should prerender redirect', function (done) {
    var options = {
      url: apiUrl + '/redirect?_escaped_fragment_=',
      followRedirect: false
    };
    request.get(options, function (err, res, body){
      expect(res.statusCode).to.equal(302);
      expect(res.headers['location']).to.equal('http://google.com/');

      done();
    });
  });*/
  it('should prerender not found', function (done) {
    var rand = Math.random(),
      options = {
        url: apiUrl + '/notFound' + rand + '?_escaped_fragment_='
      };
    request.get(options, function (err, res, body){
      expect(res.statusCode).to.equal(404);
      expect(res.headers['x-gridfs-file']).to.equal('/gridfs/' + domain + '/index.html');

      done();
    });
  });
  /*it('should not exists domain not found', function (done) {
    var options = {
      url: 'http://notfound.5stars.link/'
    };
    request.get(options, function (err, res, body){
      expect(res.statusCode).to.equal(410);
      expect(res.body).to.match(/Domain not found/);

      done();
    });
  });*/

  /*
   it('should return share info', function (done) {
   var options = {
   url: 'http://vinnitsaok.com.ua/2014/10/11/191028',
   headers: {
   'Content-Type': 'text/html',
   'User-Agent': 'facebookexternalhit/1.0 (+http://www.facebook.com/externalhit_uatext.php)'
   }
   };
   request.get(options, function (err, res, body){
   expect(res.statusCode).to.equal(200);
   expect(res.body, 'title').to.match(/<title>Кому довіряти(.*)\?<\/title>/);
   done();
   });
   });

   it('should redirect old urls', function (done) {
   var options = {
   url: 'http://vinnitsaok.com.ua/u-vinnytsi-mitynhari-4-hodyny-trymaly-v-oblozi-oblderzhadministratsiyu-i-oblradu-168545.html',
   headers: {
   'Content-Type': 'text/html'
   }
   };
   request.get(options, function (err, res, body){
   expect(res.statusCode).to.equal(302);
   //expect(res.body, 'title').to.match(/<title>Кому довіряти(.*)\?<\/title>/);
   done();
   });
   });*/

});