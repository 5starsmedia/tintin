/**
 * @copyright 2014 Cannasos.com
 */
'use strict';

var express = require('express'),
  async = require('async'),
  _ = require('lodash'),
  path = require('path'),
  util = require('util'),
  fs = require('fs'),
  mongoose = require('mongoose'),
  imageSize = require('image-size');
var unzip = require('unzip2'),
  xml2js = require('xml2js');

var gm = require('gm');
var tmp = require('tmp');
var mime = require('mime'),
  stream = require("stream");
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

var allowedCollections = ['strainReviews', 'posts', 'accounts', 'groups'];
var maxFileSize = 10 * 1024 * 1024;

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
    return 'invalid_collection_name';
  }
  if (!isTemp && (!resourceId || !_.isString(resourceId) || resourceId.length === 0)) {
    return 'invalid_resource_id';
  }
  return 'valid';
}


function parseTopic(topic) {
  var item = { children: [] }, count = 0, topicId = topic['$'].id, hasLeafs = false;

  _.forEach(topic['marker-refs'], function(markerRefs) {
    _.forEach(markerRefs['marker-ref'], function(marker) {
      item.icon = marker['$']['marker-id'];
    });
  });

  _.forEach(topic.children, function(children) {
    _.forEach(children.topics, function(topicNode) {
      _.forEach(topicNode.topic, function(topicItem) {
        var itm = parseTopic(topicItem);
        if (!itm.children.length) {
          hasLeafs = true;
          delete itm.children;
          leafs.push(itm);
        }
        item.children.push(itm);
      });
    });
  });
  if (count == 0) {
    if (topic.title) {
      item.title = topic.title[0];
      if (item.title._) {
        item.title = item.title._;
      }
    }
  }
  if (hasLeafs) {
    leafsParent[topicId] = item;
  }
  return item;
}
function parseMMapTopic(topic) {
  var item = { children: [] };

  if (topic['ap:Text'] && topic['ap:Text'][0]) {
    item.title = _.trim(topic['ap:Text'][0]['$'].PlainText, "0123456789-+. \t\n");
  }

  _.forEach(topic['ap:SubTopics'], function(markerRefs) {
    _.forEach(markerRefs['ap:Topic'], function(topicItem) {
      item.children.push(parseMMapTopic(topicItem));
    });
  });

  return item;
}

var saveGroup = function(req, group, next) {
  async.auto({
    'group': function(next) {
      req.app.models.keywordGroups.findOne({ title: group.title }, function(err, groupObj) {
        if (!groupObj) {
          groupObj = new req.app.models.keywordGroups();
          groupObj.title = group.title;
        }
        groupObj.site = req.site;
        groupObj.keywords = groupObj.title + "\n" + _.pluck(group.children, 'title').join("\n");
        print_r(groupObj.keywords);
        groupObj.save(next)
      });
    }
  }, next);
};

var saveProject = function(req, projectInfo, data, next) {
  async.auto({
    'project': function(next) {
      req.app.models.keywordProjects.findOne({ internalCode: projectInfo.id }, function(err, project) {
        if (err) {return next(err); }
        if (!project) {
          project = new req.app.models.keywordProjects();
          project.internalCode = projectInfo.id;
        }
        project.title = projectInfo.title;
        project.save(function() {
          next(null, project);
        });
      });
    },
    'saveGroups': ['project', function(next, res) {
      var q = async.queue(_.partial(saveGroup, req), 10);
      _.forEach(data, function (group) {
        q.push(group);
      });
      q.drain = next;

    }]
  }, function(err, data) {
    if (err) {return next(err); }
    next(null, data.project);
  });
};

var leafs = [],
  leafsParent = {};

var parseXMind = function(chunks, callback) {
  var bufferStream = new stream.Transform();


  _.forEach(chunks, function(chunk) {
    bufferStream.push(chunk.data)
  });
  bufferStream.end();

  bufferStream.pipe(unzip.Parse())
    .on('entry', function (entry) {
      var fileName = entry.path;
      if (fileName === 'content.xml' && entry.type == 'File') {
        var data = '';
        entry.on('data', function (chunk) {
          data += chunk;
        })
          .on('end', function () {
            xml2js.parseString(data, {trim: true}, function (err, result) {
              var item = null;
              _.forEach(result['xmap-content'].sheet, function(sheet) {
                _.forEach(sheet.topic, function(topic) {
                  item = parseTopic(topic);
                });
              });

              var items = _.filter(leafsParent, { icon: 'symbol-plus' });
              callback(null, {
                id: result['xmap-content'].sheet[0]['$'].id,
                title: result['xmap-content'].sheet[0].topic[0].title[0]
              }, items);
            });
          });
      } else {
        entry.autodrain();
      }
    });

};

var parseMMap = function(chunks, callback) {
  var bufferStream = new stream.Transform();

  _.forEach(chunks, function(chunk) {
    bufferStream.push(chunk.data)
  });
  bufferStream.end();

  bufferStream.pipe(unzip.Parse())
    .on('entry', function (entry) {
      var fileName = entry.path;
      if (fileName === 'Document.xml' && entry.type == 'File') {
        var data = '';
        entry.on('data', function (chunk) {
          data += chunk;
        })
          .on('end', function () {
            xml2js.parseString(data, {trim: true}, function (err, result) {
              var item = null;
              _.forEach(result['ap:Map']['ap:OneTopic'], function(oneTopic) {
                _.forEach(oneTopic['ap:Topic'], function(topic) {
                  item = parseMMapTopic(topic);
                });
              });

              callback(null, item);
            });
          });
      } else {
        entry.autodrain();
      }
    });

};

var parseText = function(chunks, callback) {
  var str = '';
  _.forEach(chunks, function(chunk) {
    str += chunk.data.toString();
  });

  var items = [],
    item = { children: [] };
  var lines = str.split("\n");
  _.forEach(lines, function(line) {
    var beginSymb = line.substring(0, 1);
    if (beginSymb == ' ' || beginSymb == "\t") {
      item.children.push({ title: _.trim(line) });
    } else {
      if (item.children.length) {
        items.push(item);
      }
      item = { title: line, children: [] };
    }
  });
  callback(null, {
    id: '-',
    title: '-'
  }, items);
};

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
        isImage: false
      }
    }, {upsert: true, new: true}, function (err, file) {
      if (err) {return cb(err); }

        file = file.value;

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
              if (newFile.uploadedChunks === newFile.totalChunks - 1) {

                req.app.models.fileChunks.find({ 'file._id': file._id }, 'data', { sort: 'chunkNumber' }, function(err, chunks) {
                  if (err) {return cb(err); }

                  if (mime.lookup(filename) == 'text/plain') {
                    parseText(chunks, function (err, project, data) {
                      if (err) { return cb(err); }

                      saveProject(req, project, data, function(err, project) {
                        if (err) { return cb(err); }
                        cb(null, 'done', {
                          _id: project._id,
                          title: project.title
                        });
                      });
                    });
                    return;
                  }

                  parseMMap(chunks, function (err, item) {
                    if (err) { return cb(err); }

                    var q = async.queue(_.partial(saveGroup, req), 10);
                    _.forEach(item.children, function (group) {
                      _.forEach(group.children, function (group) {
                        q.push(group);
                      });
                    });
                    q.drain = cb;
                  });
                });
              } else {
                cb(null, 'chunk', {
                  _id: file._id,
                  title: file.title
                });
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
    res.status(200).json(file);
  });
});
module.exports = router;
