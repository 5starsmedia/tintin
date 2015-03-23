/**
 * @name files
 * @module routes.files
 * @copyright 2014 Cannasos.com. All rights reserved.
 */

'use strict';

var path = require('path'),
  util = require('util'),
  fs = require('fs'),
  express = require('express'),
  mongoose = require('mongoose'),
  router = express.Router(),
  tmp = require('tmp'),
  imageSize = require('image-size'),
  gm = require('gm');

function getBuffer(req, file, cb) {
  var grid = new mongoose.mongo.Grid(mongoose.connection.db, 'fs');
  grid.get(new mongoose.Types.ObjectId(file.storageId), function (err, data) {
    if (err) { return cb(err); }
    cb(null, data);
  });
}

function watermark(req, buf, cb) {
  tmp.file({postfix: '.jpg'}, function (err, srcPath, srcFd, cleanSrcTmp) {
    if (err) { return cb(err); }
    tmp.file({postfix: '.jpg'}, function (err, destPath, destFd, cleanDestTmp) {
      if (err) { return cb(err); }
      fs.writeFile(srcPath, buf, function (err) {
        if (err) { return cb(err); }
        // composite -dissolve 15 -tile logo.png
        imageSize(srcPath, function (err, size) {
          if (err) { return cb(err); }
          if (size.width < 400 || size.height < 400) {
            cleanSrcTmp();
            cleanDestTmp();
            cb(null, buf);
          }
          var exec = require('child_process').exec;
          var command = [
            'gm',
            'composite',
            '-compose over',
            '-geometry +20+20',
            '-gravity SouthEast',
            path.resolve(__dirname, 'logo.png'),
            srcPath, //input
            destPath  //output
          ];
          // making watermark through exec - child_process
          exec(command.join(' '), function (err) {
            if (err) { return cb(err); }
            fs.readFile(destPath, function (err, res) {
              cleanSrcTmp();
              cleanDestTmp();
              cb(null, res);
            });
          });
        });
      });
    });
  });
}

function resize(req, buf, width, height, cb) {
  tmp.file({postfix: '.jpg'}, function (err, srcPath, srcFd, cleanSrcTmp) {
    if (err) { return cb(err); }
    tmp.file({postfix: '.jpg'}, function (err, destPath, destFd, cleanDestTmp) {
      if (err) { return cb(err); }
      fs.writeFile(srcPath, buf, function (err) {
        if (err) { return cb(err); }
        var resize;
        if (height) {
          resize = gm(srcPath).resize(width, height, '^').gravity('Center').crop(width, height);
        } else {
          resize = gm(srcPath).resize(width);
        }
        resize.interlace('plane').write(destPath, function (err) {
          if (err) { return cb(err); }
          fs.readFile(destPath, function (err, res) {
            cleanSrcTmp();
            cleanDestTmp();
            fs.close(srcFd);
            fs.close(destFd);
            cb(null, res);
          });
        });
      });
    });
  });
}

router.get('/:_id/meta', function (req, res, next) {
  var fields = 'isImage width height viewsCount sharesCount likesCount account.title collectionName resourceId';
  req.app.models.files.findById(req.params._id, fields, function (err, file) {
    if (err) { return next(err); }
    if (!file) {
      return next(new req.app.errors.NotFoundError(util.format('File with _id "%s" not found.', req.params._id)));
    }
    res.json(file);
  });
});

router.get('/:_id', function (req, res, next) {
  req.app.models.files.findById(req.params._id, function (err, file) {
    if (err) { return next(err); }
    if (!file) {
      return next(new req.app.errors.NotFoundError(util.format('File with _id "%s" not found.', req.params._id)));
    }
    getBuffer(req, file, function (err, buf) {
      if (err) { return next(err); }
      res.setHeader('content-type', file.contentType);
      res.attachment(file.originalName);
      req.app.models.files.update({_id: req.params._id}, {$inc: {viewsCount: 1}}, function (err) {
        if (err) { return req.log.error(err); }
      });
      if (req.query.width || req.query.height) {
        resize(req, buf, req.query.width, req.query.height, function (err, resBuf) {
          if (err) { return next(err); }
          res.send(resBuf);
        });
      } else {
        res.send(buf);
      }
    });
  });
});

module.exports = router;
