'use strict';

exports ['get/accounts?_id'] = function (req, params, next) {
    var modifiers = [];
    if (!req.auth.isGuest && params._id.toString() === req.auth.account._id.toString()) {
        modifiers.push('owner');
    }
    next(null, modifiers);
};

exports['get/accounts'] = function (req, params, next) {
    var modifiers = [];
    next(null, modifiers);
};

exports ['put/accounts?_id'] = function (req, params, next) {
    var modifiers = [];
    if (!req.auth.isGuest && params._id.toString() === req.auth.account._id.toString()) {
        modifiers.push('owner');
    }
    next(null, modifiers);
};
