'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  path = require('path'),
  User = require(path.resolve('./modules/users/server/models/user.server.model')),
  Users = require(path.resolve('./modules/users/server/collections/user.server.collection'));

/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
  //todo(seb): when switching to uuid make sure that the id is valid

  User.where({
    id: id
  }).fetch({
    withRelated: ['expenses']
  }).then(function (user) {
    console.log(user);

     if (!user) {
      return next(new Error('Failed to load User ' + id));
    }

    req.profile = user;
    next();
  }).catch(function(err) {
    return next(err); 
  });
};
