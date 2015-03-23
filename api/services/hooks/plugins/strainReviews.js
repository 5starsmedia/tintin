'use strict';

var async = require('async'),
  moment = require('moment');

function dateToString(dateStr) {
  return moment.utc(dateStr).format('YYYY-MM-DD');
}

exports['post.strainReviews'] = function (req, data, cb) {
  if (data.mode === 'self' && req.auth.account.profile) {
    data.dateOfBirth = req.auth.account.profile.dateOfBirth;
    data.gender = req.auth.account.profile.gender;
  }
  data['account.coverFile'] = req.auth.account.coverFile;
  req.app.models.strains.findById(data['strain._id'], function (err, strain) {
    if (err) { return cb(err); }
    data.strain = strain.toObject();

    if (data.published) {
      data.publishDate = new Date();
      data.publishDateStr = dateToString(data.publishDate);
    } else {
      data.publishDate = null;
      data.publishDateStr = null;
    }
    cb();
  });
};

exports['put.strainReviews'] = function (req, data, cb) {
  req.app.models.strainReviews.findById(data._id, 'publishDate', function (err, blog) {
    if (err) { return cb(err); }
    if (data.published) {
      data.publishDate = blog.publishDate || new Date();
      data.publishDateStr = dateToString(data.publishDate);
    }
    cb();
  });
};

exports['put.strainReviews.gender._id'] = function (req, data, cb) {
  req.app.models.genders.findById(req.body.gender._id, 'cssClass title', function (err, gender) {
    if (err) { return cb(err); }
    data['gender.cssClass'] = gender.cssClass;
    data['gender.title'] = gender.title;
    cb();
  });
};

exports['put.strainReviews.ageCategory._id'] = function (req, data, cb) {
  req.app.models.ageCategories.findById(req.body.ageCategory._id, 'cssClass title', function (err, ageCategory) {
    if (err) { return cb(err); }
    data['ageCategory.cssClass'] = ageCategory.cssClass;
    data['ageCategory.title'] = ageCategory.title;
    cb();
  });
};

exports['put.strainReviews.flavors'] = function (req, data, cb) {
  async.each(data.flavors, function (item, next) {
    req.app.models.strainFlavors.findById(item._id, 'cssClass title ', function (err, flavor) {
      req.app.models.strainFlavorCategories.findById(item['category._id'], 'title bgColor textColor',
        function (err, category) {
          item.cssClass = flavor.cssClass;
          item.title = flavor.title;
          item['category.title'] = category.title;
          item['category.bgColor'] = category.bgColor;
          item['category.textColor'] = category.textColor;
          console.log(item);
          console.log('flavor', item);
          next();
        }
      );
      if (err) { return next(err); }
    });
  }, cb);
};
