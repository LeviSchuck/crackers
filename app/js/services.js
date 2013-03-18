'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('Crackers.services', ['ngResource']).
  factory('User',function($resource){
  	return $resource('/users/:userid',{},{
  		query: {method:'GET', params:{}, isArray:true},
  		save:  {method:'POST'},
  		make:  {method:'PUT'},
  	});
  }).
  factory('Auth',function($resource){
  	return $resource('/auth',{},{
  		status: {method:'GET', params: {}},
  		logout: {method:'DELETE', params: {}},
  		login: {method:'POST', params: {}}
  	});
  }).
  factory('Post',function($resource){
    return $resource('/posts/:postid',{},{
      query: {method: 'GET', isArray:true},
      post: {method: 'PUT'},
      del: {method: 'DELETE'}
    });
  }).
  factory('Limit',function($resource){
    return $resource('/limit',{},{
      query: {method: 'GET'},
      save: {method: 'POST'}
    });
  });
