'use strict';

// Expenses controller
angular.module('expenses').controller('ExpensesController', ['$scope', '$stateParams', '$location', '$state', 'Authentication', 'Expenses',
  function ($scope, $stateParams, $location, $state, Authentication, Expenses) {
    $scope.authentication = Authentication;

    if(!$scope.authentication.user) {
      $state.go('authentication.signin');
    }

    //cleaning up before the new expense is created
    $scope.prepareNewExpense = function() {
      $scope.title = '';
      $scope.amount = 0;
      $scope.receiptDate = new Date();
      $scope.type = false; //signaling that this is an expense by default
    };

    // Create new expense
    $scope.create = function (isValid) {
      $scope.error = null;

      // Create new expense object
      var expense = new Expenses({
        title: $scope.title,
        amount: $scope.amount,
        receipt_date: $scope.receiptDate,
        type: $scope.type ? 'income' : 'expense'
      });

      // Redirect after save
      expense.$save(function (response) {
        console.log(response);
        $state.go('expenses.list');
        // $location.path('expenses/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.amount = 0;

        if(response.type === 'expense') {
          $scope.authentication.user.balance -= response.amount;
        }
        else if(response.type === 'income') {
          $scope.authentication.user.balance += response.amount;
        }

        $scope.authentication.user.expenses.push(response);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing expense
    $scope.remove = function (expense) {
      if (expense) {
        expense.$remove();

        for (var i in $scope.expenses) {
          if ($scope.expenses[i] === expense) {
            $scope.expenses.splice(i, 1);
          }
        }
      } else {
        $scope.expense.$remove(function () {
          $location.path('expenses');
        });
      }
    };

    // Update existing expense
    $scope.update = function (isValid) {
      $scope.error = null;

      var expense = $scope.expense;

      expense.$update(function () {
        $location.path('expenses/' + expense._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Expenses
    $scope.find = function () {
      $scope.expenses = Expenses.query();
    };

    // Find existing expense
    $scope.findOne = function () {
      $scope.expense = Expenses.get({
        expenseId: $stateParams.expenseId
      });
    };
  }
]);
