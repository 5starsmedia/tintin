'use strict';

var acl = require('../acl-js'),
  async = require('async'),
  _ = require('lodash'),
  mongoose = require('mongoose');

//region Helper functions

function getDataOptions(req, next) {
  var opts = {};

  if (req.resource.options.maxPerPage) {
    if (!(req.query['perPage'] && req.query['perPage'] <= req.resource.options.maxPerPage)) {
      return next(new req.app.errors.OperationError('Missing "perPage" query param'));
    }
    opts.limit = req.query['perPage'];

    if (!req.query['page']) {
      return next(new req.app.errors.OperationError('Missing "page" query param'));
    }
    opts.skip = req.query['page'] ? (req.query['page'] - 1) * opts.limit : 0;

  } else if (req.query['perPage']) {
    opts.skip = req.query['page'] ? (req.query['page'] - 1) * req.query['perPage'] : 0;
    opts.limit = req.query['perPage'];
  }

  // Parse request sorting parameters
  var sort = req.query['sort'];
  if (sort) {
    var sortArr = _.without(_.isArray(sort) ? sort : sort.replace(/ /g, '').split(','), '');
    if (sortArr.length > 0) {
      opts.sort = {};
      _.each(sortArr, function (field) {
        var direction = 1;
        if (field.indexOf('-') === 0) {
          direction = -1;
          field = field.substring(1);
        }
        opts.sort[field] = direction;
      });
    }
  }
  next(null, opts);
}

function getFilter(req, schemaFields, next) {
  var filter = {
    $and: [_.mapValues(_.pick(req.query, schemaFields), function (val) {
      if (_.isArray(val)) {
        return {$in: val};
      } else if (val === 'null') {
        return null;
      } else {
        return val;
      }
    })]
  };
  if (_.indexOf(schemaFields, 'site._id') != -1) {
    var site = {
      'site._id': req.site._id
    };
    filter.$and.push(site);
  }
  filter.$and.push({removed: {$exists: false}});
  var search = req.query['search'];
  if (search && req.resource && req.resource.options && req.resource.options.searchFields) {
    filter.$and.push({
      $or: _.map(req.resource.options.searchFields, function (field) {
        var o = {};
        o[field] = {$regex: search, $options: 'i'};
        return o;
      })
    });
  }
  next(null, filter);
}

function _deepPick(res, keyPref, obj, setKey, fields) {
  _.each(_.keys(obj), function (key) {
    var keyArr = keyPref.concat([key]);
    var setArr = setKey.concat([key]);
    var path = keyArr.join('.');
    var val = obj[key];
    var setPath = setArr.join('.');
    if (_.isArray(val)) {
      res[setPath] = [];
      _.each(val, function (item) {
        var x = {};
        res[setPath].push(x);
        _deepPick(x, keyArr, item, [], fields);
      });
    } else if (_.contains(fields, path)) {
      res[setPath] = val;
    } else if (_.isObject(val)) {
      _deepPick(res, keyArr, val, setArr, fields);
    }
  });
}

function deepPick(obj, fields) {
  if (_.isString(fields)) {
    fields = fields.split(',');
  }
  var res = {};
  _deepPick(res, [], obj, [], fields);
  return res;
}
//endregion

