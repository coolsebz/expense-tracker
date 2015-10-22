'use strict';

//Expenses service used for communicating with the expenses REST endpoints
angular.module('expenses').factory('Expenses', ['$resource',
  function ($resource) {
    return $resource('api/expenses/:expenseId', {
      expenseId: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
      query: {
      	isArray: true,
      	method: 'GET'
      }
    });
  }
]);
