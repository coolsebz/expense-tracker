'use strict';

var path      = require('path'),
    bookshelf = require(path.resolve('./config/lib/bookshelf'));


require(path.resolve('./modules/users/server/models/user.server.model.js'));
require(path.resolve('./modules/categories/server/models/category.server.model.js'));

var Expense = bookshelf.Model.extend({
  tableName: 'expenses',
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
  // amount: {
  //   type: 'float',
  //   nullable: false
  // },
  // type: {
  //   type: 'string',
  //   nullable: false
  // },
  // title: {
  //   type: 'string',
  //   maxlength: 50,
  //   nullable: true
  // },
  // receipt_date: {
  //   type:'datetime',
  //   default: Date.now
  // },
  category: function() {
    // many-to-one
    this.belongsTo('Category');
  },
  user: function() {
      // many-to-one
      this.belongsTo('User');
  },
  shared_users: function() {
    // many-to-many with a bridge table 'users_expenses'
    this.belongsToMany('User', 'users_expenses', 'expense_id');
  }
});

module.exports = bookshelf.model('Expense', Expense);