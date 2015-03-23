/**
 * Roles tests
 * @module test/roles
 * @copyright 2014 Cannasos.com. All rights reserved.
 * @license GPL V2 (https://github.com/cannasos/acl-js/blob/master/LICENSE)
 */

'use strict';
require('should');
var _ = require('lodash');
var roles = require('../lib/roles.js');

describe('roles/compareRole', function () {
  it('Should be true for "user:owner" and "*:owner"', function (done) {
    roles.compareRole('user', ['owner'], {name: '*', modifiers: ['owner']}).should.be.true;
    done();
  });

  it('Should be true for "user:owner" and "user"', function (done) {
    roles.compareRole('user', ['owner'], {name: 'user', modifiers: []}).should.be.true;
    done();
  });

  it('Should be true for "user:owner" and "*"', function (done) {
    roles.compareRole('user', ['owner'], {name: '*', modifiers: []}).should.be.true;
    done();
  });

  it('Should be true for "user" and "*"', function (done) {
    roles.compareRole('user', [], {name: '*', modifiers: []}).should.be.true;
    done();
  });

  it('Should be false for "user" and "user:owner"', function (done) {
    roles.compareRole('user', [], {name: 'user', modifiers: ['owner']}).should.be.false;
    done();
  });

  it('Should be false for "admin" and "user:owner"', function (done) {
    roles.compareRole('admin', [], {name: 'user', modifiers: ['owner']}).should.be.false;
    done();
  });

  it('Should be false for "admin" and "*:owner"', function (done) {
    roles.compareRole('admin', [], {name: '*', modifiers: ['owner']}).should.be.false;
    done();
  });
});

describe('roles/compareRoles', function () {
  it('Should be true for "producer" and ["producer:owner", "doctor:owner"]', function (done) {
    roles.compareRoles(['producer'], ['owner'], ['*:owner', 'doctor']).should.be.true;
    done();
  });

  it('Should be true for ["user", "producer:owner"] and "*:owner"', function (done) {
    roles.compareRoles(['user', 'producer'], ['owner'], '*:owner').should.be.true;
    done();
  });

  it('Should be false for "producer" and ["producer:owner", "doctor:owner"]', function (done) {
    roles.compareRoles(['producer'], [], ['*:owner', 'doctor']).should.be.false;
    done();
  });

  it('Should be false for "producer" and ["producer:owner", "doctor:owner"]', function (done) {
    roles.compareRoles(['producer', 'user'], ['premium', 'owner'], '*:owner&premium,doctor').should.be.true;
    done();
  });

  it('Should be true for all', function (done) {
    roles.compareRoles(['producer', 'user'], ['premium', 'owner'], '*').should.be.true;
    done();
  });
});

describe('roles/parseRoleString', function () {
  it('admin,user', function (done) {
    var res = _.sortBy(roles.parseRolesString('admin, user'), 'name');
    var must = [
      {name: 'admin', modifiers: []},
      {name: 'user', modifiers: []}
    ];
    res.should.be.eql(_.sortBy(must, 'name'));
    done();
  });

  it('admin,user with spaces', function (done) {
    var res = _.sortBy(roles.parseRolesString('  admin   ,  user  '), 'name');
    var must = [
      {name: 'admin', modifiers: []},
      {name: 'user', modifiers: []}
    ];
    res.should.be.eql(_.sortBy(must, 'name'));
    done();
  });

  it('admin', function (done) {
    var res = _.sortBy(roles.parseRolesString('admin'), 'name');
    var must = [
      {name: 'admin', modifiers: []}
    ];
    res.should.be.eql(_.sortBy(must, 'name'));
    done();
  });

  it('admin with spaces', function (done) {
    var res = _.sortBy(roles.parseRolesString('   admin  '), 'name');
    var must = [
      {name: 'admin', modifiers: []}
    ];
    res.should.be.eql(_.sortBy(must, 'name'));
    done();
  });

  it('admin:owner', function (done) {
    var res = _.sortBy(roles.parseRolesString('admin:owner'), 'name');
    var must = [
      {name: 'admin', modifiers: ['owner']}
    ];
    res.should.be.eql(_.sortBy(must, 'name'));
    done();
  });

  it('producer:owner&premium', function (done) {
    var res = _.sortBy(roles.parseRolesString('producer:owner&premium'), 'name');
    var must = [
      {name: 'producer', modifiers: ['owner', 'premium']}
    ];
    res.should.be.eql(_.sortBy(must, 'name'));
    done();
  });

  it('producer:owner&premium, doctor:owner', function (done) {
    var res = _.sortBy(roles.parseRolesString('producer:owner&premium, doctor:owner'), 'name');
    var must = [
      {name: 'producer', modifiers: ['owner', 'premium']},
      {name: 'doctor', modifiers: ['owner']}
    ];
    res.should.be.eql(_.sortBy(must, 'name'));
    done();
  });

  it('[producer:owner&premium, doctor:owner]', function (done) {
    var res = _.sortBy(roles.parseRolesString(['producer:owner&premium', 'doctor:owner']), 'name');
    var must = [
      {name: 'producer', modifiers: ['owner', 'premium']},
      {name: 'doctor', modifiers: ['owner']}
    ];
    res.should.be.eql(_.sortBy(must, 'name'));
    done();
  });

  it('[producer:owner&premium, doctor:owner] with spaces', function (done) {
    var res = _.sortBy(roles.parseRolesString([' producer:owner&premium  ', '   doctor:owner  ']), 'name');
    var must = [
      {name: 'producer', modifiers: ['owner', 'premium']},
      {name: 'doctor', modifiers: ['owner']}
    ];
    res.should.be.eql(_.sortBy(must, 'name'));
    done();
  });

  it('empty string', function (done) {
    var res = _.sortBy(roles.parseRolesString(''), 'name');
    var must = [];
    res.should.be.eql(_.sortBy(must, 'name'));
    done();
  });

  it('empty string with spaces', function (done) {
    var res = _.sortBy(roles.parseRolesString('    '), 'name');
    var must = [];
    res.should.be.eql(_.sortBy(must, 'name'));
    done();
  });

  it('empty array', function (done) {
    var res = _.sortBy(roles.parseRolesString([]), 'name');
    var must = [];
    res.should.be.eql(_.sortBy(must, 'name'));
    done();
  });
});

