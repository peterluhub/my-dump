
function waterfall(fns, cb) {
    var next = null;

    for(var i=fns.length-1; i; i-=1) {
        next = mkf(fns[i], cb, next);
    }
    mkf(fns[0], cb, next)();
}

function mkf(cur, cb, next) {
    var called;
    return function(err, data) {
    function runnext(err, data) {
        if( !err ) { 
            if( !called )
                called = 1;
            else
                return;
            if( next ) {
                //console.log('data', data, next);
                next(err, data);
            } else {
                cb(err, data);
            }
        } else {
            cb(err, data);
        }
    }
                //console.log('cur', cur, next);

    cur(runnext, err, data);
    }
}

module.exports = waterfall;
