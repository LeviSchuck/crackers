'use strict';


// Declare app level module which depends on filters, and services
angular.module('Crackers', ['Crackers.filters', 'Crackers.services', 'Crackers.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/main', {templateUrl: 'partials/main.html', controller: MyCtrl1});
    $routeProvider.when('/users', {templateUrl: 'partials/users.html', controller: UserCtrl});
    $routeProvider.otherwise({redirectTo: '/main'});
  }]);
