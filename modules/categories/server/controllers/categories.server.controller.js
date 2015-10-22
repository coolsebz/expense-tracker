'use strict';

var path = require('path'),
  lodash = require('lodash'),
  bookshelf = require(path.resolve('./config/lib/bookshelf')),
  User = require(path.resolve('./modules/users/server/models/user.server.model')),
  Users = require(path.resolve('./modules/users/server/collections/user.server.collection')),
  Category = bookshelf.model('Category'),
  Categories = require(path.resolve('./modules/categories/server/collections/category.server.collection')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/*
 * Create a new category
 */
exports.create = function(req, res) {
	var category = new Category(req.body);

	category.attributes.user_id = req.user.attributes.id;

	category.save().then(function(savedCategory) {
		res.json(savedCategory);
	}).catch(function(err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};

/* 
 * Show an category
 */
exports.read = function(req, res) {
	res.json(req.category);
};

exports.update = function(req, res) {

  var category = req.category;

  category.name = req.body.name;

  //note(seb): setting the method explicitly to 'update' makes it so that if it fails we get a different,
  //           more accurate error message back than just 'no rows updated'
  category.save(null, { method: 'update' }).then(function(savedCategory) {
    res.json(savedCategory);
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });

};

exports.delete = function(req, res) {
  var category = req.category;

  category.destroy().then(function(deletedCategory) {
    res.json(deletedCategory);
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

exports.list = function(req, res) {

  if(!req.user) {
    return [];
  }

  Categories.query({ 
    where: {
      user_id: req.user.attributes.id
    }
  }).fetch({
    withRelated: []
  }).then(function(loadedCategories) {
    res.json(loadedCategories);
  }).catch(function(err) {
    console.log(err);
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

exports.categoryById = function(req, res, next, id) {
  new Category({ id: id })
    .fetch()
    .then(function(loadedCategory) {

      

      if(!loadedCategory) {
        return res.status(404).send({
          message: 'No article with that identifier has been found'
        });  
      }

      req.category = loadedCategory;
      return next();
    }).catch(function(err) {
      return next(err);
    });


};