'use strict';

var path      = require('path'),
    bookshelf = require(path.resolve('./config/lib/bookshelf'));


require(path.resolve('./modules/expenses/server/models/expense.server.model.js'));
require(path.resolve('./modules/users/server/models/user.server.model.js'));

var Category = bookshelf.Model.extend({
  tableName: 'categories',
  hasTimestamps: true,
  
  // id: {
  //   type: 'increments',
  //   nullable: false,
  //   primary: true
  // },
  // created_at: {
  //   type: 'datetime', 
  //   nullable: false 
  // },
  // updated_at: {
  //   type: 'datetime', 
  //   nullable: true 
  // },
  // color: {
  //   type: 'string',
  //   nullable: false
  // },
  // name: {
  //   type: 'string',
  //   nullable: false
  // },
  expense: function() {
      // many-to-one
      this.hasMany('Expense');
  },
  user: function() {
    // many-to-one
    this.belongsTo('User');
  }

});

module.exports = bookshelf.model('Category', Category);