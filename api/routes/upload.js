/**
 * @copyright 2014 Cannasos.com
 */
'use strict';

var express = require('express'),
  async = require('async'),
  _ = require('lodash'),
  path = require('path'),
  fs = require('fs'),
  mongoose = require('mongoose'),
  imageSize = require('image-size');
var gm = require('gm');
var tmp = require('tmp');
var mime = require('mime');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var router = express.Router();
var Grid = mongoose.mongo.Grid;

var uploadsFolder = path.resolve(__dirname, '..', '..', 'uploads');

function removeExtension(filename){
  var lastDotPosition = filename.lastIndexOf(".");
  if (lastDotPosition === -1) return filename;
  else return filename.substr(0, lastDotPosition);
}

fs.exists(uploadsFolder, function (exists) {
  if (!exists) {
    fs.mkdir(uploadsFolder, function (err) {
      if (err) { return console.error(err); }
    });
  }
});

var allowedCollections = ['products', 'posts', 'accounts', 'groups', 'productBrands'];
var maxFileSize = 10 * 1024 * 1024;

function assignFile(req, file, collectionName, resourceId, cb) {
  req.app.models[collectionName].findById(resourceId, function (err, resource) {
    if (!resource.files) {
      resource.files = [];
    }
    resource.files.push({_id: file._id, title: file.title});
    if (!resource.coverFile || !resource.coverFile._id) {
      resource.coverFile = {_id: file._id, title: file.title};
    }
    resource.save(function (err) {
      if (err) { return cb(err); }
      req.app.services.mq.push(req.app, 'events', {name: 'db.' + collectionName + '.update', _id: resourceId}, cb);
    });
  });
}

function updateRefs(req, file, collectionName, resourceId, cb) {
  var title;
  var refs = [
    {
      collectionName: collectionName,
      resourceId: resourceId,
      title: title
    },
    {
      collectionName: 'accounts',
      resourceId: req.auth.account._id,
      title: title
    }
  ];
  async.auto({
    'checkCollections': function (next) {
      if (collectionName === 'strainReviews') {
        req.app.models.strainReviews.findById(resourceId, 'strain', function (err, strainReview) {
          if (err) { return next(err); }
          refs[0].title = strainReview.strain.title + ' review';
          refs.push({
            collectionName: 'strains',
            resourceId: strainReview.strain._id,
            title: strainReview.strain.title
          });
          next();
        });
      } else {
        next();
      }
    },
    'save': ['checkCollections', function (next) {
      req.app.models.files.update({_id: file._id}, {
        $set: {
          refs: refs
        }
      }, next);
    }]
  }, cb);
}

var toGridFSqueue = async.queue(function toGridFS(task, cb) {
  var req = task.req;
  var file = task.file;
  var resizeCondition = function (dim) {
    return dim.width > 1000 || dim.height > 1000;
  };
  async.auto({
    'chunks': function (next) {
      req.app.models.fileChunks.find({'file._id': file._id}, {}, {sort: {'chunkNumber': 1}}, next);
    },
    'originalBuffer': ['chunks', function (next, data) {
      next(null, Buffer.concat(_.pluck(data.chunks, 'data')));
    }],
    'originalDimensions': ['originalBuffer', function (next, data) {
      next(null, imageSize(data.originalBuffer));
    }],
    'resultBuffer': ['originalBuffer', 'originalDimensions', function (next, data) {
      if (resizeCondition(data.originalDimensions)) {
        tmp.file({postfix: '.jpg'}, function (err, sourcePath, fd, removeSourceTmpFn) {
          if (err) { return next(err); }
          tmp.file({postfix: '.jpg'}, function (err, destinationPath, fd, removeDestinationTmpFn) {
            if (err) { return next(err); }
            fs.writeFile(sourcePath, data.originalBuffer, function (err) {
              if (err) { return next(err); }
              gm(sourcePath).interlace('plane').resize(1000, 1000).write(destinationPath, function (err) {
                if (err) { return next(err); }
                fs.readFile(destinationPath, function (err, res) {
                  removeSourceTmpFn();
                  removeDestinationTmpFn();
                  next(null, res);
                });
              });
            });
          });
        });
      } else {
        next(null, data.originalBuffer);
      }
    }],
    'resultDimensions': ['resultBuffer', 'originalDimensions', function (next, data) {
      if (resizeCondition(data.originalDimensions)) {
        var dim = imageSize(data.resultBuffer);
        next(null, dim);
      } else {
        next(null, data.originalDimensions);
      }
    }],
    toGridFS: ['resultBuffer', 'resultDimensions', function (next, data) {
      var grid = new Grid(mongoose.connection.db, 'fs');
      grid.put(data.resultBuffer, {
        'content_type': mime.lookup(file.originalName),
        'filename': file.originalName,
        'metadata': {width: data.resultDimensions.width, height: data.resultDimensions.height},
        'account': {_id: file.account._id, title: file.account.title}
      }, function (err, res) {
        if (err) { return next(err); }
        req.log.info('File uploaded');
        var setExpr = {
          width: data.resultDimensions.width,
          height: data.resultDimensions.height,
          storage: 'gridfs',
          storageId: res._id.toString(),
          isTemp: task.isTemp
        };
        if (!task.isTemp) {
          setExpr.collectionName = task.collectionName;
          setExpr.resourceId = task.resourceId;
        }
        req.app.models.files.update({_id: file._id}, {
          $set: setExpr
        }, next);
      });
    }],
    updateRefs: ['toGridFS', function (next) {
      updateRefs(req, file, task.collectionName, task.resourceId, next);
    }]
  }, cb);
}, 1);

