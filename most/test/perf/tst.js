most=require('../../most');
util=require('util');
var sa = require('../../../sonic/sonicAsync.js');
pre = require('present');

var len=3000000;
var which='';
a=Array(len)
for(var i = 0; i< len; ++i) {
        a[i] = i;
}


function add1(x) {
    //throw new Error('stop');
        return x + 1;
}

function even(x) {
    //throw new Error('stop');
        return x % 2 === 0;
}

function sum(x, y) {
    //throw new Error('stop');
        return x + y;
}

var start =pre();
var xd = sa.xdinit().sync().filter(even).filter(even).map(add1).map(add1).reduce(sum,0).create();
var v=xd(a);
console.log('sa v', pre()-start, v, 'len=', len);
    /*
    /*
 var map= filter.map(add1);
 console.log('most', util.inspect(most, depth=3));
 console.log('from', util.inspect(from, depth=3));
 console.log('filter', filter);
 var from = most.from(a);
 var filter = from.filter(even);
 console.log('filter', filter.map(add1));

    */
start =pre();
 most.from(a).filter(even).filter(even).map(add1).map(add1).reduce(sum, 0).then(
         function(v) {
             console.log('most v', pre()-start, v, 'len=', len);
            }).catch(function(e) {
             console.log('most v', e.stack);

});
if( which == 'sa' ) {
} else {
}
