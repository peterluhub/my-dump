console.log('in service-spec');

ngDescribe({
  module: 'multiSelectBox',
  inject: 'swap',
  tests: function (deps) {
    it('is a function', function () {
      expect(typeof deps.swap.exchg).toEqual('function');
    });
    var tgt = [0,2,3];
    it('extends target array', function () {
      deps.swap.exchg([1,2], tgt);
      expect(tgt).toEqual([0,2,3,1]);
    });
  }
});
