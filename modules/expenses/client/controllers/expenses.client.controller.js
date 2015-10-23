'use strict';

// Expenses controller
angular.module('expenses').controller('ExpensesController', ['$scope', '$stateParams', '$location', '$state', 'Authentication', 'Expenses', 'Categories',
  function ($scope, $stateParams, $location, $state, Authentication, Expenses, Categories) {
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
      $scope.category = '';
    };

    // Create new expense
    $scope.create = function (isValid) {
      $scope.error = null;

      handleNewCategory($scope.newCategory, function(savedCategory) {

        // Create new expense object
        var expense = new Expenses({
          title: $scope.title,
          amount: $scope.amount,
          receipt_date: $scope.receiptDate,
          type: $scope.type ? 'income' : 'expense',
        });

        if(savedCategory.id || $scope.category) {
          console.log('setting the category to: ', savedCategory.id || $scope.category);
          expense.category_id = savedCategory.id || $scope.category; //note(seb): making sure that the property doesn't get sent with an empty value
        }

        // Redirect after save
        expense.$save(function (response) {
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

          if(!$scope.authentication.user.expenses) {
            $scope.authentication.user.expenses = [];
          }
          
          $scope.authentication.user.expenses.push(response);
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });

      });

      
    };

    function handleNewCategory(newCategoryName, next) {

      if(!newCategoryName) {
        return next({});
      }

      var category = new Categories({
        name: newCategoryName
      });

      category.$save(function(response) {

        //add category to user

        next(response);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;

        //todo(seb): add more error handling here
        next({});
      });
    }

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
