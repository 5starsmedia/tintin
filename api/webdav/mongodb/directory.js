/*
 * @package jsDAV
 * @subpackage DAV
 * @copyright Copyright(c) 2011 Ajax.org B.V. <info AT ajax DOT org>
 * @author Mike de Boer <info AT mikedeboer DOT nl>
 * @license http://github.com/mikedeboer/jsDAV/blob/master/LICENSE MIT License
 */

var jsDAV             = require("./../../jsdav"),
  jsDAV_CouchDB_Node   = require("./node").jsDAV_CouchDB_Node,
  jsDAV_CouchDB_File   = require("./file").jsDAV_CouchDB_File,
  jsDAV_Directory   = require("./../directory").jsDAV_Directory,
  jsDAV_iCollection = require("./../iCollection").jsDAV_iCollection,
  jsDAV_iQuota      = require("./../iQuota").jsDAV_iQuota,

  Exc               = require("./../exceptions"),
  Util            = require("./../util"),
  Async             = require("./../../../support/async.js");

function jsDAV_CouchDB_Directory(parent_path, name, db, uri) {
  this.parent_path = (parent_path||"").replace(/[\/]+$/,"");
  this.name = (name||"").replace(/[\/]/,"_");
  this.path = (this.parent_path+"/"+this.name).replace(/^[\/]+/,"");
  this.uri  = uri || this.path;
  this.db = db;
}

exports.jsDAV_CouchDB_Directory = jsDAV_CouchDB_Directory;

(function() {
  this.implement(jsDAV_Directory, jsDAV_iCollection, jsDAV_iQuota);

  /**
   * Creates a new file in the directory
   *
   * data is a readable stream resource
   *
   * @param string name Name of the file
   * @param resource data Initial payload
   * @return void
   */
  this.createFile = function(name, data, enc, cbfscreatefile) {
    var newPath = this.path + "/" + name;
    // this.db.writeFile(newPath, data, enc || "utf8", cbfscreatefile);
  };

  /**
   * Creates a new subdirectory
   *
   * @param string name
   * @return void
   */
  this.createDirectory = function(name, cbfscreatedir) {
    var newPath = this.path + "/" + name;
    // this.db.mkdir(newPath, 0755, cbfscreatedir);
  };

  /**
   * Returns a specific child node, referenced by its name
   *
   * @param string name
   * @throws Sabre_DAV_Exception_FileNotFound
   * @return Sabre_DAV_INode
   */
  this.getChild = function(name, cbfsgetchild) {
    var _self = this;

    if(name === 'content.json')
      return cbfsgetchild( new jsDAV_CouchDB_File( _self.path, name, db, _self.uri ));

    if(name === '_design')
      return cbfsgetchild( new jsDAV_CouchDB_File( _self.path, name, db, _self.uri ));

    this.db.req({method:'HEAD',uri:(_self.uri+"/"+name).replace(/^[\/]+/,"")}, function(r) {
      if (r.error) {
        return cbfsgetchild(new Exc.jsDAV_Exception_FileNotFound());
      }
      cbfsgetchild(null, r.headers['accept-ranges']
        ? new jsDAV_CouchDB_File(_self.path, name, _self.db)
        : new jsDAV_CouchDB_Directory(_self.path, name, _self.db));
    });
  };

  /**
   * Returns an array with all the child nodes
   *
   * @return Sabre_DAV_INode[]
   */
  this.getChildren = function(cbfsgetchildren) {
    var nodes = [],
      _self = this;

    if(_self.name === '_design') {
      _self.db.req({uri:(_self.uri+'/_all_docs').replace(/^[\/]+/,"")}, function(t) {
        if(t.rows) {
          nodes = t.rows.filter(function(node){ return node.id.match(/^_design/) }).map( function(node) {
            return new jsDAV_CouchDB_Directory(_self.path, node.id.replace(/^_design\//,""), _self.db);
          });
          cbfsgetchildren(null, nodes);
        }
      });
    }


    /* Get the HEAD first */
    this.db.req({method:'HEAD',uri:_self.uri},function(q){
      if(q.error) {
        cbfsgetchildren(null, nodes);
        return;
      }

      if(q.headers['accept-ranges']) { /* attachment, should not be here */
        cbfsgetchildren(null, nodes);
        return;
      }

      if(q.headers.etag) {

        /* Might be a document */
        _self.db.req({uri:_self.uri}, function(s) {

          if(s._attachments) {
            nodes = Object.keys(s._attachments).map( function(node) {
              return new jsDAV_CouchDB_File(_self.path, node, _self.db)
            });
          }
          nodes.push( new jsDAV_CouchDB_File(_self.path,"content.json", _self.db, _self.uri) );
          cbfsgetchildren(null, nodes);

        });

      } else {

        /* Might be a database or a view, attempt _all_docs */
        _self.db.req({uri:(_self.uri+'/_all_docs').replace(/^[\/]+/,"")}, function(t) {
          if(t.rows) {
            nodes = t.rows.filter(function(node){return !node.id.match(/^_design/)}).map( function(node) {
              return new jsDAV_CouchDB_Directory(_self.path, node.id, _self.db);
            });
            nodes.push( new jsDAV_CouchDB_Directory(_self.path, '_design', _self.db, _self.uri) );
            cbfsgetchildren(null, nodes);
          } else {

            /* Might be a server, attempt _all_dbs */
            _self.db.req({uri:(_self.uri+'/_all_dbs').replace(/^[\/]+/,"")}, function(t) {

              if(typeof t.error === 'undefined') {
                nodes = t.map( function(node) {
                  return new jsDAV_CouchDB_Directory(_self.path, node, _self.db);
                });
              }
              cbfsgetchildren(null, nodes);
            });
          }
        });

      }
    });
  };

  /**
   * Deletes all files in this directory, and then itself
   *
   * @return void
   */
  this["delete"] = function(cbfsdel) {
    // TODO : get the current record first (to get _rev) -- not need for attachments though
    this.db.req({method:'DELETE',uri:this.uri}, cbfsdel);
  };

  /**
   * Returns available diskspace information
   *
   * @return array
   */
  this.getQuotaInfo = function(cbfsquota) {
    // @todo: impl. db.statvfs();
    return cbfsquota(null, [0, 0]);
  };
}).call(jsDAV_CouchDB_Directory.prototype = new jsDAV_CouchDB_Node());