"use strict";
function asyncFlow(fns, cb) {
    runnext.seqNum = 1;
    runnext.fns = fns;

    function runnext(err, data) {
        if( !err ) { 
            var fn = runnext.fns[runnext.seqNum];
            if( fn ) {
                runnext.seqNum += 1;
                fn(runnext, data);
            } else {
                cb(err, data);
            }
        } else {
            cb(err, data);
        }

    }

    fns[0](runnext);
}

//if( typeof module == 'object' && typeof module.exports == 'object' )
if( typeof module == 'object' )
    module.exports = asyncFlow;