function processGet(model, fieldsObj, schemaFields, req, res, next) {
  var zipFields = _.mapValues(_.zipObject(fieldsObj.fields), _.constant(1));
  if (req.params._id || req.query.alias) {
    var parameter = req.params._id ? {'_id': req.params._id} : {
      'alias': req.query.alias,
      'removed': {$exists: false}
    };

    if (_.indexOf(schemaFields, 'site._id') != -1) {
      parameter['site._id'] = req.site._id;
    }
    model.findOne(parameter, zipFields, function (err, data) {
      if (err) {
        if (err.name === 'CastError') {
          return next(req.app.errors.NotFoundError('Resource "' + req.params.resource + ' ' + parameter + '" not found.'));
        } else {
          return next(err);
        }
      }
      if (data) {
        if (model.schema.paths.viewsCount) {
          model.update(parameter, {$inc: {viewsCount: 1}}, function (err) {
            if (err) {
              return req.log.error(err);
            }
          });
        }
        return res.json(data);
      } else {
        return next(req.app.errors.NotFoundError('Resource "' + req.params.resource + ' ' + parameter + '" not found.'));
      }
    });
  } else {
    var beginTime = Date.now();
    async.auto({
      count: ['filter', function (next, result) {
        if (req.query.flags && req.query.flags.indexOf('no-total-count') !== -1) {
          return next(null, -1);
        }
        var countBeginTime = Date.now();
        model.count(result.filter, function (err, data) {
          if (err) {
            return next(err);
          }
          //   res.set('x-resource-count-time', Date.now() - countBeginTime);
          next(null, data);
        });
      }],
      filter: _.partial(getFilter, req, schemaFields),
      dataOptions: _.partial(getDataOptions, req),
      items: ['filter', 'dataOptions', function (next, result) {
        var itemsBeginTime = Date.now();
        model.find(result.filter, zipFields, result.dataOptions, function (err, data) {
          if (err) {
            return next(err);
          }
          //     res.set('x-resource-items-time', Date.now() - itemsBeginTime);
          next(null, data);
        });
      }]
    }, function (err, data) {
      if (err) {
        return next(err);
      }
      //  res.set('x-resource-time', Date.now() - beginTime);
      if (data.count !== -1) {
        res.set('x-total-count', data.count);
      }
      return res.json(data.items);
    });
  }
}

function processPost(model, fieldsObj, req, res, next) {
  var bodyFields = acl.util.json.getFields(req.body);
  var updateFields = _.without(_.intersection(fieldsObj.fields, bodyFields), '__v');
  var body = deepPick(req.body, updateFields);
  req.app.services.validation.validate(req, req.params.resource + '.post', body, function (err, modelState) {
    if (err) {
      return next(err);
    }
    if (modelState.hasErrors) {
      res.status(422).json(modelState);
    } else {
      req.app.services.hooks.hookAll(req, 'post', req.params.resource, body, function (err) {
        if (err) {
          return next(err);
        }
        body._id = mongoose.Types.ObjectId();
        if (model.schema.paths['site._id']) {
          body.site = {
            _id: req.site._id,
            domain: req.site.domain
          };
        }
        body = _.pick(body, function(item) {
          return item !== null;
        });
        var item = new model(body);
        item.save(function (err, obj) {
          if (err) {
            return next(err);
          }
          req.log.info({
            refs: [
              {resourceId: obj._id, title: obj.title, collectionName: req.params.resource}
            ]
          }, 'Resource "' + req.params.resource + '" created.');

          req.app.services.mq.push(req.app, 'events', {
              name: 'db.' + req.params.resource + '.insert',
              _id: obj._id
            },
            function (err) {
              if (err) { return next(err); }

              res.status(201).json({_id: obj._id, alias: obj.alias});
            });
        });
      });
    }
  });
}

function setAndUnsetQuery(query) {
  query = {$set: query};
  for (var key in query.$set) {
    if (query.$set.hasOwnProperty(key)) {
      var value = query.$set[key];
      if (value === null) {
        delete query.$set[key];
        query.$unset = query.$unset || {};
        query.$unset[key] = '';
      }
    }
  }
  return query;
}

