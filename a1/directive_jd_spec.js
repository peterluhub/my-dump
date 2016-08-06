
module.exports = function(expect, it) {
   return {
       name: 'multiSelectBox directive',
  module: 'multiSelectBox',
  parentScope: {
      url: 'http://localhost:8080',
    bheight:'10',
    leftLabel:'Left',
    rightLabel:'Right',
    datasource:[1,2,3],
    ngModel:"outdata"
  },
  element: '<multi-select-box url="http://localhost:8080" bheight="bheight" left-label="leftLabel" right-label="rightLabel" datasource="datasource" ng-model="ngModel"></multi-select-box>',
  /*
       verbose: true,
        console.log('=====sc', controller);
        console.log('scope', deps.element);
  */
  inject: 'swap',
  tests: function (deps) {
    it('has controller', function () {
        var controller = deps.element.controller('multiSelectBox');
        expect(typeof controller.toright).toEqual('function');
    });
    it('selectedItems is array', function () {
        var controller = deps.element.controller('multiSelectBox');
        expect(Array.isArray(controller.selectedItems)).toEqual(true);
    });
    it('swap has exchg function', function () {
        var scope = deps.element.isolateScope();
      expect(typeof deps.swap.exchg).toEqual('function');
    });
      /*
      */
    var tgt = [0,2,3];
    it('extends target array', function () {
      deps.swap.exchg([1,2], tgt);
      expect(tgt).toEqual([0,2,3,1]);
    });
    it('deletes from target array', function () {
      deps.swap.exchg([1,2], tgt, 'del');
      expect(tgt).toEqual([0,3]);
    });
    it('datasource init value', function () {
        var scope = deps.element.isolateScope();
        expect(scope.datasource).toEqual([1,2,3]);
    });
    it('toright add to selectedItems/del from datasource', function () {
        var controller = deps.element.controller('multiSelectBox');
        controller.datasource = [0,1];
        controller.toRightSelected = [1];
        controller.toright();
        expect(controller.selectedItems).toEqual([1]);
        expect(controller.datasource).toEqual([0]);
    })
    it('toleft del from selectedItems/add to datasource', function () {
        var controller = deps.element.controller('multiSelectBox');
        controller.datasource = [0];
        controller.toLeftSeleted = [1];
        controller.selectedItems = [1];
        controller.toleft();
        expect(controller.selectedItems).toEqual([]);
        expect(controller.datasource).toEqual([0,1]);

        controller.datasource = [0];
        controller.toLeftSeleted = [1,2];
        controller.selectedItems = [1,2];
        controller.toleft();
        expect(controller.selectedItems).toEqual([]);
        expect(controller.datasource).toEqual([0,1,2]);
    });
    it('updates isolate scope', function () {
          var scope = deps.element.isolateScope();
          expect(scope.selectedItems).toEqual('outdata');
          deps.parentScope.datasource = '/url';
          deps.parentScope.ngModel = [0,1,2]
          deps.$rootScope.$apply();
          expect(scope.datasource).toEqual('/url');
          expect(scope.selectedItems).toEqual([0,1,2]);
    });
  }
}};
