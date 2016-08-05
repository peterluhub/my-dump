"use strict";
var lj = require('longjohn');
var util = require('util');
global.present = require('present');
var fs = require('fs');
var asyncFlow = require('../sonicAsync.min');
var asyncFlow = require('../sonicAsync');
global.endtm = 0.0;
global.wtm_total = 0.0;


function track_cb(next, err, data) {
    console.log('track_cb data', data);
    next(err, data);
}

function showresult_cb(err, data) {
    var len = 1;
    console.log('showresult_cb');
    if( typeof data === 'object' )
        len = data.length;
    var elstm = present()-stm-wtm_total/len;
    console.log('task time', data, elstm, err);
    //console.log('task time', data, err);
    //console.log('task data', util.inspect(data,{ depth: null }));
//process.exit();
}

function mktrack(valarray, safewf) {
    var atrack = [];
    
    var cnt = 0;
    valarray.forEach(function(val) {
        var rn = Math.random()*3;
        atrack.push((function(cnt){
            return function async_wrapper() {
                var next = arguments[arguments.length-1];
                if( arguments[arguments.length-2] )
                    var result = arguments[arguments.length-2];
                var wst = present();
                //console.log(result, val);
                setTimeout(function plusone(){
                    var nextval = val;
                    if( result ) nextval += result;
                    else nextval += 1;
                    var wet = present();
                    wtm_total += wet-wst;
                    next(null, nextval);
                    if( safewf && val === 1) {
                        next(null, nextval);
                    }
                }, rn);
            }})(cnt++)
        );
    });
    return atrack;
}

function bmktrack(valarray, safewf) {
    var atrack = [];
    
    function wrapper(rn, val, result, next){
        console.log('argument', arguments);
        setTimeout(function() {
            var nextval = val;
            if( result ) nextval = nextval + result;
            else nextval = nextval + 1;
            next(null, nextval);
            if( safewf && val === 1) {
                next(null, nextval);
            }
            },rn
        );
    }
        var cnt = 0;
    valarray.forEach(function(val) {
        var rn = Math.random()*3;
        atrack.push([wrapper, [rn, val]]);
    });
    return atrack;
}

function mk_nested_track(valarray) {
    var atrack = [];
    
    valarray.forEach(function(val) {
        var rn = Math.random()*20;
        atrack.push(
            function async_wrapper(next, err, result) {
                setTimeout(function nested_track_wrapper(){
                    asyncFlow(val, track_cb.bind(null, next), 1); }, rn);
        });
    });
    return atrack;
}

//sequential, concurrency=1

var ary = [];
for(var i=0;i<26;i++) {
    ary[i] = i;
}
var track1 = mktrack(ary);
var btrack1 = bmktrack(ary);
var track2 = mktrack(ary, 1);
var track3 = mktrack(ary);
var stm = present();
//asyncFlow(track1, 1, showresult_cb);
//asyncFlow.waterfall(track1, showresult_cb, 1);
//asyncFlow(track1, showresult_cb);
//asyncFlow(track2, showresult_cb);

function maptst(val, cb) {
    var wst = present();
    setTimeout(function() {
        var wet = present();
        wtm_total += wet-wst;
        console.log('val', val);
        cb(null, val*2);
        if( val===1 )
            cb(null, val*2);
    },0);
}

function filtertst(val, cb) {
    var wst = present();
    setTimeout(function() {
        var wet = present();
        wtm_total += wet-wst;
        cb(null, val%2);
        if( val===1 )
            cb(null, val%2);
    },0);
}

asyncFlow.silent = true;
asyncFlow.trace = 0;
asyncFlow.noerrout = 1;
//console.log(util.inspect(track1, {depth:5}));

function fn(a,b,c) { console.log(arguments);}

function trfilter(data, cb) { 
    //console.log('trf', data, 'cb', cb);
    //console.log('trf', data);
    if(data==3)
        cb(null, false);
    if(data>=5)
        cb(null,  true);
    if(data==2)
        cb(null,  true);
    if(data==0)
        cb(null,  true);
    else
        cb(null,  true);
}

//showresult_cb=null;
/*
asyncFlow.waterfall(track1,  showresult_cb);
console.log('track1', track1[1]);
var tr1 = asyncFlow.track(track1,  showresult_cb);
track1[0] = trfilter;
track1[0].filter = true;
track1[1] = trfilter;
track1[1].filter = true;
*/
//console.log('track1', track1);
var tr = asyncFlow.transduce(track1,   showresult_cb);
//tr([5,6]);

function sum(x, y) { return x + y; }
function addTencb(x,cb) { cb(null, x + 10); }
function doublecb(x,cb) {//console.log('doublecb x',x); 
    cb(null, x *  2); }
function evencb(x,cb)   { cb(null, x % 2 ===0); }
evencb.filter=true;
function multipleOfFivecb(x,cb) { //console.log('mul x',x);
    cb(null, x % 5 ===0); }
multipleOfFivecb.filter=true;
function greater5cb(x, cb)   { cb(null, x >= 0); }
greater5cb.filter = true;

function addTen(x) { return x + 10; }
function double(x) { return x *  2; }
function greater5(x)   { return x > 5; }
greater5.filter = true;
function even(x)   { return x % 2 ===0; }
even.filter = true;
function multipleOfFive(x) { return x % 5 ===0; }
multipleOfFive.filter = true;

var xd = asyncFlow.transduce([greater5, addTen, double, multipleOfFive, even], 'sync');
var xd = asyncFlow.transduce([greater5cb, addTencb, doublecb, multipleOfFivecb, evencb], function(err,val){console.log('val', val);});
var xd = asyncFlow.xdinit().filter(greater5).map(addTen).map(double).filter(multipleOfFive).sync().filter(even).reduce(sum, 0).create();
var arr={};
var arr=[];
for(var i=0;i<36;i++){
        arr.push(i);
        //arr[""+i] = i;
}
//console.log('xd', xd);
var result = xd(arr);
//asyncFlow.inline(track1, xd,  showresult_cb);
console.log('arr', result);

//tr(5);
if( 0 ) {
var tr = asyncFlow.transduce(track1,  showresult_cb);
tr.start(1);
asyncFlow.mapAll([1,2,3], maptst, showresult_cb);
asyncFlow.waterfall(track1,  showresult_cb);
asyncFlow.parallel(track1,  showresult_cb);
asyncFlow.waterfall(track1,  showresult_cb);
asyncFlow.parallelLimit(track1, 5, showresult_cb);
asyncFlow.series(track1, showresult_cb);
asyncFlow.parallel(track1,  showresult_cb);

asyncFlow.waterfall(track1,  showresult_cb);

//con(track1,  showresult_cb);

asyncFlow.map([1,2,3], maptst, showresult_cb);
asyncFlow.mapParallel([1,2,3], maptst, showresult_cb);
asyncFlow.mapSeries([1,2,3], maptst, showresult_cb);
asyncFlow.mapLimit([1,2,3], maptst, 2, showresult_cb);

asyncFlow.filterSeries([1,2,3,4,5,6,7,8,9], filtertst, showresult_cb);
asyncFlow.filterParallel([1,2,3,4,5,6,7,8,9], filtertst, showresult_cb);
asyncFlow.filterLimit([1,2,3,4,5,6,7,8,9], filtertst, 9, showresult_cb);
asyncFlow.apply(fn, 1,2,3)(5);
}
