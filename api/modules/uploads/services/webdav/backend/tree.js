/*
 * @package jsDAV
 * @subpackage DAV
 * @copyright Copyright(c) 2011 Ajax.org B.V. <info AT ajax DOT org>
 * @author Mike de Boer <info AT mikedeboer DOT nl>
 * @license http://github.com/mikedeboer/jsDAV/blob/master/LICENSE MIT License
 */
"use strict";

var jsDAV_Tree = require("jsDAV/lib/DAV/tree");
var mongoDirectory = require("./directory");
var mongoFile = require("./file");

var Fs = require("fs");
var mongoose = require("mongoose");
var Util = require("jsDAV/lib/shared/util");
var Exc = require("jsDAV/lib/shared/exceptions");

function escapeRegExp(string){
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

/**
 * jsDAV_Tree_Filesystem
 *
 * Creates this tree
 * Supply the path you'd like to share.
 *
 * @param {String} basePath
 * @contructor
 */
var jsDAV_Tree_MongoDB = module.exports = jsDAV_Tree.extend({
    basePath: '',

    initialize: function(req) {
        this.req = req;
        this.app = req.app;
    },

    getFileNameForMongo: function(path) {
        return Util.trim(this.req.site.domain + '/' + path);
    },

    getFolderNameForMongo: function(path) {
        path = this.getFileNameForMongo(path);
        return "^" + escapeRegExp(path) + '/?[^/]*(/.empty)?$';
    },

    /**
     * Returns a new node for the given path
     *
     * @param {String} path
     * @return void
     */
    getNodeForPath: function(path, next) {
        var self = this;
        var realPath = this.getRealPath(path);
        var nicePath = this.stripSandbox(realPath);
        if (!this.insideSandbox(realPath))
            return next(new Exc.Forbidden("You are not allowed to access " + nicePath));

        realPath = realPath.substring(1);

        var isDirectory = realPath == '' || realPath.substring(realPath.length - 1, 1) == '/';

        mongoose.connection.db.collection('fs.files')
          .find({ filename: self.getFileNameForMongo(realPath) })
          .toArray(function(err, files) {
              if (err) { return next(err); }
              if (files.length) {
                  return next(null, mongoFile.new(self, files[0]));
              }

              mongoose.connection.db.collection('fs.files')
                .find({ filename: { $regex: self.getFolderNameForMongo(realPath) } })
                .count(function(err, length) {
                    if (err) { return next(err); }
                    if (!length) {
                        if (realPath == '') {
                            return next(null, mongoDirectory.new(self, realPath));
                        }
                        return next(new Exc.FileNotFound("File at location " + nicePath + " not found"));
                    }
                    next(null, mongoDirectory.new(self, realPath));
                });
          });

    },

    /**
     * Returns the real filesystem path for a webdav url.
     *
     * @param {String} publicPath
     * @return string
     */
    getRealPath: function(publicPath) {
        return '/' + Util.trim(publicPath, "/");
    },

    /**
     * Copies a file or directory.
     *
     * This method must work recursively and delete the destination
     * if it exists
     *
     * @param {String} source
     * @param {String} destination
     * @return void
     */
    copy: function(source, destination, cbfscopy) {
        source      = this.getRealPath(source);
        destination = this.getRealPath(destination);

        console.info('===> COPY');

        this.realCopy(source, destination, cbfscopy);
    },

    /**
     * Used by self::copy
     *
     * @param {String} source
     * @param {String} destination
     * @return void
     */
    realCopy: function(source, destination, cbfsrcopy) {
        if (!this.insideSandbox(destination)) {
            return cbfsrcopy(new Exc.Forbidden("You are not allowed to copy to " +
                this.stripSandbox(destination)));
        }

        Fs.stat(source, function(err, stat) {
            if (!Util.empty(err))
                return cbfsrcopy(err);
            if (stat.isFile())
                Async.copyfile(source, destination, true, cbfsrcopy);
            else
                Async.copytree(source, destination, cbfsrcopy);
        });
    },

    /**
     * Moves a file or directory recursively.
     *
     * If the destination exists, delete it first.
     *
     * @param {String} source
     * @param {String} destination
     * @return void
     */
    move: function(source, destination, cbfsmove) {
        source      = this.getRealPath(source);
        destination = this.getRealPath(destination);
        console.info('===> MOVE');
        if (!this.insideSandbox(destination)) {
            return cbfsmove(new Exc.Forbidden("You are not allowed to move to " +
                this.stripSandbox(destination)));
        }
        Fs.rename(source, destination, function(err) {
            cbfsmove(err, source, destination);
        });
    }
});
