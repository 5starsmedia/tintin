'use strict';
require('should');
var acl = require('../lib/index.js');
var mongoose = require('mongoose');

var testSchema1 = new mongoose.Schema({
  account: {
    title: String,
    login: String
  },
  password: String,
  title: String,
  tokens: [
    {
      g: String,
      value: String,
      x: Number
    }
  ]
});

var testSchema2 = new mongoose.Schema({
  account: {
    title: String,
    login: String
  },
  password: String,
  title: String,
  tokens: [
    {
      g: String,
      value: String,
      x: Number,
      subTokens: [
        {
          wer: String
        }
      ]
    }
  ]
});

var testSchema3 = new mongoose.Schema({
  account: {
    title: String,
    login: String,
    profile: {
      imageUrl: String,
      address: {
        city: String,
        text: String
      }
    }
  }
});

var schema1Props = acl.util.mongoose.getFields(testSchema1);
var schema2Props = acl.util.mongoose.getFields(testSchema2);
var schema3Props = acl.util.mongoose.getFields(testSchema3);

describe('index/compareAcl', function () {
  var acl1 = {
    '_id': {
      'delete': 'admin',
      'get': ['user', 'admin']
    },
    'account.login': {
      'get': ['admin', '*:owner'],
      'get?_id': ['admin', '*:owner'],
      'get?_id&login': ['admin', '*:owner'],
      'put': ['admin', 'producer:owner', 'doctor:owner'],
      'post': 'admin'
    },
    'password': {
      'get': 'superAdmin'
    },
    'tokens.x': false,
    'tokens.value': {
      'get': 'admin',
      'get?_id': 'admin'
    },
    'salt': false,
    '*': {
      'get': ['admin', '*:owner'],
      'put': '*:owner',
      'post': 'admin'
    }
  };

  var acl3 = {
    'account.login': {
      'get': 'admin'
    },
    'account.profile': {
      'get': 'admin'
    }
  };

  it('Should not has access if there is no allowed fields', function(done){
    var data = acl.compareAcl(schema1Props, acl1, {
      roles: 'guest',
      method: 'get',
      params: ['hash'],
      modifiers: [],
      fields: []
    });
    console.log(data);
    data.hasAccess.should.be.false;
    done();
  });

  it('Should be correct for admin GET with param in array', function (done) {
    var data = acl.compareAcl(schema1Props, acl1, {
      roles: 'admin',
      method: 'get',
      params: ['_id'],
      modifiers: [],
      fields: []
    });
    var expectedData = ['account.login', 'tokens.value'].sort();
    data.hasAccess.should.be.true;
    data.fields.sort().should.be.an.eql(expectedData);
    done();
  });

  it('Should be correct for admin GET with param in array and fields', function (done) {
    var data = acl.compareAcl(schema1Props, acl1, {
      roles: 'admin',
      method: 'get',
      params: ['_id'],
      modifiers: [],
      fields: ['account']
    });
    var expectedData = ['account.login'].sort();
    data.hasAccess.should.be.true;
    data.fields.sort().should.be.an.eql(expectedData);
    done();
  });

  it('Should be correct for admin GET with param as string', function (done) {
    var data = acl.compareAcl(schema1Props, acl1, {
      roles: 'admin',
      method: 'get',
      params: '_id',
      modifiers: [],
      fields: []
    });
    var expectedData = ['account.login', 'tokens.value'].sort();
    data.hasAccess.should.be.true;
    data.fields.sort().should.be.an.eql(expectedData);
    done();
  });

  it('Should be correct for admin GET with param and fields', function (done) {
    var data = acl.compareAcl(schema1Props, acl1, {
      roles: 'admin',
      method: 'get',
      params: ['_id'],
      modifiers: [],
      fields: ['account.title']
    });
    var expectedData = [];
    var expectedDeniedData = ['account.title'];
    data.hasAccess.should.be.false;
    data.fields.sort().should.be.an.eql(expectedData);
    data.deniedFields.sort().should.be.an.eql(expectedDeniedData);
    done();
  });

  it('Should be correct for admin GET with param, fields and incorrect role', function (done) {
    var data = acl.compareAcl(schema1Props, acl1, {
      roles: 'admin669',
      method: 'get',
      params: ['_id'],
      modifiers: [],
      fields: ['account.title']
    });
    var expectedData = [];
    data.hasAccess.should.be.false;
    data.fields.sort().should.be.an.eql(expectedData);
    done();
  });

  it('Should be correct for user:owner GET with param', function (done) {
    var data = acl.compareAcl(schema1Props, acl1, {
      roles: 'user',
      method: 'get',
      params: ['_id', 'login'],
      modifiers: ['owner'],
      fields: []
    });
    var expectedData = ['account.login'].sort();
    data.hasAccess.should.be.true;
    data.fields.sort().should.be.an.eql(expectedData);
    done();
  });

  it('Should be correct for admin GET', function (done) {
    var data = acl.compareAcl(schema1Props, acl1, {
      roles: 'admin',
      method: 'get',
      params: [],
      modifiers: [],
      fields: []
    });
    var expectedData = ['account.title', 'account.login', 'title', '_id', 'tokens.value', 'tokens.g'].sort();
    data.hasAccess.should.be.true;
    data.fields.sort().should.be.an.eql(expectedData);
    done();
  });

  it('Should be correct for admin PUT', function (done) {
    var data = acl.compareAcl(schema1Props, acl1, {
      roles: ['admin'],
      method: 'put',
      params: [],
      modifiers: [],
      fields: []
    });
    var expectedData = ['account.login'].sort();
    data.hasAccess.should.be.true;
    data.fields.sort().should.be.an.eql(expectedData);
    done();
  });

  it('Should be correct for admin:owner PUT', function (done) {
    var data = acl.compareAcl(schema1Props, acl1, {
      roles: ['admin'],
      method: 'put',
      params: [],
      modifiers: ['owner'],
      fields: []
    });
    var expectedData = ['tokens.g', 'account.login', 'account.title', 'title'].sort();
    data.hasAccess.should.be.true;
    data.fields.sort().should.be.an.eql(expectedData);
    done();
  });

  it('Should be correct for admin:xxx GET', function (done) {
    var data = acl.compareAcl(schema1Props, acl1, {
      roles: ['admin'],
      method: 'get',
      params: [],
      modifiers: ['xxx'],
      fields: []
    });
    var expectedData = ['tokens.g', 'tokens.value', 'account.title', 'account.login', 'title', '_id'].sort();
    data.hasAccess.should.be.true;
    data.fields.sort().should.be.an.eql(expectedData);
    done();
  });

  it('Should be correct for admin:xxx and superAdmin GET', function (done) {
    var data = acl.compareAcl(schema1Props, acl1, {
      roles: ['admin', 'superAdmin'],
      method: 'get',
      params: [],
      modifiers: [],
      fields: []
    });
    var expectedData = ['tokens.g', 'tokens.value', 'account.title', 'password', 'account.login', 'title',
      '_id'].sort();
    data.hasAccess.should.be.true;
    data.fields.sort().should.be.an.eql(expectedData);
    done();
  });

  it('Should be return _id only for user', function (done) {
    var data = acl.compareAcl(schema1Props, acl1, {
      roles: ['user'],
      method: 'get',
      params: [],
      modifiers: [],
      fields: []
    });
    var expectedData = ['_id'].sort();
    data.hasAccess.should.be.true;
    data.fields.sort().should.be.an.eql(expectedData);
    done();
  });

  it('Should be correct for user:owner GET', function (done) {
    var data = acl.compareAcl(schema1Props, acl1, {
      roles: ['user'],
      method: 'get',
      params: [],
      modifiers: ['owner'],
      fields: []
    });
    var expectedData = ['tokens.g', '_id', 'account.login', 'account.title', 'title'].sort();
    data.hasAccess.should.be.true;
    data.fields.sort().should.be.an.eql(expectedData);
    done();
  });

  it('Should be correct for user:owner GET with fields', function (done) {
    var data = acl.compareAcl(schema1Props, acl1, {
      roles: ['user'],
      method: 'get',
      params: [],
      modifiers: ['owner'],
      fields: ['tokens', 'account']
    });
    var expectedData = ['tokens.g', 'account.login', 'account.title'].sort();
    data.hasAccess.should.be.true;
    data.fields.sort().should.be.an.eql(expectedData);
    done();
  });

  it('Should be correct for admin GET with fields', function (done) {
    var data = acl.compareAcl(schema1Props, acl1, {
      roles: ['admin'],
      method: 'get',
      params: [],
      modifiers: [],
      fields: ['tokens', 'account']
    });
    var expectedData = ['tokens.g', 'tokens.value', 'account.login', 'account.title'].sort();
    data.hasAccess.should.be.true;
    data.fields.sort().should.be.an.eql(expectedData);
    done();
  });

  it('Should contain nested objects paths', function (done) {
    var data = acl.compareAcl(schema2Props, acl1, {
      roles: ['user'],
      method: 'get',
      params: [],
      modifiers: ['owner'],
      fields: []
    });
    var expectedData = ['tokens.g', 'tokens.subTokens.wer', '_id', 'account.login', 'account.title', 'title'].sort();
    data.hasAccess.should.be.true;
    data.fields.sort().should.be.an.eql(expectedData);
    done();
  });

  it('Should contain nested objects paths and field as array', function (done) {
    var data = acl.compareAcl(schema2Props, acl1, {
      roles: ['user'],
      method: 'get',
      params: [],
      modifiers: ['owner'],
      fields: ['tokens']
    });
    var expectedData = ['tokens.g', 'tokens.subTokens.wer'].sort();
    data.hasAccess.should.be.true;
    data.fields.sort().should.be.an.eql(expectedData);
    done();
  });

  it('Should contain nested objects paths and field as string', function (done) {
    var data = acl.compareAcl(schema2Props, acl1, {
      roles: 'user',
      method: 'get',
      params: [],
      modifiers: ['owner'],
      fields: 'tokens'
    });
    var expectedData = ['tokens.g', 'tokens.subTokens.wer'].sort();
    data.hasAccess.should.be.true;
    data.fields.sort().should.be.an.eql(expectedData);
    done();
  });

  it('Should contain inner fields', function (done) {
    var data = acl.compareAcl(schema3Props, acl3, {
      roles: 'admin',
      method: 'get',
      params: [],
      modifiers: [],
      fields: 'account.profile.address.city'
    });
    var expectedData = ['account.profile.address.city'].sort();
    data.hasAccess.should.be.true;
    data.fields.sort().should.be.an.eql(expectedData);
    done();
  });

  it('Should not contain inner fields with invalid method', function (done) {
    var data = acl.compareAcl(schema3Props, acl3, {
      roles: 'admin',
      method: 'post',
      params: [],
      modifiers: [],
      fields: 'account.profile.address.city'
    });
    var expectedData = [];
    data.hasAccess.should.be.false;
    data.fields.sort().should.be.an.eql(expectedData);
    done();
  });
});