function validateRequest(req, chunkNumber, chunkSize, totalSize, identifier, filename, fileSize, collectionName,
                         resourceId, isTemp) {
  if (chunkNumber === 0 || chunkSize === 0 || totalSize === 0 || identifier.length === 0 || filename.length === 0) {
    return 'non_flow_request';
  }
  var numberOfChunks = Math.max(Math.floor(totalSize / (chunkSize)), 1);
  if (chunkNumber > numberOfChunks) {
    return 'invalid_flow_request1';
  }

  // Is the file too big?
  if (maxFileSize && totalSize > maxFileSize) {
    return 'invalid_flow_request2';
  }

  if (typeof(fileSize) !== 'undefined') {
    if (chunkNumber < numberOfChunks && fileSize !== chunkSize) {
      // The chunk in the POST request isn't the correct size
      return 'invalid_flow_request3';
    }
    if (numberOfChunks > 1 && chunkNumber === numberOfChunks && fileSize !== ((totalSize % chunkSize) + parseInt(chunkSize))) {
      // The chunks in the POST is the last one, and the fil is not the correct size
      return 'invalid_flow_request4';
    }
    if (numberOfChunks === 1 && fileSize !== totalSize) {
      // The file is only a single chunk, and the data size does not fit
      return 'invalid_flow_request5';
    }
  }
  if (!isTemp && (!collectionName || !_.isString(collectionName) || collectionName.length === 0 || !_.contains(allowedCollections,
      collectionName))) {
    return 'invalid_collection_name' + collectionName;
  }
  if (!isTemp && (!resourceId || !_.isString(resourceId) || resourceId.length === 0)) {
    return 'invalid_resource_id';
  }
  return 'valid';
}

function post(req, cb) {
  var fields = req.body;
  var files = req.files;
  var fileParameterName = 'file';
  var chunkNumber = parseInt(fields.flowChunkNumber);
  var chunkSize = parseInt(fields.flowChunkSize);
  var totalSize = parseInt(fields.flowTotalSize);
  var identifier = fields.flowIdentifier;
  var filename = fields.flowFilename;
  var collectionName = fields.collectionName;
  var resourceId = fields.resourceId;
  var isTemp = fields.isTemp;
  if (!files[fileParameterName] || !files[fileParameterName].size) { return cb(new Error('invalid_flow_request')); }
  var validation = validateRequest(req, chunkNumber, chunkSize, totalSize, identifier, filename,
    files[fileParameterName].size, collectionName, resourceId, isTemp);
  if (validation !== 'valid') { return cb(new Error(validation)); }
  var numberOfChunks = Math.max(Math.floor(totalSize / (chunkSize)), 1);

  req.app.models.files.collection.findAndModify({'account._id': req.auth.account._id, clientId: identifier}, [],
    {
      $set: {
        title: removeExtension(filename),
        originalName: filename,
        size: totalSize,
        clientId: identifier,
        account: {_id: req.auth.account._id, title: req.auth.account.title},
        totalChunks: numberOfChunks,
        storage: 'chunks',
        contentType: mime.lookup(filename),
        createDate: new Date(),
        isImage: true
      }
    }, {upsert: true, new: true}, function (err, file) {
      if (err) {return cb(err); }
      fs.readFile(files[fileParameterName].path, function (err, data) {
        if (err) {return cb(err); }
        fs.unlink(files[fileParameterName].path, function (err) {
          if (err) {return cb(err); }
          req.app.models.fileChunks.create({
            data: data,
            size: data.length,
            chunkNumber: chunkNumber,
            file: {_id: file._id, title: file.title}
          }, function (err) {
            if (err) {return cb(err); }
            req.app.models.files.findByIdAndUpdate(file._id, {$inc: {uploadedChunks: 1}}, function (err, newFile) {
              if (err) {return cb(err); }
              if (newFile.uploadedChunks === newFile.totalChunks) {
                async.parallel([
                  _.bind(toGridFSqueue.push, toGridFSqueue, {
                    req: req,
                    file: file,
                    collectionName: collectionName,
                    resourceId: resourceId,
                    isTemp: isTemp
                  }), function (next) {
                    if (isTemp) { return next(); }
                    assignFile(req, file, collectionName, resourceId, next);
                  }
                ], function (err) {
                  if (err) { return cb(err); }
                  cb(null, 'done', file);
                });
              } else {
                cb(null, 'chunk', file);
              }
            });
          });
        });
      });
    });
}

router.post('/', multipartMiddleware, function (req, res, next) {
  post(req, function (err, event, file) {
    if (err) { return next(err); }
    res.status(200).json({
      'file._id': file._id,
      'file.title': file.title
    });
  });
});
module.exports = router;
