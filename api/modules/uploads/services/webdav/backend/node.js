/*
 * @package jsDAV
 * @subpackage DAV
 * @copyright Copyright(c) 2011 Ajax.org B.V. <info AT ajax DOT org>
 * @author Mike de Boer <info AT mikedeboer DOT nl>
 * @license http://github.com/mikedeboer/jsDAV/blob/master/LICENSE MIT License
 */
"use strict";

var jsDAV_iNode = require("jsDAV/lib/DAV/interfaces/iNode");

var Fs = require("fs");
var Util = require("jsDAV/lib/shared/util");

var jsDAV_Mongo_Node = module.exports = jsDAV_iNode.extend({
    initialize: function(path, app) {
        this.path = path;
        this.app = app;
    },

    /**
     * Returns the name of the node
     *
     * @return {string}
     */
    getName: function() {
        return Util.splitPath(this.path)[1];
    },

    /**
     * Renames the node
     *
     * @param {string} name The new name
     * @return void
     */
    setName: function(name, cbfssetname) {
        var parentPath = Util.splitPath(this.path)[0];
        var newName    = Util.splitPath(name)[1];

        var newPath = parentPath + "/" + newName;
        var self = this;
        Fs.rename(this.path, newPath, function(err) {
            if (err)
                return cbfssetname(err);
            self.path = newPath;
            cbfssetname();
        });
    }
});
