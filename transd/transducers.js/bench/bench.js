#!/usr/local/bin/node --expose-gc

var util = require('util');;
var present = require('present');;
var Benchmark = require('benchmark');
var t = require('../transducers');
var s = require('../../../xducer/xducer');
var _ = require('lodash');
var lz = require('./lazy.js');
var u = require('underscore');
var suite = Benchmark.Suite('transducers');

function addTen(x) { return x + 10; }
function double(x) { return x *  2; }
function even(x)   { return x % 2===0 ; }
even.filter = true;
function multipleOfFive(x) { return x % 5 ===0; }
multipleOfFive.filter = true;

function addTencb(x,cb) { cb(null, x + 10); }
function doublecb(x,cb) { cb(null, x *  2); }
function evencb(x,cb)   { cb(null, x % 2 ===0); }
function foreach(x)   { var v=x;}
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
//var xd = s.transduce([addTencb, doublecb, multipleOfFivecb, evencb], function(err,val){console.log('val', val);});
var xd = s.xdinit().sync().map(addTen).map(double).filter(multipleOfFive).filter(even).push().create();
var now, end, gl, tmlog=[], total=0;
var len = 10000;
var len = 300;
xd = s.xdinit().sync().map(addTen).map(double).filter(multipleOfFive).filter(even).forEach(foreach).create(); 
var xd = s.xdinit().sync().map(addTen).map(double).filter(multipleOfFive).filter(even).push().create();
libs=['baseline', 'xd', 'lz'];
var arr=[], sz, max=1000001;
var arr=[], sz, max=1001;
var arr=[], sz, max=106;
//for(var s=100000; s<max; s+=100000) {
//for(var s=10; s<max; s+=100) {
for(var s=5; s<max; s+=5) {
    var sz=s ;
    arr = [];
for(var i=0;i<sz;i++){
    arr.push(i);
}
gl = lz(arr).map(addTen).map(double).filter(multipleOfFive).filter(even); 
for(var i=0; i<libs.length;i++) {
    lib = libs[i];
    tmlog = [];
    total = 0;
for(j=0; j<len; j++) {
    if( lib === 'xd' ) {
        now = present();
        xd(arr);
    } else if( lib === 'lz' ) {
        now = present();
        gl.toArray();
        //gl.forEach(foreach);
    } else if( lib === 'baseline' ) {
        now = present();
        baseline(arr);
    }
    end = present();
    //global.gc();
    total += (end-now);
    //console.log('j=', j, end-now);
    //console.log('j=', j, end-now, util.inspect(process.memoryUsage()));
}

console.log(lib, 'avg=', 1000*len/(total), ' ops/s for ', len, 'runs and array size=', sz);
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
*/

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
