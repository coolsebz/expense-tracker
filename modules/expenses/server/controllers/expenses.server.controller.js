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
		res.json(savedExpense);		
	}).catch(function(err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err);
		});
	});
};

/* 
 * Show an expense
 */
exports.read = function(req, res) {
	res.json(req.expense);
};

exports.update = function(req, res) {

  var expense = req.expense;

  expense.title = req.body.title;
  expense.value = req.body.value;

  //note(seb): setting the method explicitly to 'update' makes it so that if it fails we get a different,
  //           more accurate error message back than just 'no rows updated'
  expense.save({ method: 'update' }).then(function(savedExpense) {
    res.json(savedExpense);
  }).catch(function(err) {
    return res.status(400).send({
      message: errorhandler.getErrorMessage(err);
    })
  });

};

exports.delete = function(req, res) {

};

exports.list = function(req, res) {

};

exports.expenseById = function(req, res, next, id) {




};