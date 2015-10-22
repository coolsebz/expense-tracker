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
      return this.hasMany('Expense');
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




// 'use strict';

// /**
//  * Module dependencies.
//  */
// var mongoose = require('mongoose'),
//   path = require('path'),
//   bookshelf = require(path.resolve('./config/lib/bookshelf')),
//   Schema = mongoose.Schema,
//   crypto = require('crypto'),
//   validator = require('validator'),
//   generatePassword = require('generate-password'),
//   owasp = require('owasp-password-strength-test');

// /**
//  * A Validation function for local strategy properties
//  */
// var validateLocalStrategyProperty = function (property) {
//   return ((this.provider !== 'local' && !this.updated) || property.length);
// };

// /**
//  * A Validation function for local strategy email
//  */
// var validateLocalStrategyEmail = function (email) {
//   return ((this.provider !== 'local' && !this.updated) || validator.isEmail(email));
// };

// /**
//  * User Schema
//  */
// var UserSchema = new Schema({
//   firstName: {
//     type: String,
//     trim: true,
//     default: '',
//     validate: [validateLocalStrategyProperty, 'Please fill in your first name']
//   },
//   lastName: {
//     type: String,
//     trim: true,
//     default: '',
//     validate: [validateLocalStrategyProperty, 'Please fill in your last name']
//   },
//   displayName: {
//     type: String,
//     trim: true
//   },
//   email: {
//     type: String,
//     unique: true,
//     lowercase: true,
//     trim: true,
//     default: '',
//     validate: [validateLocalStrategyEmail, 'Please fill a valid email address']
//   },
//   username: {
//     type: String,
//     unique: 'Username already exists',
//     required: 'Please fill in a username',
//     lowercase: true,
//     trim: true
//   },
//   password: {
//     type: String,
//     default: ''
//   },
//   salt: {
//     type: String
//   },
//   profileImageURL: {
//     type: String,
//     default: 'modules/users/client/img/profile/default.png'
//   },
//   provider: {
//     type: String,
//     required: 'Provider is required'
//   },
//   providerData: {},
//   additionalProvidersData: {},
//   roles: {
//     type: [{
//       type: String,
//       enum: ['user', 'admin']
//     }],
//     default: ['user'],
//     required: 'Please provide at least one role'
//   },
//   updated: {
//     type: Date
//   },
//   created: {
//     type: Date,
//     default: Date.now
//   },
//   /* For reset password */
//   resetPasswordToken: {
//     type: String
//   },
//   resetPasswordExpires: {
//     type: Date
//   }
// });

// /**
//  * Hook a pre save method to hash the password
//  */
// UserSchema.pre('save', function (next) {
//   if (this.password && this.isModified('password')) {
//     this.salt = crypto.randomBytes(16).toString('base64');
//     this.password = this.hashPassword(this.password);
//   }

//   next();
// });

// /**
//  * Hook a pre validate method to test the local password
//  */
// UserSchema.pre('validate', function (next) {
//   if (this.provider === 'local' && this.password && this.isModified('password')) {
//     var result = owasp.test(this.password);
//     if (result.errors.length) {
//       var error = result.errors.join(' ');
//       this.invalidate('password', error);
//     }
//   }

//   next();
// });

// /**
//  * Create instance method for hashing a password
//  */
// UserSchema.methods.hashPassword = function (password) {
//   if (this.salt && password) {
//     return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64).toString('base64');
//   } else {
//     return password;
//   }
// };

// /**
//  * Create instance method for authenticating user
//  */
// UserSchema.methods.authenticate = function (password) {
//   return this.password === this.hashPassword(password);
// };

// /**
//  * Find possible not used username
//  */
// UserSchema.statics.findUniqueUsername = function (username, suffix, callback) {
//   var _this = this;
//   var possibleUsername = username.toLowerCase() + (suffix || '');

//   _this.findOne({
//     username: possibleUsername
//   }, function (err, user) {
//     if (!err) {
//       if (!user) {
//         callback(possibleUsername);
//       } else {
//         return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
//       }
//     } else {
//       callback(null);
//     }
//   });
// };

// /**
// * Generates a random passphrase that passes the owasp test.
// * Returns a BPromise that resolves with the generated passphrase, or rejects with an error if something goes wrong.
// * NOTE: Passphrases are only tested against the required owasp strength tests, and not the optional tests.
// */
// UserSchema.statics.generateRandomPassphrase = function () {
//   return new BPromise(function (resolve, reject) {
//     var password = '';
//     var repeatingCharacters = new RegExp('(.)\\1{2,}', 'g');

//     // iterate until the we have a valid passphrase. 
//     // NOTE: Should rarely iterate more than once, but we need this to ensure no repeating characters are present.
//     while (password.length < 20 || repeatingCharacters.test(password)) {
//       // build the random password
//       password = generatePassword.generate({
//         length: Math.floor(Math.random() * (20)) + 20, // randomize length between 20 and 40 characters
//         numbers: true,
//         symbols: false,
//         uppercase: true,
//         excludeSimilarCharacters: true,
//       });

//       // check if we need to remove any repeating characters.
//       password = password.replace(repeatingCharacters, '');
//     }

//     // Send the rejection back if the passphrase fails to pass the strength test
//     if (owasp.test(password).errors.length) {
//       reject(new Error('An unexpected problem occured while generating the random passphrase'));
//     } else {
//       // resolve with the validated passphrase
//       resolve(password);
//     }
//   });
// };

// mongoose.model('User', UserSchema);
