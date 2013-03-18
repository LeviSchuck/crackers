'use strict';

/* Controllers */


function MainCtrl($scope,$rootScope,Post) {
	$scope.posts = Post.query();
	$scope.hasError = false;
	
	$scope.addPost = function(){
		var p = new Post();
		p.contents = $scope.postContents;
		p.$post({},function(){
			//success
			$scope.postContents = "";
			$scope.posts = Post.query();
			$scope.hasError = false;
		},function(data){
			//failure
			$scope.hasError = true;
			$scope.error = data.data.message;
		});
	}

	
}


function CrackerController($scope,$location,Auth,Limit){
	$scope.menus = [
		{path: "/main", text: "Main Content", isActive: true},
		{path: "/users", text: "Users"}
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
	var persona_putUp = false;
	function setup_persona(){
		if(persona_putUp) return;
		persona_putUp = true;
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
	};

	Auth.status(function(status){
		if(status.authenticated){
			$scope.auth.invertText = "Logout";
	    	$scope.auth.user = status.user;
		}else{
			setup_persona();
		}
	});
	
	$scope.auth.invert = function(){
		if($scope.auth.user){
			setup_persona();
			navigator.id.logout();
			$scope.auth.invertText = "Login";
			$location.path("/");
			$scope.auth.user = null;
		}else{
			navigator.id.request();
		}
	};
	$scope.limit = 0;
	Limit.query(function(res){
		$scope.limit = res.limit; 
		$scope.$watch('limit',function(){
			Limit.save({limit: $scope.limit});
		});
	});
	
}
function UserCtrl($scope, User){
	var users = User.query();
	$scope.users = users;
	$scope.saveUser=function(user){
		$scope.$apply(function(){
			user.$save({userid: user._id});
		});
	};
	/*$scope.users.forEach(function(user,index){
		console.log(index);
		$scope.$watch('users['+index+']',function(){
			user.$save({userid: user._id});
		})
	});*/
	
	/*$scope.$watch('users[0].happy',function(){
		$scope.saveUser($scope.users[0]);
	})*/

	
}