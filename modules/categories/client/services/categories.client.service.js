'use strict';

//Categories service used for communicating with the categories REST endpoints
angular.module('categories').factory('Categories', ['$resource',
  function ($resource) {
    return $resource('api/categories/:categoryId', {
      categoryId: '@_id'
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
