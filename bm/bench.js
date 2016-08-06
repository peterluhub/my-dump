#!/usr/local/bin/node  --expose-gc
//#!/usr/local/bin/node  --prof
//#!/usr/local/bin/node --trace-opt --trace-deopt
//#!/usr/local/bin/node --expose-gc --trace-opt

//var tb = require('trace');;
var util = require('util');;
var st = require('streamjs');;
var present = require('present');;
//var most = require('most');;
var t = require('./node_modules/transducers.js');
var x = require('../xducer/xducer.js');
var ax = require('../xducer/axd.js');
var _ = require('lodash');
var lz = require('./node_modules/lazy.js');
var u = require('underscore');

function addTen(x) { return x + 10; }
function sum(x, acc) { 
    /*
console.log('xd Current memory usage: %j', process.memoryUsage());
    throw new Error('reduce end'); 
    */
    return x + acc; }
function double(x) { return x *  2; }
function even(x)   { return x % 2===0 ; }
even.filter = true;
function multipleOfFive(x) { return x % 5 ===0; }
multipleOfFive.filter = true;

function addTencb(x,cb) { cb(null, x + 10); }
function doublecb(x,cb) { cb(null, x *  2); }
function evencb(x,cb)   { cb(null, x % 2 ===0); }
function foreach(x)   { var v=x; return v;}
evencb.filter=true;
function multipleOfFivecb(x,cb) { cb(null, x % 5 ===0); }

function baseline(arr) {
  var result = [];
  var cnt =0;
  var length = arr.length;
  var entry;

  for (var i = 0; i < length; i++) {
    entry = double(addTen(arr[i]));
    if (multipleOfFive(entry) && even(entry)) {
      result[cnt] =entry;
      cnt += 1;
    }
  }

  return result;
}

multipleOfFivecb.filter=true;
//var xd = x.transduce([addTencb, doublecb, multipleOfFivecb, evencb],
    //function(err,val){console.log('val', val);});
//var xd = x.xdinit().sync().map(addTen).map(double).filter(multipleOfFive).filter(even).push().create();
//var xd = x.xdinit().sync().map(addTen).map(double).filter(multipleOfFive).filter(even).create();

//xd = x.xdinit().sync().map(addTen).map(double).filter(multipleOfFive).filter(even).forEach(foreach).create(); 
//xd = x.xdinit().sync().map(addTen).filter(even).forEach(foreach).create(); 
//xd = x.xdinit().sync().map(addTen).filter(even).reduce(sum, 0).create(); 

var xd, now, end, gl, tmlog=[], total=0, tst=0, tn=10000;
if( !tst )
    var len = 1000;
else
    var len = 2;

libs=['baseline', 'xd', 'lz'];
libs=['xd'];
libs=['lz'];
libs=['xd', 'lz', 'stj'];
libs=['lz','xd'];

var arr=[], sz, rv, maxval=100001;
for(var s=1; s<6; s+=1) {
    arr.push(s);
}
/*
console.log('pre Current memory usage: %j', process.memoryUsage());
console.log('xxd Current memory usage: %j', process.memoryUsage());

console.log('xd take Current memory usage: %j', process.memoryUsage());
  if( xxd == xd ) console.log('xxd=xd');
var xxd = x.xdinit().sync().map(addTen).filter(even).filter(even).reduce(sum, 0).create(); 
console.log('inspect xxd', util.inspect(xxd, true, 10, true));
var xxd = x.xdinit().sync().map(addTen).filter(even).filter(even).reduce(sum, 0).take(30).create(); 
xd = x.xdinit().sync().map(addTen).filter(even).filter(even).reduce(sum, 0).create(); 
var xxd = x.xdinit().sync().map(addTen).filter(even).filter(even).take(tn).create(); 
var xxd = x.xdinit().sync().map(addTen).filter(even).filter(even).push().take(tn).create(); 
var xxd = x.xdinit().sync().map(addTen).filter(even).filter(even).take(tn).push().create(); 
*/
//xxd = x.xdinit().sync().map(addTen).filter(even).filter(even).reduce(sum, 0).create(); 
//var xxd = x.xdinit().sync().map(addTen).filter(even).filter(even).take(tn).create(); 
console.log('inspect xd', util.inspect(xd, true, 10, true));
console.log('xd Current memory usage: %j', process.memoryUsage());
//console.log('init xd', xd(arr));

