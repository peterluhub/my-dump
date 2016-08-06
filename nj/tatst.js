var lj = require('longjohn');
var fs = require('fs');
var p = require('./plimit');

var util = require('util');
function cb1(next, err, data) { 
    console.log('cb1===err', err, 'data', data);
    //if( data[0] && 'err' in data && typeof data[err] == 'object' && data[err].stack )
    next(err, data);
}

function cb(err, data) { 
    console.log('***err', err, 'data', data);
    if( data[0] && 'err' in data && typeof data[err] == 'object' && data[err].stack )
        console.log('err', data[0].err.stack);
}
var fnlst = [];
var fnlst2 = [];
var fnlst3 = [];
function mkfuns(lst, val) {
    var rn = Math.random()*10*val;
    //rn = 0;
    console.log('rn', rn, 'val', val);
    lst.push(
        function f1(next, err, results) { 
            //console.log('results', results);
            if( val === 0 ) {
                throw new Error('tst err');
                //return;
            }
            setTimeout(function(){
                if(results && results===0) errtrigger.err = 0;
                if(results==0) err=true; else err=null;
                next(err, val);}, rn);
        }
    );
}

function wrapper(next,err,data) {
    fs.readFile('u', next);
}

for(var val=1;val<4; val++) {
    mkfuns(fnlst,val);
}
for(val=10;val<13; val++) {
    mkfuns(fnlst2,val);
}
for(val=20;val<23; val++) {
    mkfuns(fnlst3,val);
}

var start = process.hrtime();

var allfnlst = [];
allfnlst.push(wrapper);
allfnlst.push(function(next, err, results) {
    console.log('results', results);
    p(fnlst, 2, cb1.bind(null, next));
});
allfnlst.push(function(next, err, results) {
    console.log('2 results', results);
    p(fnlst2, 1, cb1.bind(null, next));
});
allfnlst.push(function(next, err, results) {
    console.log('3 results', results);
    p(fnlst3, 3, cb1.bind(null, next));
});

/*
 p(allfnlst, cb, 1);
p(fnlst,cb,1);
p([wrapper],cb,1);
*/
p(allfnlst, 3, cb);
var end = process.hrtime();
util.log('end', 'sec=', end[0]-start[0], 'mili', (end[1]-start[1])/1e6);
