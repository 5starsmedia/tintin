/**
 * Mongoose utils tests
 * @module test/util/mongoose
 * @copyright 2014 Cannasos.com. All rights reserved.
 * @license GPL V2 (https://github.com/cannasos/acl-js/blob/master/LICENSE)
 */

'use strict';
var acl = require('../../lib/index.js');
var mongoose = require('mongoose');

describe('util/mongoose/propsFromSchema', function () {
  it('Parse simple model', function (done) {
    var props = acl.util.mongoose.getFields(new mongoose.Schema({
      name: String,
      title: String
    })).sort();
    var must = ['_id', 'name', 'title'].sort();
    props.should.be.eql(must);
    done();
  });

  it('Parse complex model', function (done) {
    var props = acl.util.mongoose.getFields(new mongoose.Schema({
      name: String,
      title: String,
      account: {
        name: String,
        _id: String
      },
      profile: {
        name: String
      }
    })).sort();
    var must = [ '_id', 'account._id', 'account.name', 'name', 'profile.name', 'title' ].sort();
    props.should.be.eql(must);
    done();
  });

  it('Parse model with array', function (done) {
    var props = acl.util.mongoose.getFields(new mongoose.Schema({
      name: String,
      title: String,
      accounts: [{
        name: String,
        _id: String
      }],
      profile: {
        name: String
      }
    })).sort();
    var must = [ '_id', 'accounts._id', 'accounts.name', 'name', 'profile.name', 'title' ].sort();
    props.should.be.eql(must);
    done();
  });
});
