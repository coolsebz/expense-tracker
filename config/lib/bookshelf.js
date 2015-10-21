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

module.exports = bookshelf;