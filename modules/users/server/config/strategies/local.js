'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  path = require('path'),
  Users = require(path.resolve('./modules/users/server/collections/user.server.collection')),
  User = require(path.resolve('./modules/users/server/models/user.server.model'));

module.exports = function () {
  // Use local strategy
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function (username, password, done) {

    User.where({
      username: username
    }).fetch({
      withRelated: ['expenses', 'categories', 'shared_expenses']
    }).then(function (user) {

       if (!user || !user.authenticate(password)) {
        return done(null, false, {
          message: 'Invalid username or password'
        });
      }
    
      done(null, user);
    }).catch(function(err) {
      return done(err); 
    });

  }));
};
