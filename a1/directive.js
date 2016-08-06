(function() {
  var app = angular.module('multiSelectBox', []);
  app.config(function($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist(['**']);
  });
  app.service('swap', function() {
    this.exchg = function (src, target, action) {
        for(i=0, len=src.length; i<len; i++) {
            var idx = target.indexOf(src[i]);
            if( action === 'del' ) {
                if( idx !== -1 ) 
                    target.splice(idx,1);
            } else {
                if( idx === -1 )
                    target.push(src[i]);
            }
        }
    };
  });

  app.directive('multiSelectBox', ['swap', function (swap) {
    var templateUrl = '/msbtemplate.html';
    var controller = ['$scope', '$timeout', function ($scope, $timeout) {
        try {
            //var sc = $_Doing__MSB__Test_ ? this : $scope;
            var sc = $scope;
        } catch(e) {
            var sc = $scope;
        }

        sc.selectedItems = [];
        templateUrl = sc.url + templateUrl;
        sc.$timeout = $timeout;

        sc.toright = function () {
            console.log('toright clicked', sc.toRightSelected);
            if( !sc.toRightSelected ) 
                return;
            swap.exchg(sc.toRightSelected, sc.selectedItems, 'add');
            swap.exchg(sc.toRightSelected, sc.datasource, 'del');

        };

        sc.toleft = function () {
            console.log('toleft clicked', sc.toLeftSelected);
            if( !sc.toLeftSelected ) 
                return;
            swap.exchg(sc.toLeftSelected, sc.datasource, 'add');
            swap.exchg(sc.toLeftSelected, sc.selectedItems, 'del');
        };
      }];


      var returnobj = {
          restrict: 'EA', 
          scope: {
              url: '@',
              bheight: '@',
              leftLabel: '@',
              rightLabel: '@',
              datasource: '=',
              selectedItems: '=ngModel'
          },
          //controllerAs: "ct",
          controller: controller,
      };
      try {
          returnobj['template'] = $_msb__ext__template_str;
      } catch(e) {
          returnobj['templateUrl'] = templateUrl;
      }
      return returnobj;
  }]);
}());
