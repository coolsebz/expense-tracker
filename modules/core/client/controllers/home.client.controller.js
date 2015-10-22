'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$location', '$state',
  function ($scope, Authentication, $location, $state) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

    if($scope.authentication.user) {
    	$state.go('expenses.list');
    }
    else {
    	$state.go('authentication.signin');
    }
  }
]);
