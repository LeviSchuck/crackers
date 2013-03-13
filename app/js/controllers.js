'use strict';

/* Controllers */


function MyCtrl1() {}
MyCtrl1.$inject = [];


function MyCtrl2() {
}
MyCtrl2.$inject = [];

function CrackerController($scope,$location,Auth){
	$scope.menus = [
		{path: "/main", text: "Main Content", isActive: true},
		{path: "/users", text: "Users"},
		{path: "/notfound", text: "No find"}
	];
	$scope.$on('$routeChangeSuccess', function (scope, next, current) {
    	//$location.$$path
    	_.each($scope.menus,function(menu){
    		menu.isActive = false;
    	});
    	_.find($scope.menus,function(menu){
    		if(menu.path.indexOf($location.$$path) == 0){
    			menu.isActive = true;
    		}
    	});
	});
	$scope.auth = {};
	$scope.auth.invertText = "Login";
	$scope.auth.user = null;

	navigator.id.watch({
	  onlogin: function(assertion) {
	    var a = new Auth();
	    a.assertion = assertion;
	    a.$login(function(result){
    		$scope.auth.invertText = "Logout";
    		$scope.auth.user = result.user;
	    });
	    
	  },
	  onlogout: function() {
	  	Auth.logout();
	  }
	});
	$scope.auth.invert = function(){
		if($scope.auth.user){
			navigator.id.logout();
			$scope.auth.invertText = "Login";
			$location.path("/");
			$scope.auth.user = null;
		}else{
			navigator.id.request();
		}
	};
	
}
function UserCtrl($scope, User){
	var users = User.query();
	$scope.users = users;
	$scope.saveUser=function(user){
		user.$save({userid: user._id});
	};
}