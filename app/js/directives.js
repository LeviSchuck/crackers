'use strict';

/* Directives */


angular.module('Crackers.directives', []).
  directive('appVersion', ['version', function(version) {
	return function(scope, elm, attrs) {
	  elm.text(version);
	};
  }])
  .directive('fdSlider',['$parse',function($parse){
	'use strict';
	return {
		restrict: 'AE',
		require: '?ngModel',
		templateUrl: 'partials/slider.html',
		scope: false,
		compile: function compile(tElement, tAttrs, transclude) {
		  tElement.attr('data-toggle', 'slider-radio');

		  return function postLink(scope, iElement, iAttrs, controller) {
		  	scope.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			    return v.toString(16);
			});
			function watcher(newValue, oldValue) {
				if(newValue !== oldValue) {
					if(newValue){
						//true ON
						$(iElement.find('input')[1]).prop('checked',true);
						$(iElement.find('input')[0]).prop('checked',false);
					}else{
						//false OFF
						$(iElement.find('input')[0]).prop('checked',true);
						$(iElement.find('input')[1]).prop('checked',false);
					}
				}
			};
			scope.on = iAttrs.on || "On";
			scope.off = iAttrs.off || "Off";
			if(iAttrs.fdTiny !== undefined){
				$(iElement.children()[0]).addClass('tiny')
			}
			if(iAttrs.fdRound !== undefined){
				$(iElement.children()[0]).addClass('round')
			}
			if(iAttrs.fdSize !== undefined){
				$(iElement.children()[0]).addClass(iAttrs.fdSize)
			}
			// If we have a controller (i.e. ngModelController) then wire it up
			if(controller) {
				scope.isOn = $parse(iAttrs.ngModel);
				watcher(scope.isOn(scope),undefined);
				console.log(controller);
				iElement.bind('click',function(){
					var isChecked = !scope.isOn(scope);
					console.log("checking",isChecked);
					scope.$apply(function () {
					  controller.$setViewValue(isChecked);
					});
				})

			  // Watch model for changes
			  scope.$watch(iAttrs.ngModel, watcher);

			}

		  };
		}
	};

	}]);
