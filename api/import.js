var mysql = require('mysql'),
  _ = require('lodash'),
  async = require('async'),
  moment = require('moment'),
  mongoose = require('mongoose'),
  Grid = mongoose.mongo.Grid,
  request = require('request'),
  imageSize = require('image-size'),
  mime = require('mime');
var url = require('url');
var http = require('http');
var PHPUnserialize = require('php-unserialize');
var grid;

var app = {};
app.log = require('./log.js');
app.config = require('./config.js');
app.models = require('./models');

var tablePrefix = 'ander_',
  siteDomain = 'vandroide.5stars.link';

var commentsRef = {};

var saveComment = function (site, connection, post, item, next) {
  async.auto({
    'comment': function (next) {
      var params = {
        collectionName: 'posts',
        resourceId: post._id,
        cid: item.comment_ID
      };
      app.models.comments.findOne(params, function (err, comment) {
        if (err) {
          return next(err);
        }
        if (!comment) {
          comment = new app.models.comments(params);
          comment.site = {_id: site._id, domain: site.domain};
        }
        var parent = parseInt(item.comment_parent);
        comment.realAccount = {
          title: item.comment_author,
          email: item.comment_author_email
        };
        comment.text = item.comment_content;
        if (parent) {
          comment.parentComment = commentsRef[parent];
          comment.parentComment.isAnonymous = true;
          comment.indent = 1;
        }
        comment.createDate = item.comment_date;
        comment.isAnonymous = true;
        if (item.comment_approved == 'spam' || item.comment_approved == 'trash') {
          comment.removed = Date.now();
        }
        comment.save(function (err) {
          if (err) {
            return next(err);
          }
          commentsRef[parseInt(item.comment_ID)] = comment;
          next();
        })
      });
    }
  }, next);
};
var saveItem = function (site, connection, item, next) {
  var id = parseInt(item.ID);
  async.auto({
    'meta': function (next) {
      var meta = {};
      connection.query('SELECT * FROM ' + tablePrefix + 'postmeta WHERE post_id = ' + id, function (err, rows, fields) {
        if (err) {
          return next(err);
        }
        _.forEach(rows, function (item) {
          meta[item.meta_key] = item.meta_value;
        });
        next(null, meta);
      });
    },
    'comments': ['post', function (next, data) {
      var meta = {};
      connection.query('SELECT * FROM ' + tablePrefix + 'comments WHERE comment_post_ID = ' + id + ' ORDER BY comment_parent', function (err, rows) {
        if (err) {
          return next(err);
        }
        async.eachSeries(rows, _.partial(saveComment, site, connection, data.post), next);
      });
    }],
    'categoryId': function (next) {
      connection.query('SELECT * FROM ' + tablePrefix + 'term_relationships AS r LEFT JOIN ' + tablePrefix + 'term_taxonomy AS t ON r.term_taxonomy_id = t.term_taxonomy_id WHERE taxonomy = "category" AND object_id = ' + id, function (err, rows) {
        if (err) {
          return next(err);
        }
        if (!rows.length) {
          return next();
        }
        next(null, rows[0].term_taxonomy_id);
      });
    },
    'images': ['post', function (next, data) {
      /*connection.query('SELECT * FROM ' + tablePrefix + 'posts WHERE post_type = "attachment" AND post_parent = ' + id, function (err, rows) {
       if (err) {return next(err);}
       data.post.files = [];
       if (rows.length) {
       rows[rows.length - 1].is_main = true;
       }
       async.eachSeries(rows, _.partial(saveFile, site, data.post), function(err) {
       if (err) return next(err);
       data.post.save(next);
       });
       });*/

      var m, urls = [], isFirst = true,
        rex = /<img[^>]+src="(http:\/\/[^">]+)"/g;

      while (m = rex.exec(data.post.body)) {
        urls.push({
          guid: m[1],
          is_main: isFirst
        });
        isFirst = false;
      }
      data.post.files = [];
      async.eachSeries(urls, _.partial(saveFile, site, data.post), function (err) {
        if (err) return next(err);
        data.post.save(next);
      });
    }],
    'post': function (next) {
      app.models.posts.findOne({id: id}, function (err, post) {
        if (err) {
          return next(err);
        }
        if (!post) {
          post = new app.models.posts({id: id, site: {_id: site._id, domain: site.domain}});
        }

        next(null, post);
      });
    },
    'updateFields': ['post', function (next, data) {
      var rex = /\[([^\] ]+)([^>]*)\](.*)\[\/([^\] ]+)\]/gim;

      var post = data.post;
      post.body = item.post_content.replace(rex, "<figure$2 data-$1>$3</figure>");
      post.createDate = item.post_date;
      post.title = item.post_title;
      post.alias = item.post_name;
      post.modifyDate = item.post_modified;
      post.published = true;
      post.postType = item.post_type;
      post.status = 4;
      post.commentsCount = item.comment_count;
      post.save(next);
    }],
    'updateMeta': ['post', 'meta', function (next, data) {
      data.post.meta = {
        title: data.meta['_aioseop_title'],
        keywords: data.meta['_aioseop_keywords'],
        description: data.meta['_aioseop_description']
      };
      data.post.viewsCount = parseInt(data.meta['pvc_views']);
      data.post.save(next);
    }],
    'updateCategory': ['post', 'meta', 'categoryId', function (next, data) {
      if (!data.categoryId) {
        return next();
      }

      if (categoryRefId[data.categoryId]) {
        data.post.category = {
          _id: categoryRefId[data.categoryId]._id,
          title: categoryRefId[data.categoryId].title,
          alias: categoryRefId[data.categoryId].alias
        };
      } else {
        console.error('No category', data.categoryId);
      }
      data.post.save(next);
    }]
  }, next);
};


