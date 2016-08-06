var print = console.log;

module.exports = function(tst) {
    var t = tst;
    t.module('multiSelectBox');
    tst.describe('tesing', function() {
        print('tesing');
        tst.it('it is 1', function() {
            tst.expect(1).toBe(1);
        });
    });
}

