'use strict';

/**
 * Module dependencies.
 */
var expensesPolicy = require('../policies/expenses.server.policy'),
  expenses = require('../controllers/expenses.server.controller');

module.exports = function (app) {
  // expenses collection routes
  app.route('/api/expenses').all(expensesPolicy.isAllowed)
    .get(expenses.list)
    .post(expenses.create);

  // Single article routes
  app.route('/api/expenses/:expenseId').all(expensesPolicy.isAllowed)
    .get(expenses.read)
    .put(expenses.update)
    .delete(expenses.delete);

  // Finish by binding the article middleware
  app.param('expenseId', expenses.expenseById);
};
