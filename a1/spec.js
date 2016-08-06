(function() {
window.runSpecInJsdom = function () {
print = console.log

module('multiSelectBox');
describe('tesing', function() {

    beforeEach(function() {
        print('beforeEach', '1');
    });
    it('it is 1', function() {
        expect(1).toBe(1);
    });
});
}
}());
