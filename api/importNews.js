var mysql = require('mysql'),
  _ = require('lodash'),
  async = require('async'),
  moment = require('moment'),
  mongoose = require('mongoose'),
  request = require('request'),
  imageSize = require('image-size'),
  htmlToText = require('html-to-text'),
  Tokenizer = require('sentence-tokenizer'),
  mime = require('mime');
var url = require('url');
var http = require('http');
var grid;

var Grid = mongoose.mongo.Grid;

var siteId = 3,
  siteDomain = 'localhost',
  users = {};

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

/*var getComments = function() {
  var id = 201845,
    title = "Навколо посади головлікаря Вінницького “шкірвену” знову скандал, тепер — сексуальний",
    url = 'http://vinnitsaok.com.ua/2015/07/08/201845';

  request.post({
    url:'http://c1n1.hypercomments.com/api/comments',
    form: {
      data: JSON.stringify({
        "stream": "streamstart",
        "widget_id": 15685,
        "href": url,
        "xid": id,
        "title": title,
        "limit": 20,
        "filter": "new",
        "reverse": true,
        "hypertext": true
      }),
      host: 'http://vinnitsaok.com.ua'
    }
  }, function(err, httpResponse, body) {
    var data = JSON.parse(body),
      comments = JSON.parse(data.data[1]).comments;
    console.info(comments);
  });
};
getComments();*/

