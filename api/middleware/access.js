'use strict';

var _ = require('lodash');
var acl = require('../acl-js');

module.exports = function () {
    return function (req, res, next) {
        var query = _.extend(_.clone(req.query), req.params);
        query = _.omit(query, ['resource', 'search', 'page', 'perPage', 'sort', 'fields']);
        var params = _.extend(_.clone(query), req.body);
        req.app.services.modifiers.getModifiers(req, req.method, req.params.resource, query, params,
            function (err, modifiers) {
                if (err) {
                    return next(err);
                }
                req.auth.modifiers = modifiers;
                req.app.services.data.getResource('resources.' + req.params.resource, function (err, res) {
                    if (err) {
                        return next(err);
                    }
                    var opts = res.options;
                    if (opts) {
                        req.resource = req.resource || {};
                        req.resource.options = acl.getOptions(opts, {roles: req.auth.roles, modifiers: modifiers});
                    } else {
                        req.log.warn('Resource resources.' + req.params.resource + ' doesn\'t contains options');
                    }
                    next();
                });
            });
    };
};