var saveCategoryFile = function (site, post, image, next) {
  var fileName = image.guid;
  app.models.files.findOne({originalName: fileName}, function (err, file) {
    if (!file) {
      file = new app.models.files({
        originalName: fileName,
        collectionName: 'categories',
        resourceId: post._id,
        title: '-',
        contentType: '-',
        isImage: true,
        size: 1
      });
    }
    file.save(function (err, file) {
      if (err) return next(err);

      if (image.is_main) {
        post.coverFile = file;
      }
      async.auto({
        'downloadImage': function (next) {
          console.info('Download: ', fileName)
          var options = url.parse(fileName);

          http.get(options, function (response) {
            var chunks = [];
            response.on('data', function (chunk) {
              chunks.push(chunk);
            }).on('end', function () {
              var buffer = Buffer.concat(chunks);
              next(null, buffer);
            });
          });
        },
        'saveToDB': ['downloadImage', function (next, data) {
          var buffer = data.downloadImage;

          var resultDimensions = imageSize(buffer);
          post.files.push(file);
          grid.put(buffer, {
            'content_type': mime.lookup(file.originalName),
            'filename': file.originalName,
            'metadata': {width: resultDimensions.width, height: resultDimensions.height}
          }, function (err, res) {
            if (err) {
              return next(err);
            }
            app.log.info('File uploaded');
            var setExpr = {
              width: resultDimensions.width,
              height: resultDimensions.height,
              storage: 'gridfs',
              storageId: res._id.toString(),
              isTemp: false
            };
            setExpr.collectionName = 'categories';
            setExpr.resourceId = post._id;
            app.models.files.update({_id: file._id}, {
              $set: setExpr
            }, next);
          });
        }]
      }, next);
    });
  });
}

var saveFile = function (site, post, image, next) {
  var fileName = image.guid;
  app.models.files.findOne({originalName: fileName}, function (err, file) {
    if (!file) {
      file = new app.models.files({
        originalName: fileName,
        collectionName: 'posts',
        resourceId: post._id,
        title: '-',
        contentType: '-',
        isImage: true,
        size: 1
      });
    }
    file.save(function (err, file) {
      if (err) return next(err);

      if (image.is_main) {
        post.coverFile = file;
      }
      async.auto({
        'downloadImage': function (next) {
          console.info('Download: ', fileName)
          var options = url.parse(fileName);

          http.get(options, function (response) {
            var chunks = [];
            response.on('data', function (chunk) {
              chunks.push(chunk);
            }).on('end', function () {
              var buffer = Buffer.concat(chunks);
              next(null, buffer);
            });
          });
        },
        'saveToDB': ['downloadImage', function (next, data) {
          var buffer = data.downloadImage;

          var resultDimensions = imageSize(buffer);
          post.files.push(file);
          grid.put(buffer, {
            'content_type': mime.lookup(file.originalName),
            'filename': file.originalName,
            'metadata': {width: resultDimensions.width, height: resultDimensions.height}
          }, function (err, res) {
            if (err) {
              return next(err);
            }
            app.log.info('File uploaded');
            var setExpr = {
              width: resultDimensions.width,
              height: resultDimensions.height,
              storage: 'gridfs',
              storageId: res._id.toString(),
              isTemp: false
            };
            setExpr.collectionName = 'posts';
            setExpr.resourceId = post._id;
            app.models.files.update({_id: file._id}, {
              $set: setExpr
            }, next);
          });
        }]
      }, next);
    });
  });
}

var categoryRefId = {},
  wCategories = {};
