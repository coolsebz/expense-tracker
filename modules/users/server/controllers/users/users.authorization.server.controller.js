'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  path = require('path'),
  User = require(path.resolve('./modules/users/server/models/user.server.model')),
  Users = require(path.resolve('./modules/users/server/collections/user.server.collection')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * User middleware
 */
exports.userById = function (req, res, next, id) {
  //todo(seb): when switching to uuid make sure that the id is valid

  User.where({
    id: id
  }).fetch({
    withRelated: ['categories', 'expenses', 'shared_expenses']
  }).then(function (user) {
    console.log(user);

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

exports.read = function(req, res) {

  //note(seb):
  //at the moment only supporting email for the read parameters
  //so if that isn't available we answer with an empty object

  if(req.query.email && req.query.email !== req.user.attributes.email) {
    Users.query({
      where: {
        email: req.query.email
      }
    }).fetch({
      withRelated: []
    }).then(function(loadedUsers) {
      res.json(loadedUsers);
    }).catch(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
  }
  else {
    res.status(400).send({
      message: 'Invalid query'
    });
  }

};