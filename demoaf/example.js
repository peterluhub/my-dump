"use strict";
//var lj = require('longjohn');
var util = require('util');
global.present = require('present');
var fs = require('fs');
var asyncFlow = require('./asyncFlowSS');
var asyncFlow = require('./limit');
var asyncFlow = require('./asyncFlow.min');
var asyncFlow = require('./asyncFlow');
var con = require('./con');
global.endtm = 0.0;
global.wtm_total = 0.0;


function track_cb(next, err, data) {
    console.log('track_cb data', data);
    next(err, data);
}

function showresult_cb(err, data) {
    var len = 1;
    if( typeof data === 'object' )
        len = data.length;
    var elstm = present()-stm-wtm_total/len;
    console.log('task time', data, elstm, err);
    //console.log('task data', util.inspect(data,{ depth: null }));
//process.exit();
}

function mktrack(valarray, safewf) {
    var atrack = [];
    
    var cnt = 0;
    valarray.forEach(function(val) {
        var rn = Math.random()*1;
        rn = 1;
        atrack.push((function(cnt){
            return function async_wrapper() {
                var next = arguments[arguments.length-1];
                if( arguments[arguments.length-2] )
                    var result = arguments[arguments.length-2];
            //return function async_wrapper(result, next) {
                /*
                var idx=cnt;
                var icb =  function(err, result) {
                    console.log('icb', idx);
                    next(idx, err, result);
                };
                next(err, 1+val);
                return;
                */
                var wst = present();
                setTimeout(function plusone(){
                    //console.log('result', result, val, 'to');
                    var nextval = val;
                    if( result ) nextval = nextval + result;
                    else nextval = nextval + 1;
                    var wet = present();
                    wtm_total += wet-wst;
                    next(null, nextval);
                    if( safewf && val === 1) {
                        //console.log('safewf', safewf);
                        next(null, nextval);
                    }
                }, rn);
            }})(cnt++)
        );
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
for(var i=0;i<10;i++) {
    ary[i] = i;
}
var track1 = mktrack(ary);
var track2 = mktrack(ary, 1);
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
for(var i=0; i<track1.length; i++) {
    console.log(track1[i], i);
    track1[i].toString();
}
asyncFlow.parallel(track1,  showresult_cb);
if( 0 ) {
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
}