var categories = [], wCategories = {};
var saveCategory = function (site, connection, item, next) {
  var id = parseInt(item.id);

  async.auto({
    'locale': function (next) {
      connection.query('SELECT * FROM com_news_categories_locale WHERE id = ' + id, function (err, rows) {
        if (err) {
          return next(err);
        }
        next(null, rows[0]);
      });
    },
    'category': function (next) {
      app.models.categories.findOne({id: id, 'site._id': site._id}, function (err, category) {
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
      app.models.categories.findOne({parentId: null, 'site._id': site._id}, function (err, node) {
        if (err) return next(err);

        if (!node) {
          node = new app.models.categories();
          node.title = 'root';
          node.removed = Date.now();
          node.site = {
            _id: site._id,
            domain: site.domain
          };
          node.save(function (err) {
            if (err) return next(err);
            next(undefined, node);
          });
          return;
        }
        next(undefined, node);
      });
    },
    'save': ['category', 'rootCategory', 'locale', function (next, data) {
      var category = data.category;

      var parent = _.find(categories, function(itm) {
        return itm.lft < item.lft && itm.rgt > item.rgt && itm.depth == item.depth - 1;
      });

      if (data.locale) {
        category.title = data.locale.title;
        category.isPublished = true;
        category.description = data.locale.description;
      }
      category.parentId = !parent ? data.rootCategory._id : parent._id;
      category.markModified('parentId');

      if (wCategories[parent]) {
        category._w = ++wCategories[parent];
      } else {
        category._w = wCategories[parent] = 1;
      }
      console.info('Import category', id);
      category.save(function (err, category) {
        if (err) return next(err);

        item._id = category._id;
        categories.push(item);
        next();
      });
    }]
  }, next);
};


var savePost = function (site, connection, item, next) {
  var id = parseInt(item.id),
    categoryId = item.category_id ? parseInt(item.category_id) : null;

  if (!categoryId) {
    console.info('Without category', id)
    return next();
  }
  async.auto({
    'locale': function (next) {
      connection.query('SELECT * FROM com_news_posts_locale WHERE id = ' + id, function (err, rows) {
        if (err) {
          return next(err);
        }
        next(null, rows[0]);
      });
    },
    'tags': function (next) {
      connection.query('SELECT * FROM com_news_tags AS t LEFT JOIN com_news_posts_ref_tags AS rf ON t.id = rf.tag_id WHERE post_id = ' + id, function (err, rows) {
        if (err) {
          return next(err);
        }
        next(null, rows);
      });
    },
    'category': function (next) {
      app.models.categories.findOne({id: categoryId, 'site._id': site._id}, next);
    },
    'post': function (next) {
      app.models.posts.findOne({id: id, 'site._id': site._id}, next);
    },
    'tizer': ['locale', function(next, data) {
      var tokenizer = new Tokenizer('Chuck'),
        text = htmlToText.fromString(data.locale.body, { wordwrap: 120 });
      tokenizer.setEntry(text || '');
      var sentences = tokenizer.getSentences(),
        tizer = '', n = 0;

      while (tizer.length < 150 && sentences[n]) {
        tizer += sentences[n++];
      }

      next(null, tizer)
    }],
    'body': ['locale', function(next, data) {
      var body = data.locale.body || '';
      body = body.replace(/(<a\s[^>]+>).*(<img\s[^>]+>).*(<\/a>)+/gi, '$2');
      body = body.replace('<img title="Більше..." src="http://vinnitsaok.com.ua/wp-includes/js/tinymce/plugins/wordpress/img/trans.gif" alt="" />', '');
      body = body.replace('<img src="http://vinnitsaok.com.ua/wp-includes/images/smilies/icon_smile.gif" alt=":)" />', '');
      next(null, body)
    }],
    'getUrlFromBody': ['body', function(next, data) {
      var m, urls = [], isFirst = true,
        rex = /<img[^>]+src="(http:\/\/[^">]+)"/g,
        rexLink = /<a[^>]+href="(http:\/\/v\-a[^">]+)"/g;

      while (m = rex.exec(data.body)) {
        urls.push(m[1]);
      }
      next(null, urls);
    }],
    'save': ['category', 'post', 'tizer', 'body', 'locale', 'tags', function (next, data) {
      var post = data.post || new app.models.posts({
          id: id, site: {
            _id: site._id,
            domain: site.domain
          }
        });

      post.postType = 'news';
      post.title = data.locale.title;
      post.body = data.body;
      post.tizer = data.tizer;
      post.category = data.category;
      post.isTop = item.is_top;
      post.isHighlight = item.is_highlight;
      post.isInterview = item.is_interview;
      post.isEditorChoose = item.is_editor_choose;
      post.isAdvertising = item.is_adv;
      post.isPoliticalAdvertising = item.is_polit_adv;
      //post.is_poll = item.is_poll;
      //post.poll_id = item.poll_id;
      post.status = item.status;
      post.isAllowComments = item.is_allow_comments;
      post.ownPhoto = item.own_photo;
      post.viewsCount = item.hits;
      post.commentsCount = item.comments_count;
      post.source = item.source;
      post.photoSource = item.photo_source;
      post.modifyDate = item.updated_at;
      post.createDate = item.created_at;
      post.publishedDate = item.publish_date;
      post.tags = _.map(data.tags, function(item) {
        return _.pick(item, 'title');
      });

      if (item.user_id && users[item.user_id]) {
        post.account = users[item.user_id];
      }
      if (item.created_by && users[item.created_by]) {
        post.createdBy = _.pick(users[item.created_by], '_id', 'title', 'coverFile', 'imageUrl');
      }

      console.info('Import post', id);
      post.save(next);
    }],
    'images': function (next) {
      connection.query('SELECT * FROM com_news_images WHERE post_id = ' + id, next);
    },
    'parseImages': ['save', 'images', function (next, data) {
      var post = data.save[0];

      post.files = [];
      async.eachSeries(data.images[0], _.partial(saveFile, site, post, 'posts'), function (err) {
        if (err) return next(err);
        post.save(next);
      });
    }],
    'coverImage': ['save', 'parseImages', 'replaceImages', function (next, data) {
      var post = data.save[0];

      post.files = _.unique(post.files, function(item) {
        return item._id.toString();
      });
      if (!post.coverFile || !post.coverFile._id && post.files.length) {
        post.coverFile = post.files[0];
      }
      post.save(next);
    }],
    'replaceImages': ['save', 'getUrlFromBody', function (next, data) {
      var post = data.save[0];

      async.eachSeries(data.getUrlFromBody, _.partial(replaceImage, site, post), function (err) {
        if (err) return next(err);
        post.save(next);
      });
    }],
    'comments': ['save', function (next, data) {
      var post = data.save[0];
      next();
    }]
  }, next);
};

