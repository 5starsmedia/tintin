'use strict';

exports['db.strainFlavorGroups.update'] = function (app, msg, cb) {
  app.models.strainFlavorGroups.findById(msg.body._id, 'title', function (err, strainFlavorGroup) {
    if (err) { return cb(err); }
    app.models.strainFlavors.update(
      {'group._id': msg.body._id},
      {'$set': {
        'group.title': strainFlavorGroup.title
      }},
      {multi: true},
      cb);
  });
};

exports['db.strainFlavorCategories.update'] = function (app, msg, cb) {
  app.models.strainFlavorCategories.findById(msg.body._id, 'title', function (err, strainFlavorCategory) {
    if (err) { return cb(err); }
    app.models.strainFlavors.update(
      {'category._id': msg.body._id},
      {'$set': {
        'category.title': strainFlavorCategory.title
      }},
      {multi: true},
      cb);
  });
};


exports['db.strainFlavors.update'] = exports['db.strainFlavors.insert'] = function (app, msg, cb) {
  app.models.strainFlavors.findById(msg.body._id, 'group category', function (err, strainFlavor) {
    if (err) { return cb(err); }
    app.models.strainFlavorCategories.findById(strainFlavor.category._id, 'title group textColor bgColor', function (err, strainFlavorCategory) {
      if (err) { return cb(err); }
      strainFlavor.group._id = strainFlavorCategory.group._id;
      strainFlavor.group.title = strainFlavorCategory.group.title;
      strainFlavor.category.title = strainFlavorCategory.title;
      strainFlavor.category.textColor = strainFlavorCategory.textColor;
      strainFlavor.category.bgColor = strainFlavorCategory.bgColor;
      strainFlavor.save(cb);
    });
  });
};
