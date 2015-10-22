'use strict';

var path      = require('path'),
    bookshelf = require(path.resolve('./config/lib/bookshelf'));


require(path.resolve('./modules/users/server/models/user.server.model.js'));

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

  user: function() {
      // many-to-one
      this.belongsTo('User');
  }
});

module.exports = bookshelf.model('Expense', Expense);