for(var s=100000; s<maxval; s+=100000) {
    var sz=s ;
    arr = [];
    
    /*
    sz=5;
    */
    if( !tst )
        sz=s;
    else
        sz=5;
    for(var i=0;i<=sz;i++){
        arr.push(i);
    }
    var prerv;
    gl = lz(arr).map(addTen).filter(even).filter(even); 
    var xxd = ax.xdinit().sync().filter(even).map(addTen).reduce(sum, 0).create(); 
    //var stj = st(arr).map(addTen).filter(even).filter(even); 
    //gl = lz(arr).map(addTen).map(double).filter(multipleOfFive).filter(even); 
    for(var i=0; i<libs.length;i++) {
        var min=0, max=0;
        lib = libs[i];
        tmlog = [];
        total = 0;
        var mm = {max:0,min:0};
        global.gc();
        console.log('\nstart mem %j', util.inspect(process.memoryUsage()));
        for(j=0; j<len; j++) {
            //arr.pop(); arr.pop(); arr.pop();
            //arr.pop(); arr.pop(); arr.pop();
            if( lib === 'xd' ) {
                now = present();
                //rv = xd(arr);
//var xxd = x.xdinit().sync().map(addTen).filter(even).filter(even).take(tn).push().create(); 
//xxd = ax.xdinit().sync().map(addTen).filter(even).filter(even).reduce(sum, 0).create(); 
                rv = xxd(arr);
                //console.log('prerv', prerv);
                //prerv = rv;
            } else if( lib === 'lz' ) {
                now = present();
                rv = gl.take(tn).toArray();
            } else if( lib === 'stj' ) {
                now = present();
                rv = st(arr).map(addTen).filter(even).filter(even).limit(tn).toArray();
                //rv = gl.reduce(sum, 0);
            } else if( lib === 'most' ) {
                now = present();
                most.from(arr).map(addTen).filter(even).reduce(foreach).then( function(v){ 
                    end = present();
                    console.log('most v',v)
                });
            } else if( lib === 'baseline' ) {
                now = present();
                baseline(arr);
            }
            if( lib !== 'most' )
                end = present();
            var rtm =(end-now);
            total += rtm;
            if( rtm>mm.max ) {
                mm.max = rtm;
                mm.maxi = j;
            }

            if( rtm<mm.min ) {
                mm.min = rtm;
                mm.mini = j;
            }
            if(mm.min===0) {
                mm.min = rtm;
                mm.mini = j;
            }
            //console.log('j=', j, end-now);
        }
        console.log('end mem %j', util.inspect(process.memoryUsage()));

        //total = total - min - max;
        /*
        console.log(lib, 'avg=', 1000*len/(total), ' ops/s for ', len, 'runs and array size=', sz, 'rv=', rv, 'min=', mm);
        console.log(lib, 'avg=', 1000*len/(total), ' ops/s for ', len, 'runs and array size=', sz, 'rv=', 'min=', mm);
        */
        if( !tst )
            console.log(lib, 'avg=', 1000*len/(total), ' ops/s for ', len, 'runs and array size=', sz, 'rv=', 'min=', mm);
        else
            console.log(lib, 'avg=', 1000*len/(total), ' ops/s for ', len, 'runs and array size=', sz, 'rv=', rv, 'min=', mm);
    }
    console.log('\n');
}
process.exit();
/*
        var gl = lz(arr).map(addTen).map(double).filter(multipleOfFive).filter(even);
        gl.forEach(function(v){console.log('v', v);});
//console.log('arr', xd(arr));
      _.filter(
        _.filter(
          _.map(
            _.map(arr, addTen),
            double),
          multipleOfFive),
        even
      );

function benchArray(n) {
  var arr = _.range(n);
  var od, tc;
  var xd;
        if( !xd) {
        xd = s.xdinit().sync().map(addTen).map(double).filter(multipleOfFive).filter(even).create();
        }

  suite
    .add(' native (' + n + ')', function() {
      arr.map(addTen)
         .map(double)
         .filter(multipleOfFive)
         .filter(even);
    })
    .add('l.map/filter+transduce (' + n + ')', function() {
        var gl = lz(arr).map(addTen).map(double).filter(multipleOfFive).filter(even);
        gl.forEach(function(v){var val=v;});
    })
    .add('s.map/filter+transduce (' + n + ')', function() {
        xd(arr);
    })
    .add(' baseline (' + n + ')', function() {
      baseline(arr);
    })
    .add('_.map/filter (' + n + ')', function() {
      // not even going to use chaining, it's slower
      _.filter(
        _.filter(
          _.map(
            _.map(arr, addTen),
            double),
          multipleOfFive),
        even
      );
    })
    .add('_.map/filter, lazy (' + n + ')', function() {
      _(arr)
        .map(addTen)
        .map(double)
        .filter(multipleOfFive)
        .filter(even)
        .value();
    })
    .add('u.map/filter (' + n + ')', function() {
      // not even going to use chaining, it's slower
      u.filter(
        u.filter(
          u.map(
            u.map(arr, addTen),
            double),
          multipleOfFive),
        even
      );
    })
    .add('t.map/filter+transduce (' + n + ')', function() {
    if( !tc) {
       tc =  t.compose(
           t.map(addTen),
           t.map(double),
           t.filter(multipleOfFive),
           t.filter(even));
    }
      t.into([], tc,
             
             arr);
    })
}

//for(var i=10; i<1001; i+=100) {
for(var i=100000; i<=100005; i+=1) {
  benchArray(i);
  global.gc();
}

var currentData = {};
function print() {
  process.stdout.write(currentData.size + ' ');
  currentData.cols.forEach(function(col, i) {
    process.stdout.write(col + ' ');
  });
  console.log('');
}

suite.on('cycle', function(event) {
  var size = parseInt(event.target.name.match(/\((.*)\)/)[1]);
  if(currentData.size !== size) {
    if(currentData.size) {
      print();
    }
    currentData = { size: size, cols: [] };
  }

  currentData.cols.push(event.target.hz);
});

suite.on('error', function(event) {
  console.log('error', event);
});
suite.on('complete', function(event) {
  print();
});

suite.run();
*/
