'use strict';

var path      = require('path'),
    bookshelf = require(path.resolve('./config/lib/bookshelf'));


require(path.resolve('./modules/users/server/models/user.server.model.js'));

var Expense = bookshelf.Model.extend({
  tableName: 'expenses',
  hasTimestamps: true,
  
  id: {
    type: 'increments',
    nullable: false,
    primary: true
  },
  created_at: {
    type: 'datetime', 
    nullable: false 
  },
  updated_at: {
    type: 'datetime', 
    nullable: true 
  },
  value: {
    type: 'float',
    nullable: false
  },
  title: {
    type: 'string',
    maxlength: 50,
    nullable: true
  },
  user: function() {
      // many-to-one
      this.belongsTo('User');
  }
});

module.exports = bookshelf.model('Expense', Expense);