var replaceImage = function(site, post, url, next) {
  var shortUrl = url.replace('http://vinnitsaok.com.ua', '');

  saveFile(site, post, 'posts', { id: post.id, url: shortUrl, is_main: post.files.length == 0, size: 1 }, function(err, file) {
    if (err) return next(err);

    post.body = post.body.replace(url, '/api/files/' + file.saveToDB);
    next();
  });
};

var saveAccount = function (site, connection, item, next) {
  async.auto({
    'account': function (next) {
      app.models.accounts.findOne({ username: item.login }, next);
    },
    'save': ['account', function (next, data) {
      var account = data.account || new app.models.accounts({ username: item.login });

      account.pwd = item.password;
      account.salt = '';
      account.email = item.email;
      account.activated = item.is_active;
      account.createDate = item.created_at;
      account.activityDate = item.last_activity;
      account.title = item.firstname + ' ' + item.secondname;
      account.profile = {
        gender: item.gender,
        firstName: item.firstname,
        lastName: item.secondname,
        middleName: item.patronymic,
        dateOfBirth: item.birth_date
      };
      if (account.activated) {
        account.activationDate = item.created_at;
      }

      console.info('Import account', item.login);
      account.save(next);
    }],
    'settings': function (next) {
      connection.query('SELECT * FROM cms_users_settings WHERE user_id = ' + item.id, next);
    },
    'saveSettings': ['save', 'settings', function (next, data) {
      var account = data.save[0],
        settings = data.settings[0],
        avatar = null;

      users[item.id] = account;

      _.forEach(settings, function(setting) {
        switch (setting.setting) {
          case 'description':
            account.profile.about = setting.value;
            break;
          case 'vkontakte':
            account.profile.vkUrl = setting.value;
            break;
          case 'facebook':
            account.profile.facebookUrl = setting.value;
            break;
          case 'country':
            account.profile.location = setting.value;
            break;
          case 'photo':
            if (setting.value != '') {
              account.imageUrl = setting.value.replace('http://vinnitsaok.com.ua/uploads', '');
            }
            break;
          default:
            console.info('Setting', setting)
        }
      });
      account.save(next);
    }],
    'roles': function (next) {
      connection.query('SELECT * FROM cms_roles_ref_users WHERE site_id = ' + siteId + ' AND user_id = ' + item.id, next);
    },
    'saveRoles': ['save', 'roles', function (next, data) {
      var account = data.save[0],
        roles = data.roles[0];

      if (account.username == 'admin') {
        roles = [{ role_id: 3 }];
      }
      if (!roles.length) {
        account.removed = new Date();
      }
      account.roles = [];
      async.eachSeries(roles, _.partial(addRole, account), function (err, data) {
        if (err) return next(err);
        account.save(next);
      });
    }],
    'saveAvatar': ['saveSettings', 'save', function(next, data) {
      var account = data.save[0];

      if (!account.imageUrl) {
        return next();
      }
      account.files = [];
      saveFile(site, account, 'accounts', { id: item.id, url: account.imageUrl, is_main: true, size: 1 }, function() {
        account.imageUrl = null;
        account.save(next);
      })
    }]
  }, next);
};
var addRole = function(account, role, next) {
  var title = role.role_id == 3 ? 'Администратор' : 'Журналіст';

  if (role.role_id == 6) {
    return next();
  }

  async.auto({
    'role': function (next) {
      app.models.roles.findOne({title: title}, next);
    },
    'saveRole': ['role', function(next, data) {
      if (!data.role) {
        data.role = new app.models.roles({title: title});
      }
      data.role.save(next);
    }],
    'attach': ['saveRole', function(next, data) {
      account.roles.push(data.saveRole[0]);
      next();
    }]
  }, next);
};

