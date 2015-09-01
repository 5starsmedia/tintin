/*
 * @package jsDAV
 * @subpackage DAV
 * @copyright Copyright(c) 2011 Ajax.org B.V. <info AT ajax DOT org>
 * @author Mike de Boer <info AT mikedeboer DOT nl>
 * @license http://github.com/mikedeboer/jsDAV/blob/master/LICENSE MIT License
 */
var davRoot = './node_modules/jsDAV/lib/DAV';

var jsDAV_Tree           = require(davRoot + "/tree").jsDAV_Tree,
  jsDAV_CouchDB_Directory = require("./mongodb/directory").jsDAV_CouchDB_Directory,
  jsDAV_CouchDB_File      = require("./mongodb/file").jsDAV_CouchDB_File,

  CouchDB              = require("cdb"),
  Async                = require("async"),
  Util                 = require("./../util"),
  Exc                  = require("./../exceptions");

/**
 * jsDAV_Tree_CouchDB
 *
 * Creates this tree
 * Supply the path you'd like to share.
 *
 * @param {String} basePath
 * @contructor
 */
function jsDAV_Tree_CouchDB(options) {
  this.basePath = (options.couchdb && options.couchdb.path) || "";
  this.db = CouchDB.new(options.couchdb.uri);
  Util.EventEmitter.DEFAULT_TIMEOUT = 10000;
}

exports.jsDAV_Tree_CouchDB = jsDAV_Tree_CouchDB;

(function() {
  /**
   * Disconnect from an open CouchDB session to not have child processes hanging
   * around in zombie mode.
   *
   * @return void
   */
  this.unmount = function() {
    delete this.db;
  };

  /**
   * Returns a new node for the given path
   *
   * @param string path
   * @return void
   */
  this.getNodeForPath = function(path, cbfstree) {
    var _self    = this;

    var _tmp = Util.splitPath(path);
    var dirname = (_tmp[0]||"").replace(/[\/]+$/,"");
    var basename = (_tmp[1]||"").replace(/[\/]/,"_");

    if(basename === 'content.json') {
      return cbfstree(null, new jsDAV_CouchDB_File(dirname, basename, _self.db, dirname));
    }

    if(basename === '_design') {
      return cbfstree(null, new jsDAV_CouchDB_Directory(dirname, basename, _self.db, dirname));
    }

    this.db.req({method:'HEAD',uri:path}, function(r) {
      if(r.error)
        return cbfstree(new Exc.jsDAV_Exception_FileNotFound());
      cbfstree(null, r.headers['accept-ranges']
        ? new jsDAV_CouchDB_File(dirname, basename, _self.db)
        : new jsDAV_CouchDB_Directory(dirname, basename, _self.db));
    });
  };

  /**
   * Copies a file or directory.
   *
   * This method must work recursively and delete the destination
   * if it exists
   *
   * @param string source
   * @param string destination
   * @return void
   */
  this.copy = function(source, destination, cbfscopy) {
    // todo
    cbfscopy('not implemented');
  };


  /**
   * Moves a file or directory recursively.
   *
   * If the destination exists, delete it first.
   *
   * @param string source
   * @param string destination
   * @return void
   */
  this.move = function(source, destination, cbfsmove) {
    // todo
    cbfsmove('not implemented');
  };
}).call(jsDAV_Tree_CouchDB.prototype = new jsDAV_Tree());