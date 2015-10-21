'use strict';

var path      = require('path'),
    bookshelf = require(path.resolve('./config/lib/bookshelf'));


// require(path.resolve('./modules/users/server/models/user.server.model.js'));

var Users = bookshelf.Collection.extend({
	model: bookshelf.model('User')
});

module.exports = bookshelf.collection('Users', Users);