describe('index/getOptions', function () {
  var opts = {
    'db.safe': 2,
    'searchFields': [
      {role: 'admin', value: ['title', 'login', 'tickets.value']},
      {role: '*', value: ['title']}
    ],
    'maxPerPage': [
      {role: 'admin, producer', value: 200},
      {role: '*:owner', value: 300},
      {role: '*', value: 100}
    ],
    'field': [
      {role: 'user', value: 100}
    ]
  };

  it('Should get admin properties', function (done) {
    var res = acl.getOptions(opts, {roles: 'admin', modifiers: ['owner']});
    res.should.eql({
      'db.safe': 2,
      'maxPerPage': 200,
      'searchFields': ['title', 'login', 'tickets.value']
    });
    done();
  });

  it('Should get producer properties', function (done) {
    var res = acl.getOptions(opts, {roles: 'producer', modifiers: []});
    res.should.eql({
      'db.safe': 2,
      'maxPerPage': 200,
      'searchFields': ['title']
    });
    done();
  });

  it('Should get user properties', function (done) {
    var res = acl.getOptions(opts, {roles: 'user', modifiers: []});
    res.should.eql({
      'db.safe': 2,
      'maxPerPage': 100,
      'searchFields': ['title'],
      'field': 100
    });
    done();
  });
});
