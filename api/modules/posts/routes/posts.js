'use strict';

var express = require('express'),
  moment = require('moment'),
  _ = require('lodash'),
  async = require('async'),
  tmp = require('tmp'),
  fs = require('fs'),
  fstream = require('fstream'),
  tar = require('tar'),
  zlib = require('zlib'),
  path = require('path'),
  mongoose = require('mongoose'),
  Grid = require('gridfs-stream'),
  router = express.Router();

/**
 * @api {get} /api/posts Получить список постов
 * @apiName posts
 * @apiGroup posts
 * @apiVersion 0.0.1


 router.get('/import', function (req, res, next) {
    return;
    _.forEach(data, function (item) {
        var post = new req.app.models.posts();
        post.title = item.text;
        post.body = item.text;
        post.tags = [];
        post.site = req.site;
        var tags = item.tags.split(',');
        _.forEach(tags, function (tag) {
            tag = _.trim(tag);
            post.tags.push({
                title: tag
            });
        });
        post.save(function (err, data) {
        });
    });
});
 */

router.get('/csv', function (req, res, next) {
  async.auto({
    'posts': function (next) {
      var params = {'site._id': req.site._id, removed: {$exists: false}, status: 4};
      if (req.query.postType) {
        params.postType = req.query.postType;
      }
      req.app.models.posts.find(params, next)
    }
  }, function (err, data) {
    if (err) {
      return next(err);
    }

    res.set('Content-Type', 'text/csv');
    res.attachment(
      'posts-' + req.site.domain + '.csv'
    );

    var str = 'Title,Url,Category,Views,Meta title\n';
    var posts = _.sortBy(data.posts, 'title');
    _.each(posts, function (post) {
      str += '"' + post.title + '",' +
      req.site.url + req.app.services.url.urlFor('posts', post) + ',' +
      (post.category.title || '') + ',' +
      post.viewsCount + ',' +
      '"' + post.meta.title + '"\n';
    });
    res.send(str);
  });

});

function savePost(app, dirPath, post, next) {
  var fullPath = dirPath + '/' + post.alias;
  async.auto({
    'createDir': function (next) {
      app.services.storage.ensureExistsFolder(fullPath, next);
    },
    'images': function (next) {
      var ids = _.pluck(post.files, '_id')
      app.models.files.find({_id: {$in: ids}}, next);
    },
    'coverFile': function (next) {
      if (!post.coverFile) {
        return next();
      }
      app.models.files.findOne({_id: post.coverFile._id}, next);
    },
    'saveImages': ['createDir', 'images', 'coverFile', function (next, data) {
      if (data.coverFile) {
        data.coverFile.site = {
          _id: post.site._id,
          domain: post.site.domain
        };
        data.images.unshift(data.coverFile);
      }
      async.eachLimit(data.images, 3, function (image, next) {
        var baseName = path.basename(image.originalName);

        var args = {
          _id: image.storageId
        };
        app.services.storage.exist(args, function (err, found) {
          if (err) {
            return next(err);
          }

          if (found) {
            app.services.storage.saveToFile(args, fullPath + '/' + baseName, next);
          } else {
            console.info(image);
            next();
          }
        });

      }, next);
    }],
    'comments': function (next) {
      app.models.comments.find(
        {collectionName: 'posts', resourceId: post._id, removed: {$exists: false}},
        'text cid parentComment indent isAnonymous isSpam isPublished account createDate',
        next
      );
    },
    'saveComments': ['comments', function (next, data) {
      var fileName = fullPath + '/comments.json';

      fs.writeFile(fileName, JSON.stringify(data.comments, null, 2), next);
    }],
    'files': ['saveImages', function (next, data) {
      var fileName = fullPath + '/files.json';

      fs.writeFile(fileName, JSON.stringify(data.images, null, 2), next);
    }]
  }, function (err, data) {
    if (err) {
      return next(err);
    }

    next();
  });
}
function saveCategory(app, dirPath, category, next) {
  var fullPath = dirPath + '/category' + category.alias;
  async.auto({
    'createDir': function (next) {
      app.services.storage.ensureExistsFolder(fullPath, next);
    },
    'images': function (next) {
      app.models.files.find({resourceId: category._id}, next);
    },
    'saveImages': ['createDir', 'images', function (next, data) {
      async.eachLimit(data.images, 3, function (image, next) {
        var baseName = path.basename(image.originalName);

        var args = {
          _id: image.storageId
        };
        app.services.storage.exist(args, function (err, found) {
          if (err) {
            return next(err);
          }

          if (found) {
            app.services.storage.saveToFile(args, fullPath + '/' + baseName, next);
          } else {
            console.info(image);
            next();
          }
        });

      }, next);
    }],
    'files': ['images', function (next, data) {
      var fileName = fullPath + '/files.json';

      fs.writeFile(fileName, JSON.stringify(data.images, null, 2), next);
    }]
  }, function (err, data) {
    if (err) {
      return next(err);
    }

    next();
  });
}

