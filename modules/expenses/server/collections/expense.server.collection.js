'use strict';

var path      = require('path'),
    bookshelf = require(path.resolve('./config/lib/bookshelf'));


// require(path.resolve('./modules/users/server/models/user.server.model.js'));

var Expenses = bookshelf.Collection.extend({
	model: bookshelf.model('Expense')
});

module.exports = bookshelf.collection('Expenses', Expenses);