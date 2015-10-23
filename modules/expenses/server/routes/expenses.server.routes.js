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


  //supports the following
  //   /stats/expenses?perCategory=true
  //   /stats/expenses?daily=true
  //   /stats/expenses?sharedExpenses=true
  //   /stats/expenses?weekly=true
  //   /stats/expenses?weeklyDetailed=true
  app.route('/api/stats/expenses')
    .get(expenses.stats);

  // Finish by binding the article middleware
  app.param('expenseId', expenses.expenseById);
};
