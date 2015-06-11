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
var grid;


var app = {};
app.log = require('./log.js');
app.config = require('./config.js');
app.models = require('./models');
var PostsModule = require('./modules/posts'),
  CommentsModule = require('./modules/comments'),
  KeywordsModule = require('./modules/keywords'),
  EcommerceModule = require('./modules/ecommerce'),
  UploadsModule = require('./modules/uploads'),
  MenuModule = require('./modules/menu'),
  WikiModule = require('./modules/wiki'),
  AdsModule = require('./modules/ads'),
  UsersModule = require('./modules/users'),
  SitesModule = require('./modules/sites'),
  SitemapModule = require('./modules/sitemap');

app.modules = {
  posts: new PostsModule(app),
  comments: new CommentsModule(app),
  keywords: new KeywordsModule(app),
  ecommerce: new EcommerceModule(app),
  uploads: new UploadsModule(app),
  menu: new MenuModule(app),
  wiki: new WikiModule(app),
  ads: new AdsModule(app),
  users: new UsersModule(app),
  sites: new SitesModule(app),
  sitemap: new SitemapModule(app),

  each: function(callFunc) {
    _.forEach(app.modules, function(obj, name) {
      if (typeof obj == 'object') {
        callFunc(obj);
      }
    });
  }
};
app.modules.each(function(moduleObj) {
  moduleObj.initModels();
});

var categoriesId2_Id = {};
var brandsId2_Id = {};

var saveItem = function(site, item, next) {
  var id = parseInt(item.id);
  app.models.posts.findOne({ id: id, 'site._id': site._id }, function(err, post) {
    if (!post) {
      post = new app.models.posts({ id: id, site: { _id: site._id } });
      post.postType = 'news';
    }

    post.title = item.title.uk;
    post.body = item.body.uk || ' ';
    post.source = item.source;
    post.photoSource = item.photo_source;
    post.status = item.status;
    post.published = item.status == 4;

    post.createDate = new Date(parseInt(item.created_at));
    post.publishedDate = new Date(parseInt(item.published_at));
    post.isAllowComments = item.is_allow_comments;
    post.isHighlight = item.is_highlight;
    post.isTop = item.is_top;
    post.isTop = item.is_highlight;
    post.viewsCount = item.hits;
    post.commentsCount = item.comments_count;
    post.ownPhoto = item.own_photo;
    post.isInterview = item.is_interview;

    post.attributes = {
      isEditorChoose: item.is_editor_choose,
      isAdv: item.is_adv,
      isPolitAdv: item.is_polit_adv,
      isInterview: item.is_interview,
      isPoll: item.is_poll,
      hasVideo: item.has_video
    };
    post.markModified('attributes');
    if (item.category_id) {
      var categoryId = parseInt(item.category_id);
      console.info(categoryId);
      post.category = {
        _id: categoriesId2_Id[categoryId]._id,
        title: categoriesId2_Id[categoryId].title,
        alias: categoriesId2_Id[categoryId].alias
      };
      if (categoriesId2_Id[categoryId].parentAlias == 'blogs') {
        post.isBlog = true;
      }
    }


    getApi('/news/' + id, {}, function(err, info) {
      if (err) { return next(err); }
      if (!info) {
        return next();
      }

      var images = [];
      if (info.tags) {
        post.tags = [];
        _.forEach(info.tags, function(tag) {
          post.tags.push({ title: tag.title });
        });
      }
      if (info.images) {
        post.files = [];
        _.forEach(info.images, function(image) {
          images.push(image);
        });
      }
      post.hasPhotoreport = (info.images && info.images.length > 3);
      post.markModified('attributes');

      post.save(function (err){
        if (err) return next(err);

         async.each(images, _.partial(saveFile, site, post), function(err, data) {
           if (err) return next(err);
           post.save(next);
         });
      });
    });
  });
};

function findParentId(item) {
  return _.find(categories, function(itm) {
    return (itm.lft < item.lft && itm.rgt > item.rgt && itm.depth == item.depth - 1);
  });
}
var saveCategoryItem = function(site, item, next) {
  var id = parseInt(item.id), parent;
  app.models.categories.findOne({ id: id, 'site._id': site._id }, function(err, category) {
    if (!category) {
      category = new app.models.categories({ id: id, site: { _id: site._id } });
    }
    category.title = (item.title || '').uk;
    //category.alias = item.url;
    if (!category.title) {
      category.title = '-';
    }
    category.isPublished = item.is_published;
    if (item.depth > 0 && (parent = findParentId(item))) {
      var parentId = parseInt(parent.id);
      category.parentId = categoriesId2_Id[parentId]._id;
    }
    category.save(function (err){
      if (err) return next(err);
      categoriesId2_Id[id] = category;
      next();
    });
  });
};

