function limit(fns, cb, max) {
    if( ! fns instanceof Array ) {
        throw new Error('fns is not an array');
    }
    max = max?max:fns.length;
    var queue = [];
    var results = fns.map(function(fn) { return undefined });
    var numRunning = 0;
    var numSeq = 0;
    var error = false;
    var last = false;

    function runnext(idx, err, data) {
        numRunning--;
        console.log('idx', idx, 'length', queue.length, 'data', data);
        if( last ) return;
        if( err ) { 
            queue.length = 0;
            numRunning = 0;
            error=true; results[idx] = {err: err}; 
        }
        else { results[idx] = {data: data}; }
        if( numRunning < max && queue.length>0 ) {
            var tsk = queue.shift();
            tsk.run(tsk.f, results[idx]);
        } else if( numRunning == 0 && queue.length == 0 ) {
            console.log('last');
            last = true;
            if( typeof cb == 'function' )
                cb(error, results);
        }
    }

    function run(f, results) {
        console.log('run', numSeq, numRunning);
        try {
            numRunning++;
            f(runnext.bind(null,numSeq), results);
            numSeq++;
        } catch(e) {
            //console.log('stack eee', e.stack);
            runnext(numSeq++, e);
        }
    }

    fns.forEach(function(f) {
        if (numRunning >= max) {
            queue.push({run:run, f:f});
        }
        else {
            console.log('run cnt', numRunning);
            run(f);
        }
    });
}


var util = require('util');
function cb(err, data) { 
    console.log('err', err, 'data', data);
    if( data[0] && 'err' in data[0] && typeof data[0].err == 'object' && data[0].err.stack )
        console.log('err', data[0].err.stack);
}
var fnlst = [];
for(var val=1;val<9; val++) {
    (function(val) {
    var rn = Math.random()*10*val;
    //rn = 0;
    console.log('rn', rn, 'val', val);
    fnlst.push(
        function f1(next, results) { 
            console.log('results', results);
            if( val == 0 ) {
                throw new Error('tst err');
                //return;
            }
            setTimeout(function(){next(null, val);}, rn);
        }
    );
    })(val);
}

var start = process.hrtime()
limit(fnlst, cb, 1);
var end = process.hrtime()
util.log('end', 'sec=', end[0]-start[0], 'mili', (end[1]-start[1])/1e6);
