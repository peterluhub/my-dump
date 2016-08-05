#!/usr/local/bin/node
var Benchmark = require('benchmark');
var lz = require('./node_modules/lazy.js');
var most = require('../../most');
var sa = require('../../../xducer/xducer');
var sa = require('../../../xducer/axd');
var rx = require('rx');
//var rxjs = require('rxjs-es')
var kefir = require('kefir');
var bacon = require('baconjs');
var lodash = require('lodash');
var highland = require('highland');

var runners = require('./runners');
var kefirFromArray = runners.kefirFromArray;

// Create a stream from an Array of n integers
// filter out odds, map remaining evens by adding 1, then reduce by summing
var n = runners.getIntArg(60);
var n = runners.getIntArg(6);
var n = runners.getIntArg(100000);
var n = runners.getIntArg(1000000);
var a = new Array(n);
for(var i = 0; i< a.length; ++i) {
	a[i] = i;
}
//        var xd = sa.xdinit().sync().filter(even).map(add1).reduce(sum,0).create();
 //   var xd = sa.xdinit().sync().filter(even).filter(even).filter(even).map(add1).map(add1).reduce(sum,0).push().create();
    //var xd = sa.xdinit().sync().reduce(sum,0).skip(3).map(add1).take(2).push().create();
    var tn = 50000;
//    var xd = sa.xdinit().sync().filter(even).filter(even).map(add1).take(tn).reduce(sum,0).create();
//    var xd = sa.xdinit().sync().filter(even).map(add1).map(add1).take(tn).reduce(sum,0).create();
    var l = lz(a).filter(even).map(add1).map(add1);
    var v = l.take(tn).reduce(sum,0);
    //console.log(l, lz);
//		console.log('xd', xd(a), v);
'most', most.from(a).filter(even).map(add1).map(add1).take(tn).reduce(sum, 0).then(
        function(v){ console.log('most v',v) 
        //process.exit();
        });
/*
*/

var suite = Benchmark.Suite('filter -> map -> reduce ' + n + ' integers');
var othoptions = {
    minSamples: 100,
	onError: function(e) {
		e.currentTarget.failure = e.error;
        console.log('stack', e.stack);
	}
};
var options = {
    minSamples: 100,
	defer: true,
	onError: function(e) {
		e.currentTarget.failure = e.error;
        console.log('stack', e.stack);
	}
};

    var xxd , gl;
    var tn=50000;
    var cnt=0;
        if( !xxd ) 
            xxd = sa.xdinit().sync().filter(even).map(add1).reduce(sum,0).create();
                //console.log('in xxd', cnt);
suite
	.add('most', function(deferred) {
		//runners.runMost(deferred, most.from(a).filter(even).filter(even).map(add1).take(tn).reduce(sum, 0));
		runners.runMost(deferred, most.from(a).filter(even).map(add1).reduce(sum, 0));
	}, options)
/*
	.add('rx 4', function(deferred) {
		runners.runRx(deferred, rx.Observable.fromArray(a).filter(even).map(add1).reduce(sum, 0));
	}, options)
	.add('rx 5', function(deferred) {
		runners.runRx5(deferred,
			rxjs.Observable.fromArray(a).filter(even).map(add1).reduce(sum, 0));
	}, options)
	.add('kefir', function(deferred) {
		runners.runKefir(deferred, kefirFromArray(a).filter(even).map(add1).scan(sum, 0).last());
	}, options)
	.add('bacon', function(deferred) {
		runners.runBacon(deferred, bacon.fromArray(a).filter(even).map(add1).reduce(0, sum));
	}, options)
	.add('highland', function(deferred) {
		runners.runHighland(deferred, highland(a).filter(even).map(add1).reduce(0, sum));
	}, options)
        if( !xd ) {
        }
*/
	.add('sa', function() {
            //xxd = sa.xdinit().sync().filter(even).map(add1).reduce(sum,0).create();
            //xxd = sa.xdinit().sync().filter(even).filter(even).map(add1).take(tn).reduce(sum,0).create();
        return xxd(a);
	}, othoptions)
	.add('lazy', function() {
        if( !gl ) {
        gl = lz(a).filter(even).map(add1);
        //gl = lz(a).filter(even).filter(even).filter(even).map(add1).map(add1);
        }
        return gl.reduce(sum,0);
	}, othoptions)
	.add('lodash', function() {
		return lodash(a).filter(even).map(add1).reduce(sum, 0);
		//return lodash(a).filter(even).filter(even).filter(even).map(add1).map(add1).reduce(sum, 0);
	})
	.add('Array', function() {
		return a.filter(even).map(add1).reduce(sum, 0);
	});

runners.runSuite(suite);

function add1(x) {
	return x + 1;
}

function lt8(x) {
	return x<8;
}

function even(x) {
	return x % 2 === 0;
}

function sum(x, y) {
	return x + y;
}