var saveFile = function(site, post, image, next) {
  app.models.files.findOne({ originalName: image.url }, function(err, file) {
    if (!file) {
      file = new app.models.files({
        id: image.id,
        originalName: image.url,
        collectionName: 'posts',
        resourceId: post._id,
        title: '-',
        contentType: '-',
        isImage: true,
        size: image.size
      });
    }
    file.save(function(err, file) {
      if (err) return next(err);
      if (image.is_main) {
        post.coverFile = {
          _id: file._id
        };
      }
      async.auto({
        'downloadImage': function(next) {
          var options = url.parse('http://vinnitsaok.com.ua/uploads' + image.url);

          http.get(options, function (response) {
            var chunks = [];
            response.on('data', function (chunk) {
              chunks.push(chunk);
            }).on('end', function() {
              var buffer = Buffer.concat(chunks);
              next(null, buffer);
            });
          });
        },
        'saveToDB': ['downloadImage', function(next, data) {
          var buffer = data.downloadImage;

          var resultDimensions = imageSize(buffer);
          post.files.push(file);
          grid.put(buffer, {
            'content_type': mime.lookup(file.originalName),
            'filename': file.originalName,
            'metadata': {width: resultDimensions.width, height: resultDimensions.height}
          }, function (err, res) {
            if (err) { return next(err); }
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

var siteDomain = 'vinnitsaok.5stars.link',
  apiEntryPoint = 'http://vinnitsaok.com.ua/api/rest.php',
  categories = [];

function getApi(url, options, callback) {
  options = options || {};
  options.method = options.method || 'GET';
  options.url = apiEntryPoint + url;

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(null, JSON.parse(body));
    } else {
      callback(error);
    }
  });
}
function walk(category) {
  var items = category.items;
  delete category.items;
  categories.push(category);
  if (items) {
    for (var i = 0; i < items.length; i++) {
      walk(items[i]);
    }
  }
}

var importCategories = false,
  deleteNews = true;

async.auto({
  'mongoConnection': function(next) {
    app.log.debug('Connecting to mongodb...');
    mongoose.connect(app.config.get('mongodb'), next);
    mongoose.connection.on('error', function (err) {
      console.log(err);
    });
    mongoose.set('debug', false);
  },
  'site': ['mongoConnection', function(next) {
    grid = new Grid(mongoose.connection.db, 'fs');
    app.models.sites.findOne({ domain: siteDomain }, function(err, data) {
      if (!data) {
        data = new app.models.sites({ domain: siteDomain });
      }
      data.save(function(err, site) {
        next(err, site);
      });
    });
  }],
  'deleteCategories': ['site', 'mongoConnection', function(next, data) {
    if (!importCategories) { return next(); }
    app.models.categories.remove({ 'site._id': data.site._id }, next);
  }],
  'getCategories': ['site', 'deleteCategories', 'mongoConnection', function(next, data) {
    getApi('/news/categories', {}, function(err, res) {
      if (err) { return next(err); }

      walk(res);

      async.eachLimit(categories, 1, _.partial(saveCategoryItem, data.site), next);
    });
  }],
  'deleteNews': ['site', 'mongoConnection', function(next, data) {
    if (!deleteNews) { return next(); }
    app.models.posts.remove({ 'site._id': data.site._id }, next);
  }],
  'getNews': ['site', 'getCategories', 'deleteNews', 'mongoConnection', function(next, data) {
    var pager = { page: 1, count: 525 };

    getApi('/news?count=' +  pager.count + '&page=' +  pager.page, {}, function(err, res) {
      if (err) { return next(err); }

      async.eachLimit(res.data, 1, _.partial(saveItem, data.site), next);
    });
  }]
}, function (err, data) {
  if (err) { console.info(err); }
  mongoose.connection.close(function (err) {
    app.log.debug('Mongodb connection successfully closed');
  });
});