'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  path = require('path'),
  bookshelf = require(path.resolve('./config/lib/bookshelf')),
  BPromise = require('bluebird'),
  crypto = require('crypto'),
  validator = require('validator'),
  generatePassword = require('generate-password'),
  owasp = require('owasp-password-strength-test');


/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function (property) {
  return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy email
 */
var validateLocalStrategyEmail = function (email) {
  return ((this.provider !== 'local' && !this.updated) || validator.isEmail(email));
};

var User = bookshelf.Model.extend({
    tableName: 'users',
    hasTimestamps: true,
    // parse: true,
    hidden: ['salt', 'password', 'provider'],
    initialize: function() {
      this.on('saving', this.beforeSave);
    },
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
    // first_name: {
    //   type: 'string',
    //   maxlength: 50
    // },
    // last_name: {
    //   type: 'string',
    //   maxlength: 50
    // },
    // email: {
    //   type: 'string',
    //   maxlength: 254,
    //   nullable: false,
    //   unique: true
    // },
    // username: {
    //   type: 'string',
    //   nullable: false,
    //   unique: true,
    //   maxlength: 254
    // },
    // password: {
    //   type: 'string',
    //   nullable: false
    // },
    // salt: {
    //   type: 'string',
    //   nullable: false
    // },
    // profile_image_url: {
    //     type: 'string',
    //     nullable: true
    // },
    // provider: {
    //     type: 'string',
    //     nullable: false
    // },
    // balance: {
    //   type: 'float',
    //   nullable: 'false'
    // }

    /* For the reset password token */
    // reset_password_token: {
    //     type: 'string',
    //     nullable: true
    // },
    // reset_password_expires: {
    //     type: 'datetime',
    //     nullable: true
    // },
    
    expenses: function(){
      // one-to-many
      return this.hasMany('Expense');
    },
    shared_expenses: function() {
      return this.belongsToMany('Expense', 'users_expenses', 'user_id');
    },
    categories: function() {
      // one-to-many
      return this.hasMany('Category');
    },

    // class like functions
    beforeSave: function(userModel, newUserModel, options) {
      return new BPromise.all([
        this.checkForPasswordChange(userModel, newUserModel, options)
      ]);
    },

    checkForPasswordChange: function(userModel, newUserModel, options) {
      if(userModel.attributes.password !== userModel._previousAttributes.password) {
        userModel.attributes.salt = crypto.randomBytes(16).toString('base64');
        userModel.attributes.password = this.hashPassword(userModel.attributes.salt, userModel.attributes.password);
      }

      return BPromise.resolve().bind(this);
    },

    authenticate: function() {
      return this.password === this.hashPassword(this.salt, this.password);
    },

    hashPassword: function(salt, password){
      if (salt && password) {
        return crypto.pbkdf2Sync(password, new Buffer(salt, 'base64'), 10000, 64).toString('base64');
      } else {
        return password;
      }
    },

    generateRandomPassphrase: function () {
      return new BPromise(function (resolve, reject) {
        var password = '';
        var repeatingCharacters = new RegExp('(.)\\1{2,}', 'g');

        // iterate until the we have a valid passphrase. 
        // NOTE: Should rarely iterate more than once, but we need this to ensure no repeating characters are present.
        while (password.length < 20 || repeatingCharacters.test(password)) {
          // build the random password
          password = generatePassword.generate({
            length: Math.floor(Math.random() * (20)) + 20, // randomize length between 20 and 40 characters
            numbers: true,
            symbols: false,
            uppercase: true,
            excludeSimilarCharacters: true,
          });

          // check if we need to remove any repeating characters.
          password = password.replace(repeatingCharacters, '');
        }

        // Send the rejection back if the passphrase fails to pass the strength test
        if (owasp.test(password).errors.length) {
          reject(new Error('An unexpected problem occured while generating the random passphrase'));
        } else {
          // resolve with the validated passphrase
          resolve(password);
        }
      });
    }   

});

module.exports = bookshelf.model('User', User);