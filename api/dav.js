"use strict";

var jsDAV = require("jsDAV");
//jsDAV.debugMode = true;
var jsDAV_Locks_Backend_FS = require("./node_modules/jsDAV/lib/DAV/plugins/locks/fs");

jsDAV.createServer({
  node: __dirname + "/../sites",
  locksBackend: jsDAV_Locks_Backend_FS.new(__dirname + "/../sites")
}, 8000);