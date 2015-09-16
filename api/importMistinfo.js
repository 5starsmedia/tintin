var mysql = require('mysql'),
  _ = require('lodash'),
  async = require('async'),
  moment = require('moment'),
  mongoose = require('mongoose'),
  request = require('request'),
  imageSize = require('image-size'),
  mime = require('mime');
var url = require('url');
var http = require('http');
var Grid = require('gridfs-stream');

var app = {};
app.log = require('./log.js');
app.config = require('./config.js');
app.models = require('./models');

app.modules = {
  each: function(callFunc) {
    _.forEach(app.modules, function(obj, name) {
      if (typeof obj == 'object') {
        callFunc(obj);
      }
    });
  }
};

var modules = app.config.get('modules');
_.forEach(modules, function(moduleName) {
  var module = require('./modules/' + moduleName);
  app.modules[moduleName] = new module(app);
});
app.modules.each(function(moduleObj) {
  moduleObj.initModels();
});


var categoriesId2_Id = {};
var brandsId2_Id = {};

var saveItem = function(site, connection, item, next) {
  var id = parseInt(item.id);

  async.auto({
    'locale': function (next) {
      connection.query('SELECT * FROM com_ecommerce_products_locale WHERE lang_id = 2 AND id = ' + id, function (err, rows) {
        if (err) {
          return next(err);
        }
        next(null, rows[0]);
      });
    },
    'categories': function (next) {
      connection.query('SELECT * FROM com_ecommerce_products_categories WHERE product_id = ' + id, next);
    },
    'product': function (next) {
      app.models.products.findOne({ id: id }, next);
    },
    'save': ['product', 'locale', 'categories', function (next, data) {

      var product = data.product;
      if (!product) {
        product = new app.models.products({ id: id, site: { _id: site._id, domain: site.domain } });
      }
      product.title = data.locale.title || '-';
      product.body = data.locale.description;
      product.code = item.code;
      product.createDate = moment(item.created_at).toDate();
      product.price = parseFloat(item.price);
      product.isPublished = item.publish;
      product.isLatest = item.is_latest;
      product.isDiscount = item.is_discount;
      product.isCanOrder = item.can_order;
      product.isInStock = item.in_stock;
      product.isHit = item.hit;
      product.inStockCount = item.count;
      product.ordinal = item.order;

      _.forEach(data.categories[0], function(cat) {
        if (categoriesId2_Id[cat.category_id]) {
          var category = categoriesId2_Id[cat.category_id];
          product.category = {
            _id: category._id,
            title: category.title,
            alias: category.alias
          };
        }
      });
      if (item.brand_id) {
        product.brand = {
          _id: brandsId2_Id[item.brand_id]._id,
          title: brandsId2_Id[item.brand_id].title
        };
      }

      data.product = product;
      data.product.save(next);
    }],
    'files': ['product', 'save', function(next, data) {
      connection.query('SELECT * FROM com_ecommerce_products_images WHERE product_id = ' + id, function (err, rows, fields) {
        if (err) throw err;
        data.product.files = [];
        async.each(rows, _.partial(saveFile, site, data.product), function(err) {
          if (err) return next(err);
          if (data.product.files.length) {
            data.product.coverFile = data.product.files[0];
          }
          data.product.save(next);
        });
      });
    }]
  }, next);
};

var categories = [], wCategories = {};
var saveCategoryItem = function (site, connection, item, next) {
  var id = parseInt(item.id);

  async.auto({
    'locale': function (next) {
      connection.query('SELECT * FROM com_ecommerce_categories_locale WHERE lang_id = 2 AND id = ' + id, function (err, rows) {
        if (err) {
          return next(err);
        }
        next(null, rows[0]);
      });
    },
    'category': function (next) {
      app.models.productCategories.findOne({id: id, 'site._id': site._id}, function (err, category) {
        if (err) {
          return next(err);
        }
        if (!category) {
          category = new app.models.productCategories({id: id, site: {_id: site._id, domain: site.domain}});
        }
        next(null, category);
      });
    },
    'rootCategory': function (next) {
      app.models.productCategories.findOne({parentId: null, 'site._id': site._id}, function (err, node) {
        if (err) return next(err);

        if (!node) {
          node = new app.models.productCategories();
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
        categoriesId2_Id[item.id] = category;
        categories.push(item);
        next();
      });
    }]
  }, next);
};

