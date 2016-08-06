var ptm = require('present');

module.exports = function(name, fn) {
    var stm=ptm(), etm;

    var args = Array.prototype.slice.call(arguments, 2);
    console.log('args', args);
    fn.apply(fn, args);
    etm = ptm();
    console.log(fn.name, name, 'done in - ', etm-stm, ' ms');
}