var saveFile = function(site, post, collectionName, image, next) {

  app.models.files.findOne({ originalName: image.url }, function(err, file) {
    if (err) return next(err);
    if (!file) {
      file = new app.models.files({
        id: image.id,
        originalName: image.url,
        collectionName: collectionName,
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
          var link = 'http://vinnitsaok.com.ua/uploads' + image.url.replace('/uploads', '');
          if (image.url.substring(1, 11) == 'wp-content') {
            link = 'http://vinnitsaok.com.ua' + image.url;
          }
          var options = url.parse(link);

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
          var buffer = data.downloadImage, resultDimensions;

          try {
            resultDimensions = imageSize(buffer);
          } catch (e) {
            resultDimensions = {
              width: null,
              height: null
            };
            console.info(e, image)
          }
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
            setExpr.collectionName = collectionName;
            setExpr.resourceId = post._id;
            app.models.files.update({_id: file._id}, {
              $set: setExpr
            }, function(err) {
              if (err) { return next(err); }

              next(null, file._id)
            });
          });
        }]
      }, next);
    });
  });
};

async.auto({
  'mongoConnection': function(next) {
    app.log.debug('Connecting to mongodb...');
    mongoose.connect(app.config.get('mongodb'), next);
    mongoose.connection.on('error', function (err) {
      console.log(err);
    });
    mongoose.set('debug', false);
  },
  'connection': function (next) {
    var connection = mysql.createConnection({
      host: '5starsmedia.com.ua',
      port: 33101,
      user: 'admin',
      password: 'gjhndtqy777',
      database: 'collaborator_prod'
    });
    connection.connect();
    next(null, connection);
  },
  'site': ['mongoConnection', function(next) {
    grid = new Grid(mongoose.connection.db, 'fs', "w");
    app.models.sites.findOne({ domain: siteDomain }, function(err, data) {
      if (!data) {
        data = new app.models.sites({ domain: siteDomain });
      }
      data.save(function(err, site) {
        next(err, site);
      });
    });
  }],
  'getUsers': ['connection', 'mongoConnection', function(next, data) {
    data.connection.query('SELECT * FROM cms_users AS p ORDER BY id', function (err, rows, fields) {
      if (err) throw err;
      async.eachSeries(rows, _.partial(saveAccount, data.site, data.connection), next);
    });
  }],
  'deleteCategories': ['site', 'connection', 'mongoConnection', function(next, data) {
    app.models.categories.remove({ 'site._id': data.site._id }, next);
  }],
  'deletePosts': ['site', 'connection', 'mongoConnection', function(next, data) {
    app.models.posts.remove({ 'site._id': data.site._id }, next);
  }],
  'getCategories': ['deleteCategories', 'connection', 'mongoConnection', function(next, data) {
    data.connection.query('SELECT * FROM com_news_categories AS p WHERE site_id = ' + siteId + ' AND lft > 1 ORDER BY p.lft', function (err, rows, fields) {
      if (err) throw err;
      async.eachSeries(rows, _.partial(saveCategory, data.site, data.connection), next);
    });
  }],
  'getNews': ['deletePosts', 'getUsers', 'connection', 'mongoConnection', function(next, data) {
    data.connection.query('SELECT COUNT(*) AS cnt FROM com_news_posts WHERE site_id = ' + siteId, function (err, rows, fields) {
      if (err) throw err;

      var count = 10,
        page = 0,
        pages = Math.ceil(rows[0].cnt / 10);

      async.whilst(
        function () { return page <= pages; },
        function (callback) {
          page++;
          console.info('Load page', page);

          data.connection.query('SELECT * FROM com_news_posts WHERE site_id = ' + siteId + ' ORDER BY id DESC LIMIT ' + (page - 1) * count + ',' + count, function (err, rows, fields) {
            if (err) throw err;

            async.each(rows, _.partial(savePost, data.site, data.connection), callback);
          });
        }, next);
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