var saveBrandItem = function(site, connection, item, next) {
  var id = parseInt(item.id);
  app.models.productBrands.findOne({ id: id }, function(err, brand) {
    if (!brand) {
      brand = new app.models.productBrands({ id: id, site: { _id: site._id } });
    }
    brand.title = item.title;
    brand.isPublished = true;

    brand.save(function (err){
      if (err) return next(err);
      brandsId2_Id[id] = brand;
      next();
    });
  });
};

var saveFile = function(site, product, image, next) {
  app.models.files.findOne({ originalName: image.image }, function(err, file) {
    if (!file) {
      file = new app.models.files({
        id: image.id,
        originalName: image.image,
        collectionName: 'products',
        resourceId: product._id,
        title: '-',
        contentType: '-',
        isImage: true,
        size: image.size
      });
    }
    file.save(function(err, file) {
      if (err) return next(err);
      if (image.is_main) {
        product.coverFile = {
          _id: file._id
        };
      }
      async.auto({
        'downloadImage': function(next) {
          var options = url.parse('http://mistinfo.com' + image.image);

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
          product.files.push(file);

          var gfs = Grid(mongoose.connection.db, mongoose.mongo);

          var options = {
            _id: mongoose.Types.ObjectId(),
            filename: file.originalName,
            mode: 'w',
            content_type: mime.lookup(file.originalName),
            metadata: {
              width: resultDimensions.width,
              height: resultDimensions.height
            }
          };
          var writeStream = gfs.createWriteStream(options);

          writeStream.on('finish', function() {
            if (err) { return next(err); }
            app.log.info('File uploaded');
            var setExpr = {
              width: resultDimensions.width,
              height: resultDimensions.height,
              storage: 'gridfs',
              storageId: options._id.toString(),
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
          writeStream.write(buffer);
          writeStream.end();
        }]
      }, next);
    });
  });
}

var siteId = 822, companyId = 6813,
  siteDomain = 'lgz.5stars.link';
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
      host: 'mistinfo.com',
      port: 3310,
      user: 'remote',
      password: 'gfhjkm666',
      database: 'davintoo_prod'
    });
    connection.connect();
    next(null, connection);
  },
  'site': ['mongoConnection', function(next) {
    app.models.sites.findOne({ domain: siteDomain }, function(err, data) {
      if (!data) {
        data = new app.models.sites({ domain: siteDomain });
      }
      data.allowLocales = [{ code: 'en_GB', title: 'English' }];
      console.info('site', data)
      data.save(function(err, site) {
        next(err, site);
      });
    });
  }],
  'deleteCategories': ['site', 'connection', 'mongoConnection', function(next, data) {
    console.info('deleteCategories')
    app.models.productCategories.remove({ 'site._id': data.site._id }, next);
  }],
  'deleteBrands': ['site', 'connection', 'mongoConnection', function(next, data) {
    console.info('deleteBrands')
    app.models.productBrands.remove({ 'site._id': data.site._id }, next);
  }],
  'deleteProducts': ['site', 'connection', 'mongoConnection', function(next, data) {
    console.info('deleteBrands')
    app.models.products.remove({ 'site._id': data.site._id }, next);
  }],
  'getCategories': ['deleteCategories', 'connection', 'mongoConnection', function(next, data) {
    console.info('getCategories')
    data.connection.query('SELECT * FROM com_ecommerce_categories AS p WHERE lft > 1 AND (company_id = ' + companyId +
      ' OR site_id = ' + siteId + ') ORDER BY p.lft', function (err, rows, fields) {
      if (err) throw err;
      async.eachLimit(rows, 1, _.partial(saveCategoryItem, data.site, data.connection), next);
    });
  }],
  'getBrands': ['deleteBrands', 'connection', 'mongoConnection', function(next, data) {
    console.info('getCategories')
    data.connection.query('SELECT * FROM com_ecommerce_brands '+
                          'WHERE site_id = ' + siteId, function (err, rows, fields) {
      if (err) throw err;
      async.each(rows, _.partial(saveBrandItem, data.site, data.connection), next);
    });
  }],
  'getProducts': ['connection', 'mongoConnection', 'deleteProducts', 'getCategories', 'getBrands', function(next, data) {
    console.info('getProducts')
    data.connection.query('SELECT * FROM com_ecommerce_products AS p WHERE  (company_id = ' + companyId + ' OR site_id = ' + siteId + ')', function (err, rows, fields) {
      if (err) throw err;
      async.eachLimit(rows, 1, _.partial(saveItem, data.site, data.connection), next);
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