'use strict';

// Setting up route
angular.module('expenses').config(['$stateProvider',
  function ($stateProvider) {
    // expenses state routing
    $stateProvider
      .state('expenses', {
        abstract: true,
        url: '/expenses',
        template: '<ui-view/>'
      })
      .state('expenses.list', {
        url: '',
        templateUrl: 'modules/expenses/client/views/list-expenses.client.view.html'
      })
      .state('expenses.create', {
        url: '/create',
        templateUrl: 'modules/expenses/client/views/create-expense.client.view.html',
      })
      .state('expenses.view', {
        url: '/:expenseId',
        templateUrl: 'modules/expenses/client/views/view-expense.client.view.html'
      })
      .state('expenses.edit', {
        url: '/:expenseId/edit',
        templateUrl: 'modules/expenses/client/views/edit-expense.client.view.html',
      });
  }
]);
