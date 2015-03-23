/**
 * Copyright 2015 5starsmedia.com.ua
 */
'use strict';

var async = require('async'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    version = require('../models/core/version.js');

function getVersionInt(str) {
    var versionParts = str.split('.');
    if (versionParts.length > 3) {
        versionParts = _.first(versionParts, 3);
    }
    while (versionParts.length < 3) {
        versionParts.push('0');
    }
    versionParts = _.map(versionParts, function (c) {
        return parseInt(c, 10);
    });
    return versionParts[0] * 65536 + versionParts[1] * 256 + versionParts[2];
}

function getVersion(cb) {
    version.find({}, 'version', {sort: {version: -1}, limit: 1}, function (err, versions) {
        if (err) {
            return cb(err);
        }
        if (versions.length === 0) {
            version.create({version: '0.0.0', description: 'Clean database'}, function (err, version) {
                if (err) {
                    return cb(err);
                }
                return cb(null, version.version);
            });
        } else {
            return cb(null, versions[0].version);
        }
    });
}

function getMigrations(cb) {
    async.waterfall([
        function (next) {
            fs.readdir(__dirname, next);
        },
        function (res, next) {
            var names = _.map(res, function (name) {
                return path.join(__dirname, name, 'index.js');
            });
            async.filter(names, fs.exists, _.partial(next, null));
        },
        function (names, next) {
            async.map(names, function (name, nxt) {
                var migration = require(name);
                if (!_.isFunction(migration.migrate)) {
                    return nxt(new Error('Migration module "' + name + '" doesn\'t contain function "migrate".'));
                }
                if (!_.isFunction(migration.getInfo)) {
                    return nxt(new Error('Migration module "' + name + '" doesn\'t contain function "getInfo".'));
                }
                migration.getInfo(function (err, info) {
                    if (err) {
                        return nxt(err);
                    }
                    return nxt(null, {
                        version: info.version,
                        intVersion: getVersionInt(info.version),
                        requiredVersion: info.requiredVersion,
                        migrate: migration.migrate
                    });
                });
            }, next);
        }
    ], cb);
}

function buildMigrationPath(app, data, cb) {
    var build = function (path) {
        var last = _.last(path);
        if (last.version !== data.version) {
            var prevVersion = _.find(data.migrations, {version: last.requiredVersion});
            if (prevVersion && prevVersion.version !== data.version) {
                path.push(prevVersion);
                build(path);
            }
        }
        return path;
    };
    var maxMigration = _.max(data.migrations, 'intVersion');
    if (maxMigration.version === data.version) {
        app.log.info('Database version is actual (' + data.version + ')');
        return cb(null, []);
    }
    app.log.info('Building migration path from current version (' + data.version + ') to latest (' + maxMigration.version + ')...');
    var path = build([maxMigration]).reverse();
    app.log.info('Migration path: ' + data.version + ' -> ' + _.pluck(path, 'version').join(' -> '));
    return cb(null, path);
}

exports.migrateToActual = function (app, cb) {
    async.waterfall([
        _.partial(async.parallel, {version: getVersion, migrations: getMigrations}),
        _.partial(buildMigrationPath, app),
        function (path, next) {
            async.eachSeries(path, function (item, nxt) {
                app.log.info('Migration to version', item.version, 'started...');
                item.migrate(app, function (err) {
                    if (err) {
                        return nxt(err);
                    }
                    version.create({version: item.version}, nxt);
                    app.log.info('Migration to version', item.version, 'successfully complete');
                });
            }, next);
        }
    ], cb);
};
