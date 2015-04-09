'use strict';

exports['db.strainFlavorGroups.update'] = function (app, msg, cb) {
  app.models.strainFlavorGroups.findById(msg.body._id, 'title', function (err, strainFlavorGroup) {
    if (err) { return cb(err); }
    app.models.strainFlavorCategories.update(
      {'group._id': msg.body._id},
      {'$set': {
        'group.title': strainFlavorGroup.title
      }},
      {multi: true},
      cb);
  });
};

exports['db.strainFlavorCategories.update'] = exports['db.strainFlavorCategories.insert'] = function (app, msg, cb) {
  app.models.strainFlavorCategories.findById(msg.body._id, 'group', function (err, strainFlavorCategory) {
    if (err) { return cb(err); }
    app.models.strainFlavorGroups.findById(strainFlavorCategory.group._id, 'title', function (err, strainFlavorGroup) {
      if (err) { return cb(err); }
      strainFlavorCategory.group.title = strainFlavorGroup.title;
      strainFlavorCategory.save(cb);
    });
  });
};
