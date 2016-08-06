function asyncFlow(fns, cb, max) {
    var len = fns.length;
    max = len;
    //max = max?max:len;
    var results = [];
    //var results = new Array(len);

    var runningCnt = 0;
    var seqNum = 0;
    //var error = false;

    function runnext(idx, err, data) {
        runningCnt -= 1;
        if( !err ) { 
            results[idx] = data; 
        } else { 
            seqNum = len;
            runningCnt = 0;
            //error=err; 
            results.err = idx; 
            results[idx] = err; 
        }
        //console.log('runningCnt', runningCnt, '; seqNum', seqNum, '; len', len);
        //if( runningCnt === 0 && seqNum === len ) {
        if( !runningCnt ) {
            cb(err, results);
        } 
        /* else if( seqNum < len ) {
            runningCnt++;
            fns[seqNum](mybind(seqNum), err, data);
        }
        */
    }

    //var f = function mybind(idx) {
    function mybind(idx) {
        seqNum += 1;
        return function(err, result) {
            runnext(idx, err, result);
        }
    }

    while( seqNum < max ) {
        runningCnt += 1;
        fns[seqNum](mybind(seqNum));
    }
}

//if( typeof module == 'object' && typeof module.exports == 'object' )
if( typeof module == 'object' )
    module.exports = asyncFlow;
