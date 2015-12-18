'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    account: {
        _id: mongoose.Schema.Types.ObjectId
    },

    products: [
        {
            _id: mongoose.Schema.Types.ObjectId,
            title: String,

            price: {type: Number, required: true, default: 0},
            code: String,

            coverFile: {
                _id: mongoose.Schema.Types.ObjectId,
                title: String
            }
        }
    ]
}, {
    strict: true,
    safe: true,
    collection: 'wishlists'
});

schema.index({'account._id': 1});

module.exports = mongoose.model('Wishlist', schema);