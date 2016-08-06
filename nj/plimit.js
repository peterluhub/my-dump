function limit(fns, max, cb) {
    if( !(fns instanceof Array) ) {
        throw new Error('fns is not an array');
    }
    max = max?max:fns.length;
    var queue = [];
    var results = fns.map(function(fn) { return undefined; });
    var runningCnt = 0;
    var seqNum = 0;
    var error = false;
    var last = false;

    function runnext(idx, err, data) {
        runningCnt--;
        if( err ) { 
            queue.length = 0;
            runningCnt = 0;
            error=err; 
            results.err = idx; 
            results[idx] = err; 
        }
        else { 
            results[idx] = data; 
        }
        if( runningCnt < max && queue.length>0 ) {
            var tsk = queue.shift();
            tsk.run(tsk.f, null, results[idx]);
        } else if( runningCnt === 0 && queue.length === 0 ) {
            last = true;
            if( typeof cb == 'function' )
                cb(error, results);
        }
    }

    function run(f, err, results) {
        try {
            runningCnt++;
            f(runnext.bind(null,seqNum), err, results);
            seqNum++;
        } catch(e) {
            runnext(seqNum++, e);
        }
    }

    fns.forEach(function(f) {
        if (runningCnt >= max) {
            queue.push({run:run, f:f});
        }
        else {
            run(f);
        }
    });
}

if( typeof module == 'object' && typeof module.exports == 'object' )
    module.exports = limit;
