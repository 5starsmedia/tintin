/*
 * @package jsDAV
 * @subpackage DAV
 * @copyright Copyright(c) 2011 Ajax.org B.V. <info AT ajax DOT org>
 * @author Mike de Boer <info AT mikedeboer DOT nl>
 * @license http://github.com/mikedeboer/jsDAV/blob/master/LICENSE MIT License
 */

var jsDAV       = require("./../../jsdav"),
  jsDAV_iNode = require("./../iNode").jsDAV_iNode,

  Util        = require("./../util"),
  Exc         = require("./../exceptions");

function jsDAV_CouchDB_Node(parent_path, name, db, uri) {
  this.parent_path = (parent_path||"").replace(/[\/]+$/,"");
  this.name = (name||"").replace(/[\/]/,"_");
  this.path = (this.parent_path+"/"+this.name).replace(/^[\/]+/,"");
  this.uri  = uri || this.path;
  this.db = db;
}

exports.jsDAV_CouchDB_Node = jsDAV_CouchDB_Node;

(function() {
  /**
   * Returns the name of the node
   *
   * @return {string}
   */
  this.getName = function() {
    return this.name;
  };

  /**
   * Renames the node
   *
   * @param {string} name The new name
   * @return void
   */
  this.setName = function(name, cbfssetname) {
    cbfssetname("Not implemented");
  };

  /**
   * Returns the last modification time, as a unix timestamp
   *
   * @return {Number}
   */
  this.getLastModified = function(cbfsgetlm) {
    cbfsgetlm(null, 0);
  };

  /**
   * Returns whether a node exists or not
   *
   * @return {Boolean}
   */
  this.exists = function(cbfsexist) {
    if(this.name === '_design')
      cbfsexist(true);

    this.db.req({method:'HEAD',uri:this.uri}, function(r) {
      cbfsexist(Boolean(!r.error))
    });
  };
}).call(jsDAV_CouchDB_Node.prototype = new jsDAV_iNode());