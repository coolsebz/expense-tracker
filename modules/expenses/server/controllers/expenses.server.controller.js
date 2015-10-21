'use strict';

var path = require('path'),
  User = require(path.resolve('./modules/users/server/models/user.server.model')),
  Users = require(path.resolve('./modules/users/server/collections/user.server.collection')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


/*
 * Create a new expense
 */
exports.create = function(req, res) {
	var expense = new Expense(req.body);
	expense.user_id = req.user.id;

	expense.save().then(function(savedExpense) {
		res.json(article);		
	}).catch(function(err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err);
		});
	});
};

exports.read = function(req, res) {
	
};

exports.update = function(req, res) {

};

exports.delete = function(req, res) {

};

exports.list = function(req, res) {

};

exports.expenseById = function(req, res, next, id) {

	

};