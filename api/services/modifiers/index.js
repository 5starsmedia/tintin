'use strict';

var path = require('path'),
    _ = require('lodash'),
    async = require('async');

function mkPath(method, resource, params) {
    return method.toLowerCase() + '/' + resource + (params.length > 0 ? '?' + params.join('&') : '');
}

var plugins = [];

function parsePath(path) {
    var slashIdx = path.indexOf('/');
    var queryIdx = path.indexOf('?');
    var method = path.substr(0, slashIdx).toLowerCase();
    var resource;
    var params = [];
    if (queryIdx === -1) {
        resource = path.substring(slashIdx + 1, path.length);
    } else {
        resource = path.substring(slashIdx + 1, queryIdx);
        params = path.substring(queryIdx + 1, path.length).split('&').sort();
    }
    return {method: method, resource: resource, params: params, path: mkPath(method, resource, params)};
}

exports.loadPlugins = function (app, cb) {
    app.log.info('Loading access modifiers plugins started...');
    async.auto({
        fileList: function (next) {
            plugins = [];
            app.services.data.dirWalk(path.join(__dirname, 'plugins'), next);
        },
        readFiles: ['fileList', function (next, res) {
            async.each(res.fileList, function (filePath, next) {
                app.log.debug('Loading plugins from file', filePath);
                var plugin = require(filePath);
                _.transform(plugin, function (result, value, key) {
                    var parsedPath = parsePath(key);
                    parsedPath.fn = value;
                    plugins.push(parsedPath);
                });
                next();
            }, next);
        }]
    }, function (err) {
        if (err) {
            return cb(err);
        }
        app.log.info('Access modifiers plugins loaded successfully - ', _.size(plugins));
        cb();
    });
};

/**
 * @param {object} req
 * @param {string} method
 * @param {string} resource
 * @param {object} query
 * @param {object} params
 * @param {function} cb
 */
exports.getModifiers = function (req, method, resource, query, params, cb) {
    var commonPlugins = [];
    var innerPlugins = [];
    if (query._id || query.alias) {
        var commonPath = mkPath(method, '*', [query._id ? '_id' : 'alias']);
        commonPlugins.push(_.flatten(_.where(plugins, {path: commonPath})));
    }
    var pluginPath = mkPath(method, resource, _.keys(query).sort());
    innerPlugins.push(_.flatten(_.where(plugins, {path: pluginPath})));
    async.parallel([
        function (callback) {
            async.map(_.flatten(commonPlugins), function (plugin, next) {
                plugin.fn(req, resource, params, next);
            }, function (err, res) {
                if (err) {
                    return callback(err);
                }
                callback(null, _.uniq(_.flatten(res)));
            });
        },
        function (callback) {
            async.map(_.flatten(innerPlugins), function (plugin, next) {
                plugin.fn(req, params, next);
            }, function (err, res) {
                if (err) {
                    return callback(err);
                }
                callback(null, _.uniq(_.flatten(res)));
            });
        }
    ], function (err, results) {
        if (err) {
            return cb(err);
        }
        //console.log(method, resource, _.keys(query).sort(), _.uniq(_.flatten(results)));
        cb(null, _.uniq(_.flatten(results)));
    });
};
