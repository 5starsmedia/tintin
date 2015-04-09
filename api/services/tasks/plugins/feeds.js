'use strict';

exports['feed.publish'] = function (app, msg, next) {
  app.services.feed.publish(msg.body.accountId, {
    feedType: msg.body.feedType,
    resourceId: msg.body.resourceId,
    resourceInfo: msg.body.resourceInfo,
    collectionName: msg.body.collectionName
  }, next);
};

exports['db.advices.insert'] = function (app, msg, next) {
  app.models.advices.findById(msg.body._id, 'account._id', function (err, advice) {
    if (err) { return next(err); }
    app.services.feed.publish(advice.account._id, {
      feedType: 'advice',
      resourceId: advice._id,
      collectionName: 'advices'
    }, next);
  });
};

exports['db.blogs.update'] = function (app, msg, next) {
  app.models.blogs.findById(msg.body._id, 'account._id published addedToFeed', function (err, blog) {
    if (err) { return next(err); }
    if (!blog || !blog.published || blog.addedToFeed) { return next(); }
    app.services.feed.publish(blog.account._id, {
      feedType: 'blog',
      resourceId: blog._id,
      collectionName: 'blogs'
    }, function (err) {
      if (err) { return next(err); }
      blog.addedToFeed = true;
      blog.save(next);
    });
  });
};

exports['db.strainReviews.update'] = function (app, msg, next) {
  app.models.strainReviews.findById(msg.body._id, 'account._id published addedToFeed', function (err, strainReview) {
    if (err) { return next(err); }
    if (!strainReview || !strainReview.published || strainReview.addedToFeed) { return next(); }
    app.services.feed.publish(strainReview.account._id, {
      feedType: 'strainReview',
      resourceId: strainReview._id,
      collectionName: 'strainReviews'
    }, function (err) {
      if (err) { return next(err); }
      strainReview.addedToFeed = true;
      strainReview.save(next);
    });
  });
};