function processPut(model, fieldsObj, req, res, next) {
  var zipFields = _.mapValues(_.zipObject(fieldsObj.fields), _.constant(1));
  async.auto({
    resource: function (next) {
      model.findById(req.params._id, zipFields, next);
    },
    update: ['resource', function (next, data) {
      var bodyFields = acl.util.json.getFields(req.body);
      var updateFields = _.without(_.intersection(fieldsObj.fields, bodyFields), '__v');

      var body = deepPick(req.body, updateFields);
      body._id = req.params._id;

      req.app.services.validation.validate(req, req.params.resource + '.put', body, function (err, modelState) {
        if (err) {
          return next(err);
        }
        if (modelState.hasErrors) {
          res.status(422).json(modelState);
        } else {
          req.app.services.hooks.hookAll(req, 'put', req.params.resource, body, function (err) {
            if (err) {
              return next(err);
            }
            delete body._id;
            var fields = setAndUnsetQuery(_.extend(body, {'modifyDate': Date.now()}));
            
            data.resource.update(fields, next);
          });
        }
      });
    }],
    /*updateAlias: ['update', 'resource', function (next, data) {
      if (model.schema.paths['title'] && model.schema.paths['alias']) {
        req.app.services.url.aliasFor(req.app, data.resource.title, {}, function (err, alias) {
          if (err) { return next(err); }

          data.resource.update({ $set: { alias: alias } }, next);
        });
      } else {
        next();
      }
    }],*/
    eventPush: ['update', function (next) {
      req.app.services.mq.push(req.app, 'events', {
          name: 'db.' + req.params.resource + '.update',
          _id: req.params._id
        },
        next);
    }],
    log: ['update', function (next, data) {
      req.log.info({
        refs: [
          {resourceId: data.resource._id, title: data.resource.title, collectionName: req.params.resource}
        ]
      }, 'Resource "' + req.params.resource + '" changed.');
      next();
    }]
  }, function (err) {
    if (err) {
      return next(err);
    }
    res.status(204).end();
  });
}

function processDelete(model, req, res, next) {
  model.findById(req.params._id, function (err, data) {
    if (err) {
      return next(err);
    }
    data.update({'removed': Date.now()}, function (err) {
      if (err) {
        return next(err);
      }
      req.app.services.mq.push(req.app, 'events', {
          name: 'db.' + req.params.resource + '.delete',
          _id: req.params._id
        },
        function (err) {
          if (err) {
            return next(err);
          }
          res.status(204).end();
        });
    });
  });
}

module.exports = function processRequest(req, res, next) {
  req.app.services.data.getResource('resources.' + req.params.resource, function (err, resource) {
    if (err) {
      return next(err);
    }
    var aclCalcTime = Date.now();
    var modelName = resource.modelName || req.params.resource;
    var model = req.app.models[modelName];
    if (!model) {
      return next(req.app.errors.NotFoundError('Resource "' + req.params.resource + '" not found.'));
    }

    var paramFields = _.isArray(req.query['fields'])
      ? req.query['fields'] : _.without((req.query['fields']|| '').split(','), '');
    var bodyFields = _.keys(req.body);
    var reqFieldsArr = _.union(paramFields, bodyFields);
    var schemaFields = acl.util.mongoose.getFields(model.schema);
    var params = _.keys(_.omit(req.query, ['search', 'page', 'perPage', 'sort', 'fields', 'flags']));
    if (req.params._id) {
      params.push('_id');
    }

    var fieldsObj = acl.compareAcl(schemaFields, resource.acl, {
      roles: req.auth.permissions,
      modifiers: req.auth.modifiers,
      method: req.method.toLowerCase(),
      params: params,
      fields: reqFieldsArr
    });
    //  res.set('x-resource-acl-time', Date.now() - aclCalcTime);
    if (!fieldsObj.hasAccess) {
      if (req.auth.isGuest) {
        req.log.warn({reason: fieldsObj.reason}, 'Attempt of unauthorized access to resource ' + req.url);
        return res.status(401).json({
          msg: fieldsObj.reason || 'Unauthorized',
          deniedFields: fieldsObj.deniedFields
        });
      } else {
        req.log.warn({
          reason: fieldsObj.reason,
          refs: [
            {collectionName: 'accounts', title: req.auth.account.title, resourceId: req.auth.account._id}
          ]
        }, 'Attempt of restricted access to resource ' + req.url);
        return res.status(403).json({
          msg: fieldsObj.reason || 'Forbidden',
          deniedFields: fieldsObj.deniedFields,
          roles: req.auth.roles,
          modifiers: req.auth.modifiers
        });
      }
    }

    var method = req.method.toLowerCase();
    switch (method) {
      case 'get':
        processGet(model, fieldsObj, schemaFields, req, res, next);
        break;
      case 'post':
        processPost(model, fieldsObj, req, res, next);
        break;
      case 'put':
        processPut(model, fieldsObj, req, res, next);
        break;
      case 'delete':
        processDelete(model, req, res, next);
        break;
      default:
        next();
    }
  });
};
