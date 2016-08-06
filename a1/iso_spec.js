module.exports = function(expect, it) {
return {
  modules: 'IsolateFoo',
  verbose: true,
  element: '<a-foo bar="x"></a-foo>',
  parentScope: {
    x: 'initial'
  },
  tests: function (deps) {
    it('has correct initial value', function () {
        //$scope.$digest();
      console.log('html', deps.element);
      var scope = deps.element.isolateScope();
      expect(scope.bar).toEqual('initial');
    });
  }
}};
