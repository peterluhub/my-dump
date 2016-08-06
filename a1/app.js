angular.module('drv', ['multiSelectBox']).
controller('drvctrl', ['$scope', function($scope) {
    var sc = $scope;
    sc.data = [];
    sc.outdata = [];
    setTimeout(function() {
        sc.data = ['a', 'b', 'c'];
        //sc.datasource = ['a', 'b', 'c'];
        sc.$apply();
    }, 6);
    setTimeout(function() {
        console.log('sc8', sc.data);
        console.log('si8', sc.outdata);
    }, 8);
}]
);
