/*
 * @package jsDAV
 * @subpackage DAV
 * @copyright Copyright(c) 2011 Ajax.org B.V. <info AT ajax DOT org>
 * @author Mike de Boer <info AT mikedeboer DOT nl>
 * @license http://github.com/mikedeboer/jsDAV/blob/master/LICENSE MIT License
 */

var jsDAV           = require("./../../jsdav"),
  jsDAV_CouchDB_Node = require("./node").jsDAV_CouchDB_Node,
  jsDAV_Directory = require("./../directory").jsDAV_Directory,
  jsDAV_iFile     = require("./../iFile").jsDAV_iFile,

  Exc             = require("./../exceptions"),
  Util            = require("./../util");

var request = require("request");

function jsDAV_CouchDB_File(parent_path, name, db, uri) {
  this.parent_path = (parent_path||"").replace(/[\/]+$/,"");
  this.name = (name||"").replace(/[\/]/,"_");
  this.path = (this.parent_path+"/"+this.name).replace(/^[\/]+/,"");
  this.uri  = uri || this.path;
  this.db = db;
}

exports.jsDAV_CouchDB_File = jsDAV_CouchDB_File;

(function() {
  this.implement(jsDAV_iFile);

  /**
   * Updates the data
   *
   * @param {mixed} data
   * @return void
   */
  this.put = function(data, type, cbfsput) {
    /*
     this.db.writeFile(this.path, data, type || "utf8", cbfsput);
     */
    cbfsput('not implemented yet');
  };

  /**
   * Returns the data
   *
   * @return Buffer
   */
  this.get = function(cbfsfileget) {
    var _self  = this;
    request({uri:this.db.db_uri+'/'+this.uri}, function(error,response,body) {
      if (error)
        return cbfsfileget(error);
      // Zero length buffers act funny, use a string
      if (body.length === 0)
        body = "";
      cbfsfileget(null, body);
    });
  };

  /**
   * Delete the current file
   *
   * @return void
   */
  this["delete"] = function(cbfsfiledel) {
    var _self = this;
    this.db.req({method:'DELETE',uri:this.uri}, function(r) {
      cbfsfiledel(r.error);
    });
  };

  /**
   * Returns the size of the node, in bytes
   *
   * @return int
   */
  this.getSize = function(cbfsgetsize) {
    var _self = this;
    this.db.req({method:'HEAD',uri:this.uri}, function(r) {
      if (r.error || typeof r.headers['content-length'] === 'undefined') {
        return cbfsgetsize(new Exc.jsDAV_Exception_FileNotFound());
      }
      cbfsgetsize(null, parseInt(r.headers['content-length']) );
    });
  };

  /**
   * Returns the ETag for a file
   * An ETag is a unique identifier representing the current version of the file.
   * If the file changes, the ETag MUST change.
   * Return null if the ETag can not effectively be determined
   *
   * @return mixed
   */
  this.getETag = function(cbfsgetetag) {
    var _self = this;
    this.db.req({method:'HEAD',uri:this.uri}, function(r) {
      if (r.error || typeof r.headers.etag === 'undefined') {
        return cbfsgetetag(new Exc.jsDAV_Exception_FileNotFound());
      }
      cbfsgetetag(null, r.headers.etag);
    });
  };

  /**
   * Returns the mime-type for a file
   * If null is returned, we'll assume application/octet-stream
   *
   * @return mixed
   */
  this.getContentType = function(cbfsmime) {
    var _self = this;
    this.db.req({method:'HEAD',uri:this.uri}, function(r) {
      if (r.error || typeof r.headers['content-type'] === 'undefined') {
        return cbfsmime(new Exc.jsDAV_Exception_FileNotFound());
      }
      return cbfsmime(null, r.headers['content-type'] );
    });
  };
}).call(jsDAV_CouchDB_File.prototype = new jsDAV_CouchDB_Node());