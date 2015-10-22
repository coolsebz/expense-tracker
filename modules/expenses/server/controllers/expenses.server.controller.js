'use strict';

var path = require('path'),
  User = require(path.resolve('./modules/users/server/models/user.server.model')),
  Users = require(path.resolve('./modules/users/server/collections/user.server.collection')),
  Expense = require(path.resolve('./modules/expenses/server/models/expense.server.model')),
  Expenses = require(path.resolve('./modules/expenses/server/collections/expense.server.collection')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


/*
 * Create a new expense
 */
exports.create = function(req, res) {
	var expense = new Expense(req.body);

	expense.attributes.user_id = req.user.attributes.id;

	expense.save().then(function(savedExpense) {
		

    if(expense.attributes.type === 'expense') {
      req.user.attributes.balance -= expense.attributes.amount;
    }
    else if(expense.attributes.type === 'income') {
      req.user.attributes.balance += expense.attributes.amount;
    }

    req.user.save({ patch: true }).then(function(savedUser) {
      res.json(savedExpense);
    }).catch(function(err) {
      return res.status(400).send({
        err: err,
        message: errorHandler.getErrorMessage(err)
      });
    });
	}).catch(function(err) {
    console.log(err);
		return res.status(400).send({
      err: err,
			message: errorHandler.getErrorMessage(err)
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
  expense.amount = req.body.amount;

  //note(seb): setting the method explicitly to 'update' makes it so that if it fails we get a different,
  //           more accurate error message back than just 'no rows updated'
  expense.save({ method: 'update' }).then(function(savedExpense) {
    res.json(savedExpense);
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });

};

exports.delete = function(req, res) {
  var expense = req.expense;

  expense.destroy().then(function(deletedExpense) {
    res.json(deletedExpense);
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

exports.list = function(req, res) {
  Expenses.query({ 
    where: {
      user_id: req.user.attributes.id
    }
  }).fetch({
    withRelated: []
  }).then(function(loadedModels) {
    res.json(loadedModels);
  }).catch(function(err) {
    console.log(err);
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

exports.expenseById = function(req, res, next, id) {

  new Expense({ id: id })
    .fetch()
    .then(function(loadedExpense) {
      if(!loadedExpense) {
        return res.status(404).send({
          message: 'No article with that identifier has been found'
        });  
      }

      req.expense = loadedExpense;
      return next();
    }).catch(function(err) {
      return next(err);
    });


};