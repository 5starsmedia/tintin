/**
 * Copyright 2015 5starsmedia.com.ua
 *
 * lib/server/models/core/account.js
 * Account mongoose model
 */
'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    id: {type: Number, required: true, default: 0},

    // Назва
    title: {type: String, required: true},
    alias: String,

    createDate: {type: Date, required: true, default: Date.now},

    site: {
      _id: mongoose.Schema.Types.ObjectId,
      domain: String
    }
}, {
    strict: true,
    safe: true,
    collection: 'categories'
});

module.exports = mongoose.model('Category', schema);
