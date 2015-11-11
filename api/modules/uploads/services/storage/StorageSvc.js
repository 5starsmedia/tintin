'use strict';

var url = require('url'),
    crypto = require('crypto'),
    fs = require('fs'),
    Grid = require('gridfs-stream'),
    mongoose = require('mongoose');


function StorageSvc(app) {
    this.app = app;
}

StorageSvc.prototype.ensureExistsFolder = function (path, mask, next) {
    if (typeof mask == 'function') {
        next = mask;
        mask = parseInt('0777', 8);
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') next(null);
            else next(err);
        } else {
            next(null);
        }
    });
};

StorageSvc.prototype.exist = function (args, next) {
    var gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.exist(args, next);
};

StorageSvc.prototype.saveToFile = function (args, filename, next) {
    var gfs = Grid(mongoose.connection.db, mongoose.mongo);
    var readstream = gfs.createReadStream(args);
    var writeStream = fs.createWriteStream(filename);
    readstream.on('end', next);
    readstream.on('error', next);
    readstream.pipe(writeStream);
};

StorageSvc.prototype.fromFile = function (args, filename, next) {
    var gfs = Grid(mongoose.connection.db, mongoose.mongo);

    var readstream = fs.createReadStream(filename);
    var writeStream = gfs.createWriteStream(args);
    readstream.on('end', next);
    readstream.on('error', next);
    readstream.pipe(writeStream);
};

module.exports = StorageSvc;
