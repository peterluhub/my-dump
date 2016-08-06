function asyncFlow(fns, cb) {
    var len = fns.length;
    var results = [];

    var runningCnt = len;

    function runnext(idx, err, data) {
        //console.log('idx', idx);
        if( !err ) { 
            results[idx] = data; 
            runningCnt -= 1;
            if( !runningCnt ) {
                cb(err, results);
            } 
        } else {
            cb(err, results);
        }

        //runningCnt?null:cb(err, results);
        /*
        */
    }

    var regi_idx = function mybind(idx) {
        return function(err, result) {
            runnext(idx, err, result);
        }
    }


    var funval;
    for(;len;) {
        len -= 1;
        //fns[len](runnext);
        funval = fns[len];
        funval(regi_idx(len));
    }
}

//if( typeof module == 'object' && typeof module.exports == 'object' )
if( typeof module == 'object' )
    module.exports = asyncFlow;
