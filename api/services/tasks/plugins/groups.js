'use strict';

var async = require('async');

exports['db.groups.insert'] = function (app, msg, next) {
  function updateFile(file, group, next) {
    if (!file || !file._id || !file.isTemp) {
      return next();
    }
    file.isTemp = false;
    file.collectionName = 'groups';
    file.resourceId = group._id;
    file.refs = [{collectionName: 'groups', resourceId: group._id, title: group.title}];
    file.save(next);
  }

  async.auto({
    group: function (next) {
      app.models.groups.findById(msg.body._id, function (err, group) {
        if (err) { return next(err); }
        next(null, group);
      });
    },
    coverFile: ['group', function (next, data) {
      if (!data.group.coverFile || !data.group.coverFile._id) {
        return next();
      }
      app.models.files.findById(data.group.coverFile._id, next);
    }],
    updateCoverFile: ['group', 'coverFile', function (next, data) {
      updateFile(data.coverFile, data.group, next);
    }],
    headerFile: ['group', function (next, data) {
      if (!data.group.headerFile || !data.group.headerFile._id) {
        return next();
      }
      app.models.files.findById(data.group.headerFile._id, next);
    }],
    updateHeaderFile: ['group', 'headerFile', function (next, data) {
      updateFile(data.headerFile, data.group, next);
    }],
    account: ['group', function (next, data) {
      app.models.accounts.findById(data.group.account._id, function (err, account) {
        if (err) { return next(err); }
        next(null, account);
      });
    }]
  }, function (err, data) {
    if (err) { return next(err); }
    var groupMember = {
      account: data.account.toObject(),
      group: data.group.toObject(),
      memberType: 'owner'
    };

    app.models.groupMembers.create(groupMember, function (err) {
      if (err) { return next(err); }
      app.services.tasks.publish('stat.groups.membersCount', {_id: data.group._id});
      app.services.tasks.publish('stat.accounts.groups', {_id: data.account._id});
      next();
    });
  });
};

exports['db.groups.update'] = function (app, msg, next) {
  app.services.tasks.publish('stat.groupMembers.update', {_id: msg.body._id});
  next();
};

exports['stat.groupMembers.update'] = function (app, msg, next) {
  async.auto({
    group: function (next) {
      app.models.groups.findById(msg.body._id, function (err, group) {
        if (err) { return next(err); }
        next(null, group);
      });
    },
    update: ['group', function (next, data) {
      app.models.groupMembers.update(
        {'group._id': msg.body._id, removed: {$exists: false}},
        {$set: {'group': data.group.toObject()}},
        {multi: true},
        next
      );
    }]
  }, function (err) {
    if (err) { return next(err); }
    next();
  });
};

exports['stat.groups.membersCount'] = function (app, msg, next) {
  async.auto({
    group: function (next) {
      app.models.groups.findById(msg.body._id, next);
    },
    membersCount: function (next) {
      app.models.groupMembers.count({
        'group._id': msg.body._id,
        '$or': [{memberType: 'member'}, {memberType: 'admin'}, {memberType: 'moderator'}, {memberType: 'owner'}],
        removed: {$exists: false}
      }, next);
    },
    members: ['membersCount', function (next, data) {
      app.models.groupMembers.update(
        {'group._id': msg.body._id, removed: {$exists: false}},
        {$set: {'group.membersCount': data.membersCount}},
        {multi: true},
        next
      );
    }]
  }, function (err, data) {
    if (err) { return next(err); }
    data.group.membersCount = data.membersCount;
    data.group.save(next);
  });
};

exports['stat.groups.photosCount'] = function (app, msg, next) {
  app.models.files.count({
    'refs.resourceId': msg.body._id,
    'refs.collectionName': 'groups',
    removed: {$exists: false}
  }, function (err, count) {
    if (err) { return next(err); }
    app.models.groups.update({_id: msg.body._id}, {$set: {'photosCount': count}}, next);
  });
};
