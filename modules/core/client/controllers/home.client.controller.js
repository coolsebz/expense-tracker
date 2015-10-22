'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$location', '$state',
  function ($scope, Authentication, $location, $state) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

    if(!$scope.authentication.user) {
    	$state.go('authentication.signin');
    }

	
	if($scope.authentication.user.expenses) {

	    var stats = extractLabels($scope.authentication.user.expenses);

	    $scope.labels = stats.labels;
	    $scope.series = ['Expenses', 'Income'];

	    $scope.data = [
	      stats.expenseSeries,
	      stats.incomeSeries
	    ];
	}    

    $scope.onClick = function (points, evt) {
      console.log(points, evt);
    };


    function extractLabels(expenses) {
    	var incomeSeries = [];
    	var expenseSeries = [];
    	var dateLabels = {};

    	// poor man's map reduce, step 1: mapping
    	for (var i = 0; i < expenses.length; i+=1) {

    		expenses[i].receiptDate = new Date(expenses[i].receipt_date); //keeping a date format handy

    		var key = expenses[i].receiptDate.getDate() + '/' + expenses[i].receiptDate.getMonth();

    		if(!dateLabels[key]) {
    			dateLabels[key] = { income: 0, expense: 0 };
    		}

    		dateLabels[key].income += expenses[i].type === 'income' ? expenses[i].amount : 0;
    		dateLabels[key].expense += expenses[i].type === 'expense' ? expenses[i].amount : 0;    		
    	}

    	//step 2, reduce:
    	for (var j = 0; j < Object.keys(dateLabels).length; j++) {
    		incomeSeries.push(dateLabels[Object.keys(dateLabels)[j]].income);
    		expenseSeries.push(dateLabels[Object.keys(dateLabels)[j]].expense);
    	}

    	return {
    		labels: Object.keys(dateLabels),
    		incomeSeries: incomeSeries,
    		expenseSeries: expenseSeries,
    	};
    }


  }
]);
