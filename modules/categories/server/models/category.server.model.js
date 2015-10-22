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
  expenses: function() {
      // many-to-one
    return this.hasMany('Expense', 'category_id');
  },
  user: function() {
    // many-to-one
    return this.belongsTo('User', 'user_id');
  }

});

module.exports = bookshelf.model('Category', Category);