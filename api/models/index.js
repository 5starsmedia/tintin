/**
 * @module models
 * @copyright 2015 5starsmedia.com.ua
 */
'use strict';

exports.logRecords = require('./core/logRecords.js');
exports.sites = require('./core/site.js');
exports.accounts = require('./core/account.js');

exports.genders = require('./user/gender.js');

exports.posts = require('./post.js');
exports.categories = require('./category.js');
exports.comments = require('./comments.js');

exports.queueMessages = require('./queueMessages.js');
exports.sequences = require('./sequences.js');

exports.files = require('./files.js');
exports.fileChunks = require('./fileChunks.js');

exports.visaDates = require('./visaDate.js');

exports.adsCodes = require('./adsCodes.js');

exports.products = require('./product/product.js');
exports.productTypes = require('./product/productType.js');
exports.productFields = require('./product/productField.js');
exports.productBrands = require('./product/productBrand.js');
exports.productCategories = require('./product/productCategory.js');
exports.productCurrencies = require('./product/productCurrency.js');

exports.menuElements = require('./menu/menuElements.js');

exports.keywordProjects = require('./keywords/keywordProject.js');
exports.keywordGroups = require('./keywords/keywordGroup.js');
