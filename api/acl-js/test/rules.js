/**
 * Rules tests
 * @module test/rules
 * @copyright 2014 Cannasos.com. All rights reserved.
 * @license GPL V2 (https://github.com/cannasos/acl-js/blob/master/LICENSE)
 */

'use strict';
require('should');

var rules = require('../lib/rules.js');

describe('rules/compareRule', function () {
  var rule = {
    'get?_id&removed': 'admin',
    'get': ['admin', '*:owner'],
    'put': ['admin', 'producer:owner', 'doctor:owner'],
    'post': 'admin'
  };

  it('Should allow get for roles with "owner" modifier', function (done) {
    rules.compareRule(['producer', 'user'], ['owner'], 'get', [], rule).should.be.true;
    done();
  });

  it('Should deny get for producer without "owner" modifier', function (done) {
    rules.compareRule(['producer'], [], 'get', [], rule).should.be.false;
    done();
  });

  it('Should allow get with parameters (_id, removed) for admin', function (done) {
    rules.compareRule(['admin'], [], 'get', ['_id', 'removed'], rule).should.be.true;
    done();
  });

  it('Should deny get with parameter _id for admin', function (done) {
    rules.compareRule(['admin'], [], 'get', ['_id'], rule).should.be.false;
    done();
  });

  it('Should deny get with parameter _id for admin (inherited props)', function (done) {
    function Rule(){
      this['get?_id'] = 'admin';
    }
    Rule.prototype['get?_id&removed'] = 'admin';
    rules.compareRule(['admin'], [], 'get', ['_id', 'removed'], new Rule()).should.be.false;
    done();
  });
});
