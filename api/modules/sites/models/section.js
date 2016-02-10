'use strict';

var mongoose = require('mongoose'),
    autoIncrement = require("../../../models/plugin/autoincrement.js"),
    createdBy = require("../../../models/plugin/createdBy.js");

var schema = new mongoose.Schema({
    title: String,
    htmlCode: String,
    cssCode: String,
    scssCode: String,

    createDate: {type: Date, required: true, default: Date.now},
    removed: {type: Date},
    site: {
        _id: mongoose.Schema.Types.ObjectId,
        domain: String
    }
}, {
    strict: true,
    safe: true,
    collection: 'sections'
});

schema.index({createDate: 1});

module.exports = mongoose.model('Section', schema);