function importPost(app, dirPath, post, next) {
  var site = post.site;
  async.auto({
    'files': function (next) {
      fs.readFile(dirPath + '/' + post.alias + '/files.json', function (err, res) {
        if (err) {
          return next(err)
        }

        var files = JSON.parse(res);
        async.eachLimit(files, 10, function (file, next) {
          var baseName = path.basename(file.originalName);



          app.models.files.findOne({_id: file._id}, function (err, exists) {
            var saveFunc = function() {
              app.services.storage.fromFile({_id: file._id}, dirPath + '/' + post.alias + '/' + baseName, function () {

                file = new app.models.files(file);
                file.storageId = file._id;
                file.site = site;
                file.save(function (err) {
                  if (err) {
                    console.info('save file', file._id, err)
                  }
                  next();
                });

              });
            };
            if (exists) {
              app.models.files.remove({_id: file._id}, saveFunc);
            } else {
              saveFunc();
            }
          });
        }, next);
      });
    },
    'comments': function (next) {
      fs.readFile(dirPath + '/' + post.alias + '/comments.json', function (err, res) {
        if (err) {
          return next(err)
        }

        var files = JSON.parse(res);
        async.eachLimit(files, 10, function (comment, next) {
          comment = new app.models.comments(comment);
          comment.resourceId = post._id;
          comment.collectionName = 'posts';
          comment.site = site;
          comment.save(next);
        }, next);
      });
    }
  }, next);
}
function importCategory(app, dirPath, category, next) {
  var site = category.site;

  fs.readFile(dirPath + '/category' + category.alias + '/files.json', function (err, res) {
    if (err) {
      return next(err)
    }

    var files = JSON.parse(res);
    async.each(files, function (file, next) {
      var baseName = path.basename(file.originalName);

      console.info('category: ', dirPath + '/category' + category.alias + '/' + baseName);


      app.models.files.findOne({_id: file._id}, function (err, exists) {
        var saveFunc = function() {
          app.services.storage.fromFile({_id: file._id}, dirPath + '/category' + category.alias + '/' + baseName, function () {

            file = new app.models.files(file);
            file.storageId = file._id;
            file.collectionName = 'categories';
            file.site = site;
            file.save(function (err) {
              if (err) {
                console.info('save category file', file._id, err)
              }
              next();
            });

          });
        };
        if (exists) {
          app.models.files.remove({_id: file._id}, saveFunc);
        } else {
          saveFunc();
        }

    }, next);
  });
}

router.get('/zip', function (req, res, next) {
  async.auto({
    'dir': function (next) {
      tmp.dir(function _tempDirCreated(err, path, cleanupCallback) {
        if (err) {
          return next(err);
        }

        next(null, {path: path, callback: cleanupCallback})
      });
    },
    'posts': function (next) {
      var params = {'site._id': req.site._id, removed: {$exists: false}, status: 4};
      if (req.query.postType) {
        params.postType = req.query.postType;
      }
      if (req.query.siteId) {
        params['site._id'] = req.query.siteId;
      }
      req.app.models.posts.find(params, next)
    },
    'categories': function (next) {
      var params = {'site._id': req.site._id, removed: {$exists: false}};
      if (req.query.postType) {
        params.postType = req.query.postType;
      }
      if (req.query.siteId) {
        params['site._id'] = req.query.siteId;
      }
      req.app.models.categories.find(params, next)
    },
    'site': function (next) {
      req.app.models.sites.findById({'_id': req.site._id}, next)
    },
    'savePosts': ['dir', 'posts', function (next, data) {
      var chunks = _.chunk(data.posts, 50),
        num = 1;
      async.eachSeries(chunks, function (posts, next) {
        posts = _.map(posts, function (post) {
          delete post.site;
          return post;
        });
        var fileName = data.dir.path + '/posts' + _.padLeft(num++, 4, '0') + '.json';

        fs.writeFile(fileName, JSON.stringify(posts, null, 2), function (err) {
          if (err) {
            return next(err);
          }

          async.eachLimit(posts, 5, _.partial(savePost, req.app, data.dir.path), next);
        });
      }, next);
    }],
    'saveCategories': ['dir', 'categories', function (next, data) {
      var fileName = data.dir.path + '/categories.json';

      fs.writeFile(fileName, JSON.stringify(data.categories, null, 2), next);
    }],
    'saveCategoriesImages': ['dir', 'categories', function (next, data) {
      async.eachLimit(data.categories, 5, _.partial(saveCategory, req.app, data.dir.path), next);
    }],
    'saveSite': ['dir', 'site', function (next, data) {
      var fileName = data.dir.path + '/site.json';

      fs.writeFile(fileName, JSON.stringify(data.site, null, 2), next);
    }]
  }, function (err, data) {
    if (err) {
      return next(err);
    }

    res.set('Content-Type', 'application/octet-stream');
    res.attachment(
      'posts-' + req.site.domain + '.tar.gz'
    );
    fstream.Reader({'path': data.dir.path + '/', 'type': 'Directory'})
      .pipe(tar.Pack({fromBase: true}))
      .pipe(zlib.Gzip())
      .pipe(res); // .pipe(fstream.Writer({ 'path': 'compressed_folder.tar.gz' });
  });
});


router.get('/import', function (req, res, next) {
  var path = __dirname + '/../../../import.tar.gz';

  async.auto({
    'dir': function (next) {
      tmp.dir(function _tempDirCreated(err, path, cleanupCallback) {
        if (err) {
          return next(err);
        }

        next(null, {path: path, callback: cleanupCallback})
      });
    },
    'unzip': ['dir', function (next, data) {
      fs.createReadStream(path)
        .pipe(zlib.createGunzip())
        .pipe(tar.Parse())
        .pipe(fstream.Writer({'path': data.dir.path}).on("close", next));
    }],
    'site': ['unzip', function (next, data) {
      var fileName = data.dir.path + '/site.json';

      fs.readFile(fileName, function (err, data) {
        if (err) {
          return next(err)
        }

        var site = JSON.parse(data);
        req.app.models.sites.remove({_id: site._id}, function () {
          site = new req.app.models.sites(site);
          site.domain = 'vseowode.5stars.link';
          site.port = 80;
          site.save(function () {
            next(null, site);
          });
        })
      });
    }],
    'cleanupCategories': ['site', function (next, data) {
      req.app.models.categories.remove({'site._id': data.site._id}, next);
    }],
    'cleanupPosts': ['site', function (next, data) {
      req.app.models.posts.remove({'site._id': data.site._id}, next);
    }],
    'cleanupFiles': ['site', function (next, data) {
      req.app.models.files.remove({'site._id': data.site._id}, next);
    }],
    'cleanup': ['cleanupCategories', 'cleanupPosts', 'cleanupFiles', function (next, data) {
      next();
    }],
    'importCategories': ['cleanup', function (next, data) {
      var fileName = data.dir.path + '/categories.json';

      fs.readFile(fileName, function (err, res) {
        if (err) {
          return next(err)
        }

        var categories = JSON.parse(res);
        categories = _.sortBy(categories, function (category) {
          return category.path.length;
        });
        _.each(categories, function (category) {
          console.info(category._id, category.parentId)
        });

        async.eachLimit(categories, 1, function (category, next) {
          category = new req.app.models.categories(category);
          category.site = data.site;
          category.save(function (err) {
            console.info(err);
            importCategory(req.app, data.dir.path, category, next);
          });
        }, next);
      });
    }],
    'importPosts': ['cleanup', function (next, data) {
      //var fileName = data.dir.path + '/categories.json';

      fs.readdir(data.dir.path, function (err, list) {
        if (err) {
          return next(err)
        }

        list = _.filter(list, function (item) {
          return item.match(/posts\d+\.json/);
        });
        async.eachLimit(list, 1, function (name, next) {
          var fileName = data.dir.path + '/' + name;

          fs.readFile(fileName, function (err, res) {
            if (err) {
              return next(err)
            }

            var posts = JSON.parse(res),
              total = posts.length, n = 0;

            async.eachLimit(posts, 5, function (post, next) {
              console.info('import posts', ++n, '/', total);

              post = new req.app.models.posts(post);
              post.site = {
                _id: data.site._id,
                domain: data.site.domain
              };
              post.save(function () {
                importPost(req.app, data.dir.path, post, next);
              });

            }, next);
          });
        }, next);
      });
    }]
  }, function (err, data) {
    if (err) {
      return next(err);
    }

    res.json({success: true});
  });
});

/**
 * @api {get} /api/posts/tags-complete?term=:term Автокомплит тегов
 * @apiName tags-complete
 * @apiGroup posts
 * @apiVersion 0.0.1
 *
 * @apiParam {String} [term] Строка поиска
 */
router.get('/tags-complete', function (req, res, next) {
  if (req.auth.isGuest) {
    res.status(401).end();
  } else {
    req.app.models.posts.aggregate([
      {$match: {'removed': {$exists: false}}},
      {$unwind: '$tags'},
      {$match: {'tags.title': new RegExp(req.query.term, 'i')}},
      {$group: {_id: '$tags.title', count: {$sum: 1}}},
      {$sort: {count: -1}},
      {$limit: 10},
      {$project: {title: '$_id', _id: 0}}
    ], function (err, data) {
      if (err) {
        return next(err);
      }
      res.json(data);
    });
  }
});

router.get('/source-complete', function (req, res, next) {
  if (req.auth.isGuest) {
    res.status(401).end();
  } else {
    req.app.models.posts.aggregate([
      {$match: {'removed': {$exists: false}}},
      {$match: {'source': new RegExp(req.query.term, 'i')}},
      {$group: {_id: '$source', count: {$sum: 1}}},
      {$sort: {count: -1}},
      {$limit: 10},
      {$project: {title: '$_id', _id: 0}}
    ], function (err, data) {
      if (err) {
        return next(err);
      }
      res.json(_.uniq([{title: req.query.term}].concat(data), function (n) {
        return n.title;
      }));
    });
  }
});

router.get('/statistic', function (req, res, next) {
  if (req.auth.isGuest) {
    res.status(401).end();
  } else {

    var startDate = new Date(),
      endDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 59);

    var days = {
      today: {
        start: startDate,
        end: endDate
      },
      yesterday: {
        start: moment(startDate).subtract(1, 'days').toDate(),
        end: moment(endDate).subtract(1, 'days').toDate()
      },
      month: {
        start: moment(startDate).startOf('month').toDate(),
        end: moment(endDate).endOf('month').toDate()
      },
      prevMonth: {
        start: moment(startDate).subtract(1, 'month').startOf('month').toDate(),
        end: moment(endDate).subtract(1, 'month').endOf('month').toDate()
      },
      all: {}
    }, result = {};

    async.forEachOf(days, function (value, key, next) {
      var match = {
        'site._id': req.site._id, removed: {$exists: false}
      };

      if (value.start) {
        match.createDate = {$gte: value.start, $lt: value.end}
      }

      req.app.models.posts.aggregate([
        {'$match': match},
        {'$group': {'_id': {createdBy: '$createdBy'}, 'count': {'$sum': 1}}}
      ], function (err, data) {
        if (err) {
          return next(err);
        }

        _.forEach(data, function (item) {
          var account = item._id.createdBy;
          if (!account || !account._id) {
            return;
          }
          result[account._id] = result[account._id] || {
            account: account
          };
          result[account._id][key] = item.count;
        });
        next();
      });

    }, function (err, data) {
      if (err) {
        return next(err);
      }

      return res.json(result);
    });

  }
});

router.get('/:id/suggest', function (req, res, next) {
  async.auto({
    'item': function (next) {
      return req.app.models.posts.findById(req.params.id, next);
    },
    'suggest': ['item', function (next, data) {
      var keys = _.map(data.item.keywords, function (item) {
        return item.word;
      });

      req.app.models.posts.aggregate([
        {
          '$match': {
            _id: {$ne: data.item._id},
            'site._id': req.site._id,
            published: true,
            removed: {$exists: false},
            keywords: {$elemMatch: {word: {$in: keys}}}
          }
        },
        {'$unwind': '$keywords'},
        {'$match': {'keywords.word': {$in: keys}}},
        {'$group': {'_id': '$_id', 'keywords': {'$sum': 1}}},
        {'$sort': {'keywords': -1}},
        {'$limit': 10}
      ], next);
    }],
    'items': ['suggest', function (next, data) {
      req.app.models.posts.find({_id: {$in: _.pluck(data.suggest, '_id')}}, 'title alias category coverFile', {limit: 5}, next);
    }]
  }, function (err, data) {
    if (err) {
      return next(err);
    }

    return res.json(data.items);
  });
});

module.exports = router;