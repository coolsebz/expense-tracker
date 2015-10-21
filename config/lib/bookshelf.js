'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
  chalk = require('chalk'),
  path = require('path'),
  knex = require('knex')(config.postgresql),
  bookshelf = require('bookshelf')(knex);

  bookshelf.plugin('registry');
  bookshelf.plugin('virtuals');
  bookshelf.plugin('visibility');

  // bookshelf.knex.schema.dropTableIfExists('users');
  // bookshelf.knex.schema.dropTableIfExists('expenses');

  // bookshelf.knex.schema.createTable('users', function(table) {
  //   table.increments('id').primary();
  //   table.string('first_name').notNullable();
  //   table.string('last_name').notNullable();
  //   table.string('email').notNullable().unique();
  //   table.string('username').notNullable().unique();
  //   table.string('password').notNullable();
  //   table.string('salt').notNullable();
  //   table.string('profile_image_url').nullable();
  //   table.string('provider').notNullable();
  //   table.string('reset_password_token').nullable();
  //   table.datetime('reset_password_token').nullable();
  //   table.timestamps();
  // }).then(function() {
  //    // you now have a users table with a few columns.
  //    console.log(chalk.green('User Table generated'));
  // });

  // bookshelf.knex.schema.createTable('expenses', function(table) {
  //   table.increments('id').primary();
  //   table.float('value').notNullable();
  //   table.string('title').nullable();
  //   table.string('user_id').references('users.id');
  //   table.timestamps();
  // }).then(function() { 
  //    // you now have an expenses table with a few columns.
  //    console.log(chalk.green('Expenses Table generated'));
  // });

module.exports = bookshelf;