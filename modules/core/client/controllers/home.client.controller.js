'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$location', '$state', 'Expenses',
  function ($scope, Authentication, $location, $state, Expenses) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

    $scope.dailyData = {};
    $scope.weeklyData = {};
    $scope.categoryData = {};
    $scope.sharedData = {};
    $scope.weeklyDetailedData = {};

    if(!$scope.authentication.user) {
    	$state.go('authentication.signin');
    }

	
	if($scope.authentication.user.expenses) {

        Expenses.stats({ daily: true }, function(success) {
            $scope.dailyData = success;
        });

        Expenses.stats({ perCategory: true }, function(success) {
            $scope.categoryData = success;
        });

        Expenses.stats({ weekly: true }, function(success) {
            $scope.weeklyData = success;
        });

        Expenses.stats({ sharedExpenses: true }, function(success) {
            $scope.sharedData = success;
        });

        Expenses.stats({ weeklyDetailed: true }, function(success) {
            $scope.weeklyDetailedData = success;
        });
	}    

  }
]);
