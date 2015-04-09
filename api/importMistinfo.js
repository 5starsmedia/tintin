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

var categoriesId2_Id = {};
var brandsId2_Id = {};

var saveItem = function(site, connection, item, next) {
  var id = parseInt(item.id);
  app.models.products.findOne({ id: id }, function(err, product) {
    if (!product) {
      product = new app.models.products({ id: id, site: { _id: site._id } });
    }
    product.title = item.title;
    product.body = item.description;
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
    product.category = {
      _id: categoriesId2_Id[item.category_id]
    };
    product.brand = {
      _id: brandsId2_Id[item.brand_id]
    };

    product.save(function (err){
      if (err) return next(err);
      connection.query('SELECT * FROM com_ecommerce_products_images WHERE product_id = ' + id, function (err, rows, fields) {
        if (err) throw err;
        product.files = [];
        async.each(rows, _.partial(saveFile, site, product), function(err, data) {
          if (err) return next(err);
          product.save(next);
        });
      });
    });
  });
};

var saveCategoryItem = function(site, connection, item, next) {
  var id = parseInt(item.id);
  app.models.productCategories.findOne({ id: id }, function(err, category) {
    if (!category) {
      category = new app.models.productCategories({ id: id, site: { _id: site._id } });
    }
    category.title = item.title;
    category.isPublished = true;

    category.save(function (err){
      if (err) return next(err);
      categoriesId2_Id[id] = category._id;
      next();
    });
  });
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
      brandsId2_Id[id] = brand._id;
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
            setExpr.collectionName = 'products';
            setExpr.resourceId = product._id;
            app.models.files.update({_id: file._id}, {
              $set: setExpr
            }, next);
          });
        }]
      }, next);
    });
  });
}

var siteId = 849,
  siteDomain = 'seasons.5stars.link';
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
  'getCategories': ['connection', 'mongoConnection', function(next, data) {
    data.connection.query('SELECT * FROM com_ecommerce_categories AS p LEFT JOIN com_ecommerce_categories_locale AS pl ON '+
                          ' p.id = pl.id WHERE lft > 1 AND pl.lang_id = 1 AND site_id = ' + siteId +
                          ' ORDER BY p.lft', function (err, rows, fields) {
      if (err) throw err;
      async.each(rows, _.partial(saveCategoryItem, data.site, data.connection), next);
    });
  }],
  'getBrands': ['connection', 'mongoConnection', function(next, data) {
    data.connection.query('SELECT * FROM com_ecommerce_brands '+
                          'WHERE site_id = ' + siteId, function (err, rows, fields) {
      if (err) throw err;
      async.each(rows, _.partial(saveBrandItem, data.site, data.connection), next);
    });
  }],
  'getProducts': ['connection', 'mongoConnection', 'getCategories', 'getBrands', function(next, data) {
    data.connection.query('SELECT * FROM com_ecommerce_products AS p LEFT JOIN com_ecommerce_products_locale AS pl ON '+
                          ' p.id = pl.id WHERE site_id = ' + siteId, function (err, rows, fields) {
      if (err) throw err;
      async.each(rows, _.partial(saveItem, data.site, data.connection), next);
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