var saveCategory = function (site, connection, item, next) {
  var id = parseInt(item.term_taxonomy_id),
    termId = parseInt(item.term_id);
  async.auto({
    'term': function (next) {
      connection.query('SELECT * FROM ' + tablePrefix + 'terms WHERE term_id = ' + termId, function (err, rows) {
        if (err) {
          return next(err);
        }
        next(null, rows[0]);
      });
    },
    'category': function (next) {
      app.models.categories.findOne({id: id}, function (err, category) {
        if (err) {
          return next(err);
        }
        if (!category) {
          category = new app.models.categories({id: id, site: {_id: site._id, domain: site.domain}});
        }
        next(null, category);
      });
    },
    'rootCategory': function (next) {
      app.models.categories.findOne({parentId: null}, function (err, node) {
        if (err) return next(err);

        if (!node) {
          node = new app.models.categories();
          node.title = 'root';
          node.removed = Date.now();
          node.save(function (err) {
            if (err) return next(err);
            next(undefined, node);
          });
          return;
        }
        next(undefined, node);
      });
    },
    'meta': ['category', function (next, data) {
      connection.query('SELECT * FROM ' + tablePrefix + 'options WHERE option_name = "cat_meta_key_' + data.category.id + '"', function (err, rows) {
        if (err) {
          return next(err);
        }
        if (!rows.length) {
          return next();
        }
        var meta = PHPUnserialize.unserialize( rows[0].option_value);
        data.category.meta = {
          title: meta.page_title,
          keywords: meta.metakey,
          description: meta.description
        };
        data.category.save(next);
        //next(null, rows[0]);
      });
    }],
    'save': ['category', 'rootCategory', 'term', function (next, data) {
      var category = data.category,
        parent = parseInt(item.parent);

      category.title = data.term.name;
      category.alias = data.term.slug;
      category.description = item.description;
      category.parentId = !parent ? data.rootCategory._id : categoryRefId[parent]._id;
      if (parent) {
        category.parentAlias = categoryRefId[parent].alias;
      }
      category.markModified('parentId');

      if (wCategories[parent]) {
        category._w = ++wCategories[parent];
      } else {
        category._w = wCategories[parent] = 1;
      }
      console.info('Import category', id, 'parent', parent, 'w', category._w);
      category.save(function (err, category) {
        if (err) return next(err);
        categoryRefId[id] = category;
        next();
      });
    }],
    'saveImage': ['category', function (next, data) {
      connection.query('SELECT * FROM ' + tablePrefix + 'options WHERE option_name = "z_taxonomy_image' + id + '"', function (err, rows) {
        if (err || !rows.length) {
          return next(err);
        }
        data.category.files = [];
        var images = [{
          guid: rows[0].option_value,
          is_main: true
        }];
        async.eachSeries(images, _.partial(saveCategoryFile, site, data.category), function (err) {
          if (err) return next(err);
          data.category.save(next);
        });
      });
    }]
  }, next);
};

async.auto({
  'mongoConnection': function (next) {
    app.log.debug('Connecting to mongodb...');
    mongoose.connect(app.config.get('mongodb'), next);
    mongoose.connection.on('error', function (err) {
      console.log(err);
    });
    mongoose.set('debug', false);
  },
  'connection': function (next) {
    var connection = mysql.createConnection({
      host: 'mistinfo.com',
      port: 3310,
      user: 'remote',
      password: 'gfhjkm666',
      database: 'vvslob_android'
    });
    connection.connect();
    next(null, connection);
  },
  'site': ['mongoConnection', function (next) {
    grid = new Grid(mongoose.connection.db, 'fs');
    app.models.sites.findOne({domain: siteDomain}, function (err, data) {
      if (!data) {
        data = new app.models.sites({domain: siteDomain});
      }
      data.save(function (err, site) {
        next(err, site);
      });
    });
  }],
  'categories': ['connection', function (next, data) {
    data.connection.query('SELECT * FROM ' + tablePrefix + 'term_taxonomy WHERE taxonomy = "category" ORDER BY parent', function (err, rows, fields) {
      if (err) throw err;

      async.eachSeries(rows, _.partial(saveCategory, data.site, data.connection), next);
    });
  }],
  'getPosts': ['categories', 'connection', function (next, data) {
    data.connection.query('SELECT * FROM ' + tablePrefix + 'posts WHERE post_status = "publish" AND post_type = "post" OR post_type = "page"', function (err, rows, fields) {
      if (err) throw err;

      async.eachSeries(rows, _.partial(saveItem, data.site, data.connection), next);
    });
  }]
}, function (err, data) {

  if (err) {
    console.info(err);
  }

  data.connection.end();
  mongoose.connection.close(function (err) {
    app.log.debug('Mongodb connection successfully closed');
  });
});