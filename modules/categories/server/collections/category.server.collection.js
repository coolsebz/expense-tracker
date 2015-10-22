'use strict';

var path      = require('path'),
    bookshelf = require(path.resolve('./config/lib/bookshelf'));


require(path.resolve('./modules/categories/server/models/category.server.model.js'));

var Categories = bookshelf.Collection.extend({
	model: bookshelf.model('Category')
});

module.exports = bookshelf.collection('Categories', Categories);