'use strict';

module.exports = function () {
  return function (req, res, next) {
    if (req.auth.isGuest) {
      res.status(401).end();
    } else {
      next();
    }
  };
};
