/**
 * Json utils tests
 * @module test/util/json
 * @copyright 2014 Cannasos.com. All rights reserved.
 * @license GPL V2 (https://github.com/cannasos/acl-js/blob/master/LICENSE)
 */

'use strict';
var jsonUtil = require('../../lib/util/json.js');

describe('util/json/getFields', function () {
  it('Parse simple model', function (done) {
    var props = jsonUtil.getFields({
      name: 10,
      title: 'test'
    }).sort();
    var must = ['name', 'title'].sort();
    props.should.be.eql(must);
    done();
  });

  it('Parse complex model', function (done) {
    var props = jsonUtil.getFields({
      name: 'name',
      title: 'title',
      account: {
        name: 'name',
        _id: '_id'
      },
      profile: {
        name: 'name'
      }
    }).sort();
    var must = [ 'account._id', 'account.name', 'name', 'profile.name', 'title' ].sort();
    props.should.be.eql(must);
    done();
  });

  it('Parse model with array', function (done) {
    var props = jsonUtil.getFields({
      name: 'name',
      title: 'title',
      accounts: [
        {
          name: 'name',
          _id: '_id'
        }
      ],
      profile: {
        name: 'name'
      }
    }).sort();
    var must = ['accounts._id', 'accounts.name', 'name', 'profile.name', 'title' ].sort();
    props.should.be.eql(must);
    done();
  });

  it('Parse model with two items in array', function (done) {
    var props = jsonUtil.getFields({
      name: 'name',
      title: 'title',
      accounts: [
        {
          name: 'name',
          _id: '_id'
        },
        {
          name: 'name',
          _id: '_id',
          title: 'title'
        }
      ],
      profile: {
        name: 'name'
      }
    }).sort();
    var must = ['accounts._id', 'accounts.name', 'accounts.title', 'name', 'profile.name', 'title' ].sort();
    props.should.be.eql(must);
    done();
  });

  it('Parse model with deep item array', function (done) {
    var props = jsonUtil.getFields({
      name: 'name',
      title: 'title',
      accounts: [
        {
          name: 'name',
          _id: '_id',
          deep: {
            x: 1,
            y: '2'
          }
        }
      ],
      profile: {
        name: 'name'
      }
    }).sort();
    var must = ['accounts._id', 'accounts.name', 'accounts.deep.x',
      'accounts.deep.y', 'name', 'profile.name', 'title' ].sort();
    props.should.be.eql(must);
    done();
  });

  it('Parse model with nested array', function (done) {
    var props = jsonUtil.getFields({
      name: 'name',
      title: 'title',
      accounts: [
        {
          name: 'name',
          _id: '_id',
          nested: [
            {
              x: 1,
              y: '2'
            }
          ]
        }
      ],
      profile: {
        name: 'name'
      }
    }).sort();
    var must = ['accounts._id', 'accounts.name', 'accounts.nested.x',
      'accounts.nested.y', 'name', 'profile.name', 'title' ].sort();
    props.should.be.eql(must);
    done();
  });
});
