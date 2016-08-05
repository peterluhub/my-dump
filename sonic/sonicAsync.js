var util = require('util');

(function(obj) {
"use strict";

var sync_supported = {f:1, m:1, r:1};
var async_supported = {f:1, m:1, l:1, c:1};
var fnnames = {f:'filter', m:'map', l:'limit', c:'callback', r:'reduce'};

obj.inline = function(tasks, xduce, done) {
    done = done || noopfn;
    var len = tasks.length, results = [], idx=len;
    function eachtsk(idx) {
      return function store(err, data) {
        var i = idx;
        if( i === null ) {
            if( done !== noopfn )
                called_already(err, data);
            return;
        }
        if( !err ) {
            //console.log('data', data, idx, len);
            idx = null;
            len -= 1;
            if( len >= 0 ) 
                xduce(data, icb_wrapper(i));
          //results[idx] = data;
        } else {
            if( len >= 0 ) {
                len = -1;
                done(err, results);
            }
        }
      };
    }

    function icb_wrapper(i) {
        return function icb(err, data) {
            if( !err ) {
            //console.log('icb data', data, i, len);
                if( data ) {
                    results[i] = data;
                }
                if( len === 0 ) {
                    len = -1;
                    var ary = [], cnt=results.length;
                    for(var j=0; j<cnt; j+=1) {
                        if( results[j] !== undefined )
                            ary.push(results[j]);
                    }
                    done(err, ary);
                }

            } else {
                if( len >= 0 ) {
                    len = -1;
                    done(err, results);
                }
            }
        };
    }

    while(idx) { idx -= 1; tasks[idx](eachtsk(idx)); }
};

function endTake() {
    var cfn=noopfn;
    return function (fn) {
        if( fn ) {
                //console.log('fn', fn);
                cfn = fn;
        } else {
                //console.log('call cfn', cfn);
                cfn();
        }
    }
};

function lastVal() {
    return function (op) {
        var val;
        if( op ) {
            return function(v) {
                //console.log('v', v);
                val = v;
            }
        } else {
            return function() {
                //if(cnt>80) { console.log('v', val);}
                //cnt++;
                return val;
            }
        }
    }
}

function trueFalse(op) {
    var val=false;
    if( op ) {
        return function() {
            val = true;
        }
    } else {
        return function() {
            return val;
        }
    }
}

function emf(sv, m, nf){
    return function(x) { 
        nf(x) && sv(m(x));
    }
}

function emm(sv, m, nm){
    return function(x) { 
        sv(nm(m(x)));
    }
}

function em(sv, m){
    return function(x) { 
        sv(m(x));
    }
}

function efe(fn){
    return function(x) { 
        fn(x);
    }
}
function eff(sv, f, nf){
    return function(x) { 
        nf(x) && f(x) && sv(x);
    }
}

function efm(sv, f, nm){
    return function(x) { 
        var v = nm(x);
        f(v) && sv(v);
    }
}

function ef(sv, f){
    return function(x) { 
        f(x) && sv(x);
    }
}

function er(sv, r) { 
    var val = r.reduce_type;
    return function(x) { 
        //console.log('r', x, val);
        val = r(x,val);
        sv(val);
    };
}

function ep(sv) { 
    var val = [];
    sv(val);
    return function(x) { 
        //console.log('p', x, val);
        val.push(x);
    };
}

function et(sv, etake, limit) { 
    var val = [],
        cnt = 0;
        sv(val);
    return function(x) { 
        if( cnt++ < limit )
            val.push(x);
        else
            etake();
        //console.log('p', x, limit, cnt, 'v=',val);
    };
}

function mm(m, nm, c){
    return function(x) { 
        //console.log('mm', nm(x), m(x), x, nm, m)
        c(m(nm(x)));
    }
};

function mf(m, nf, c){
    return function(x) { 
        nf(x) && c(m(x));
    }
};

function m(m, c){
    return function(x) { 
        //console.log('map x', x);
        c(m(x));
    };
};

function fm(f, nm, c){
    return function(x) { 
        var v = nm(x);
        //console.log('m', v, f(v), x)
        f(v) && c(v);
    }
}

function ff(f, nf, c){
    return function(x) { 
        //console.log('fx', nf(x), f(x), x)
        nf(x) && f(x) && c(x);
    }
}

function f(f, c){
    return function(x) { 
        //console.log('fx', f(x), x)
        f(x) && c(x);
    }
}

function r(fn, c) { 
    var val = fn.reduce_type;
    return function(x) { 
        val = fn(x, val);
        //console.log('rx', val, x)
        c(val);
    };
}

function t(etake, c, limit) { 
    var cnt = 0;
    return function(x) { 
        //console.log('=====x', x, cnt, limit, cnt<limit);
        if( cnt++ < limit ) 
            c(x) 
        else
            etake();
    };
}

obj.xdinit = function() {
    var funclst=[], fnchain = [], options={};

    function fnchk(fnlst, supported, typ) {
        var i, keys = Object.keys(fnlst);
        //console.log('keys', keys);
        for(i=0; i<keys.length; i+=1) {
            if( !(keys[i] in supported) )
                throw new Error('unsupported transducer type found for ' + typ + ' operations: ' + fnnames[keys[i]]);
        }
    }
    var xducers = [],
        lastval = lastVal(),
        takefn,
        core,
        cbfunc,
        limit,
        sync;
    var api = {
        forEach: function(fn) { 
            fnchain.push(fn);
            fn.forEach = 1;
            return api;
        },
        map: function(fn) { 
            fnchain.push(fn);
            fn.map = 1;
            return api;
        },
        filter: function(fn) { 
            fnchain.push(fn);
            fn.filter = 1;
            return api;
        },
        skip: function(fn) { 
            fnchain.push({skip:fn});
            return api;
        },
        skipWhile: function(fn) { 
            fnchain.push(fn);
            fn.skipWhile = true;
            return api;
        },
        takeWhile: function(fn) { 
            options.takeWS = trueFalse();
            fnchain.push(fn);
            takefn = endTake();
            //console.log('takeWhile', ws, fn.takeWhile);
            fn.takeWS = trueFalse(true);
            return api;
        },
        take: function(fn) { 
            fnchain.push({take:fn});
            takefn = endTake();
            return api;
        },
        takeResult: function(fn) { 
            //var lr = 'LimitReached';
            //options.LimitReached = lr;
            //fnchain.push({take:fn, LimitReached:lr});
            options.takeResult = fn;
            return api;
        },
        push: function(fn) { 
            fnchain.push({push:true});
            return api;
        },
        reduce: function(fn, reduce_type) { 
            fn.reduce_type = reduce_type;
            fn.reduce = true;
            fnchain.push(fn);
            return api;
        },
        cb: function(fn) { 
           cbfunc = fn;
           funclst.c = 1;
           return api; },
        limit: function(fn) { 
           options.limit = fn;
           funclst.l = 1;
           return api; },
        sync: function() { 
           options.sync = 'sync'; 
           return api; },
        create: function() { 
            xducers = mk_xducers(fnchain, lastval, takefn);
            //console.log('xducers', xducers(1), 'sync', sync, 'cbfunc', cbfunc);
            if( options.sync ) {
                //fnchk(funclst, sync_supported, 'sync');
                return obj.transduce(xducers, options, null, lastval(), takefn);
            } else {
                fnchk(funclst, async_supported, 'async');
                return obj.transduce(xducers, options, cbfunc);
            }
        }
    };


    return api;
};

    function mk_xducers(fns, lastval, takefn) {
        var i = fns.length-1,
            len = i,
            ni,
            fn,
            nfn,
            core,
            mftype;
        if( i===0 ) return noopfn;
        //console.log('len', len, i);
        while(i>=0) {
            //console.log('enter while', i);
            ni = i - 1;
            fn = fns[i];
            nfn = fns[ni];
            if( i === len ) {
                var sv = lastval(1);
                if( fn.map ) {
                    if( nfn && nfn.map ) {
                        core = emm(sv, fn, nfn);
                        i -= 2;
                    } else if( nfn && nfn.filter ) {
                        core = emf(sv, fn, nfn);
                        i -= 2;
                    } else {
                        core = em(sv, fn);
                        i = ni;
                    }
                } else if( fn.filter ) {
                    if( nfn && nfn.map ) {
                        core = efm(sv, fn, nfn);
                        i -= 2;
                    } else if( nfn && nfn.filter ) {
                        core = eff(sv, fn, nfn);
                        i -= 2;
                    } else {
                        core = ef(sv, fn);
                        i = ni;
                    }
                    //console.log('enter core filter', i);
                } else if( fn.reduce ) {
                    core = er(sv, fn);
                    i = ni;
                } else if( fn.push ) {
                    core = ep(sv);
                    i = ni;
                } else if( fn.take ) {
                    core = et(sv, takefn, fn.take);
                    i = ni;
                } else if( fn.forEach ) {
                    core = efe(fn)
                    i = ni;
                } else if( fn.flatten) {
                    len += 1;
                    fns.push({push:true});
                    i = len;
                    continue;
                    core = (function(c) { 
                            var val;
                        return function(x) { 
                            if( x instanceof Array ) {
                                for(var i=0, l=x.length; i<l; i+=1) {
                                    val = c(x);
                                }
                                return val;
                            } 
                            return x;
                        }
                    })();
                    i = ni;
                } else if( fn.skip) {
                    core = (function() { 
                            var lim=fn.skip,
                                val=1;
                        return function(x) { 
                            return val++>lim && x;
                        }
                    })();
                    i = ni;
                } else if( fn.skipWhile ) {
                    core = (function(t) { 
                            var val=true;
                        return function(x) { 
                            val = val&&t(x)||false;
                            return !val && x;
                            //console.log('p', x, limit, cnt, 'v=',v);
                            //return cnt++ < limit && val.push(x) && val ;
                        };
                    })(fn);
                    i = ni;
                } else if( fn.takeWhile ) {
                    core = (function(t) { 
                            var tws = fn.takeWS;
                        return function(x) { 
                            return t(x) && x || tws();
                            //console.log('p', x, limit, cnt, 'v=',v);
                            //return cnt++ < limit && val.push(x) && val ;
                        };
                    })(fn);
                    i = ni;
                }
                //console.log('enter core', i, len);
            } else {
                if( fn.map ) {
                    if( nfn && nfn.map ) {
                        core = mm(fn, nfn, core);
                        i -= 2;
                    } else if( nfn && nfn.filter ) {
                        core = mf(fn, nfn, core);
                        i -= 2;
                    } else {
                        core = mf(fn, core);
                        i = ni;
                    }
                } else if( fn.filter ) {
                    if( nfn && nfn.map ) {
                        core = fm(fn, nfn, core);
                        i -= 2;
                    } else if( nfn && nfn.filter ) {
                        core = ff(fn, nfn, core);
                        i -= 2;
                    } else {
                        core = f(fn, core);
                        i = ni;
                    }
                    //console.log('enter core filter', i);
                } else if( fn.push ) {
                    core = p(core);
                    core = (function(c) { 
                        var val=[];
                        return function(x) { 
                            console.log('x, val', x, val);
                            val.push(x);
                            c(val);
                        };
                    })(core);
                    i = ni;
                } else if( fn.reduce ) {
                    core = r(fn, core);
                    i = ni;
                } else if( fn.skip) {
                    core = (function(c) { 
                            var lim=fn.skip,
                                val=1;
                        return function(x) { 
                            return val++>lim && c(x);
                        }
                    })(core);
                    i = ni;
                } else if( fn.skipWhile ) {
                            //console.log('tw');
                    core = (function(t, c) { 
                            var val = true;
                        return function(x) { 
                            //console.log('tw', x, t(x));
                            val = val&&t(x)||false;
                            return !val && c(x);
                            //return cnt++ < limit && val.push(x) && val ;
                        };
                    })(fn, core);
                    i = ni;
                } else if( fn.takeWhile ) {
                            //console.log('tw');
                    core = (function(t, c) { 
                            var tws = fn.takeWS;
                        return function(x) { 
                            //console.log('tw', x, t(x));
                            return t(x) && c(x) || tws();
                            //return cnt++ < limit && val.push(x) && val ;
                        };
                    })(fn, core);
                    i = ni;
                } else if( fn.take ) {
                    core = t(takefn, core, fn.take);
                    i = ni;
                }
                //console.log('enter nnoec', i, len);
            }
        }
        //console.log('core', util.inspect(core, true, 7, true));
        return core;
    }

obj.transduce = function(fns, options, cb, getval, take) {
    cb = cb || noopfn;

    return function start(initdata, xcb) {
        cb = xcb || cb;
        //console.log('xcb', options, initdata);
        if( initdata instanceof Array ) {
            if( options.limit ) {
                console.log('limit');
                arrayXduceLimit(initdata, fns, cb, options);
            } else if( options.sync ) {
                //console.log('sync');
                syncArrayXduce(initdata, fns, take);
                return getval();
            } else {
                console.log('async');
                arrayXduce(initdata, fns, cb);
            }
        } else if( initdata instanceof Object ) {
            if( options.limit )
                objXduceLimit(initdata, fns, cb, options);
            else if( options.sync )
                return syncObjXduce(initdata, fns, options);
            else
                objXduce(initdata, fns, cb, options);
        } else {
            runXduce(initdata, fns, cb, options);
        }
    };
};

function objXduce(data, fns, xcb, options) {
    var keys = Object.keys(data),
        len = keys.length,
        dataval = [],
        i;
    for(i=0; i<len; i+=1) {
        dataval[i] = data[keys[i]];
    }
    function cb(err, xdata) {
        //console.log('err', err, 'dataval', dataval, 'xdata', xdata);
        if( err ) return xcb(err);
        var objdata = {};
        len = xdata.length;
        for(i=0; i<len; i+=1) {
            if( xdata[i] !== undefined )
                objdata[keys[i]] = xdata[i];
        }
        xcb(err, objdata);
    }

    arrayXduce(dataval, fns, cb, true);
}

function syncObjXduce(data, fns, options) {
    var keys = Object.keys(data),
        len = keys.length,
        fnlen = fns.length,
        result = {},
        fn,
        key,
        val,
        preval,
        i,
        j;
    for(i=0; i<len; i+=1) {
        key = keys[i];
        preval = data[key];
        for(j=0; j<fnlen; j+=1) {
            fn = fns[j];
            val = fn(preval, key);
            if( val === false ) {
                if( fn.filter )
                    break;
                else
                    preval = val;
            } else if( val === true ) {
                if( fn.filter )
                    val = preval;
                else
                    preval = val;
            } else {
                preval = val;
            }
        }
        if( val ) {
            result[key] = val;
        }
    }
    return result;
}

function syncArrayXduce(data, fns, take) {
    var len = data.length,
        i;


    if( take) {
        function setLen() { len = 0; }
        take(setLen);
    }

    for(i=0; i<len; i++ ) {
        fns(data[i]);
    }
}
    //console.log('options', fns, options);

function runXduce(data, fns, cb, options) {
    if( !fns[0].filter )
        fns[0](data, xduce(data, fns, 1, cb));
    else
        fns[0](data, filter_wrapper(data, fns, 1, cb));
}

function xduce(data, fns, idx, cb) {
    //console.log('data', data);
    return function runnext(err, data) {
        var i = idx;
        if( i === null ) {
            called_already(err, data);
            return;
        }
        var  fn = fns[i];
        if( !err ) { 
            idx = null;
            if( fn ) {
                //console.log('idx', idx, fn);
                if( !fn.filter )
                    fn(data, xduce(data, fns, i+1, cb));
                else
                    fn(data, filter_wrapper(data,  fns, i+1, cb));
            } else {
                cb(err, data);
            }
        } else {
            cb(err);
        }
    };
}

var arrayXduceLimit = function(xdata, xducer, cb, options) {
    cb = cb || noopfn;
    var len = xdata.length;
    if( !max || max>len )
        throw_limiterr();
    var results = [];
    var max = options.limit || len;
    var remaining = 0;
    var called = 0;

    function runeach(idx) {
        function runnext(err, data) {
            if( idx === null ) {
                called_already(err, data);
                return;
            }
            if( !err ) { 
                remaining -= 1;
                results[idx] = data;
                idx = null;
                if( runcnt<len ) {
                    if( !called ) {
                        remaining += 1;
                        runeach(runcnt++);
                    }
                } else {
                    if( !remaining && !called ) {
                        called = 1;
                        var aryidx=0;
                        var ary = [];
                        var reslen = results.length;
                        for(var i=0; i<reslen; i+=1) {
                            if( results[i] !== undefined ) {
                                ary[aryidx] = results[i];
                                aryidx += 1;
                            }
                        }
                        cb(err, ary);
                    }
                }
            } else {
                if( !called ) {
                    called = 1;
                    cb(err, results);
                }
            }
        }
        runXduce(xdata[idx], xducer, runnext);
    }

    for(var runcnt=0; runcnt<max; runcnt+=1 ) { remaining += 1;  runeach(runcnt); }
};

function filter_wrapper(data, fns, idx, cb) {
    //console.log('fil data', data, 'i', idx);
    return function filtercb(err, filterval) {
        var i = idx;
        if( i === null ) {
            called_already(err, data);
            return;
        }
        //console.log('data', data, 'i', i );
        var  fn = fns[i];
        if( !err ) { 
            idx = null;
            if( fn ) {
                if( filterval ) {
                    if( !fn.filter )
                        fn(data, xduce(data, fns, i+1, cb));
                    else
                        fn(data, filter_wrapper(data, fns, i+1, cb));
                } else {
                    cb.filtered = true;
                    cb(err, undefined);
                }
            } else {
                if( filterval ) {
                    cb(err, data);
                } else {
                    cb.filtered = true;
                    cb(err, undefined);
                }
            }
        } else {
            cb(err);
        }
    };
}

obj.trackFilter = function(filter) {
    return;
};

obj.fastWaterfall = function(fns, cb) {
    cb = cb || noopfn;
    var seqNum = 0;
    function runnext(err, data) {
        seqNum += 1;
        var  fn = fns[seqNum];
        if( !err ) { 
            if( fn ) {
                fn(data, runnext);
            } else {
                cb(err, data);
            }
        } else {
            cb(err);
        }
    }

    fns[0](null, runnext);
};

obj.waterfall = function(fns, cb) {
    cb = cb || noopfn;
    var next = function(idx) {
        return function runnext(err, data) {
            var i = idx;
            if( !i ) {
                called_already(err, data);
                return;
            }
            var  fn = fns[i];
            if( !err ) { 
                if( fn ) {
                    fn(data, next(i+1));
                    idx = null;
                } else {
                    cb(err, data);
                }
            } else {
                cb(err);
            }
        };
    };

    fns[0](null, next(1));
};

obj.series = function(tasks, cb) {
    obj.parallelLimit(tasks, 1, cb);
};

obj.filterSeries = function(data, filterfunc, cb) {
    cb = cb || noopfn;
    var len = data.length;
    var results = [];
    var truecnt = 0;

    function runeach(idx) {
        var idxcalled;
        function runnext(err, counted) {
            if( !idxcalled ) {
                idxcalled = 1;
            } else {
                called_already(err, counted);
                return;
            }
            if( !err ) { 
                if( counted ) {
                    results[truecnt] = data[idx];
                    truecnt += 1;
                }
                idx += 1;
                if( idx<len ) {
                    runeach(idx);
                } else {
                    cb(err, results);
                }
            } else {
                cb(err, results);
            }
        }
        filterfunc(data[idx], runnext);
    }

    runeach(0);
};

obj.mapSeries = function(data, mapfunc, cb) {
    cb = cb || noopfn;
    var len = data.length;
    var results = [];

    function runeach(idx) {
        var called;
        function runnext(err, data) {
            if( !called ) {
                called = 1;
            } else {
                called_already(err, data);
                return;
            }
            if( !err ) { 
                results[idx] = data;
                idx += 1;
                if( idx<len ) {
                    runeach(idx);
                } else {
                    cb(err, results);
                }
            } else {
                cb(err, results);
            }
        }
        mapfunc(data[idx], runnext);
    }

    runeach(0);
};

obj.filter = function(data, filterfunc, cb) {
    obj.filterParallel(data, filterfunc, cb);
};

obj.filterParallel = function(data, filterfunc, cb) {
    cb = cb || noopfn;
    var len = data.length;
    var results = new Array(len);
    var cnt = len;
    var called = 0;

    function runeach(idx) {
        var idxcalled;
        function runnext(err, counted) {
            if( !idxcalled ) {
                idxcalled = 1;
            } else {
                called_already(err, counted);
                return;
            }
            if( !err ) { 
                if( counted )
                    results[idx] = data[idx];
                cnt -= 1;
            } else {
                cnt = 0;
            }

            if( !cnt ) {
                if( !called ) {
                    called = 1;
                    if( !err ) {
                        var filterdata = [];
                        var len = results.length;
                        var index = 0;
                        for(var i=0; i<len; i+=1) {
                            if( results[i] ) {
                                filterdata[index] = results[i];
                                index +=1;
                            }
                        }
                        cb(err, filterdata);
                    } else {
                        cb(err, results);
                    }
                }
            }
        }
        filterfunc(data[idx], runnext);
    }

    while(len) { len -= 1; runeach(len); }
};

obj.filter = obj.filterParallel;

var arrayXduce = function(xdata, xducer, cb, xo) {
    cb = cb || noopfn;
    var len = xdata.length;
    var results = new Array(len);
    var cnt = len;

    function runeach(idx) {
        var called;
        function runnext(err, data) {
            if( idx === null ) {
                called_already(err, data);
                return;
            }
            //console.log('err', err, 'data', data, 'idx', idx);
            if( !err ) { 
                results[idx] = data;
                idx = null;
                cnt -= 1;
                if( !cnt ) {
                    if( !called ) {
                        called = 1;
                        if( xo ) {
                            cb(err, results);
                            return;
                        }
                        var ary = [],
                            reslen = results.length;
                        for(var i=0; i<reslen; i+=1) {
                            if( results[i] !== undefined ) {
                                ary.push(results[i]);
                            }
                        }
                        cb(err, ary);
                    }
                }
            } else {
                if( !called ) {
                    called = 1;
                    cb(err, results);
                }
            }
        }
        runXduce(xdata[idx], xducer, runnext);
    }

    while(len) { len -= 1; runeach(len); }
};

obj.mapParallel = function(data, mapfunc, cb) {
    cb = cb || noopfn;
    var len = data.length;
    var results = new Array(len);
    var cnt = len;
    var called = 0;

    function runeach(idx) {
        var idxcalled;
        function runnext(err, data) {
            if( !idxcalled ) {
                idxcalled = 1;
            } else {
                called_already(err, data);
                return;
            }
            if( !err ) { 
                results[idx] = data;
                cnt -= 1;
                if( !cnt ) {
                    if( !called ) {
                        called = 1;
                        cb(err, results);
                    }
                }
            } else {
                if( !called ) {
                    called = 1;
                    cb(err, results);
                }
            }
        }
        mapfunc(data[idx], runnext);
    }

    while(len) { len -= 1; runeach(len); }
};

obj.eachLimit = function(data, mapfunc, limit, cb) {
    obj.mapLimit(data, mapfunc, limit, cb);
};

obj.eachSeries = function(data, mapfunc, cb) {
    obj.mapLimit(data, mapfunc, 1, cb);
};

obj.each = function(data, mapfunc, cb) {
    obj.map(data, mapfunc, cb);
};

obj.mapAll = function(data, mapfunc, cb) {
    cb = cb || noopfn;
    var len = data.length;
    var results = new Array(len);
    var cnt = len;

    function runeach(idx) {
        function runnext(err, data) {
            if( idx === null ) {
                called_already(err, data);
                return;
            }
            if( !err ) { 
                results[idx] = data;
            } else {
                results[idx] = err;
            }
            cnt -= 1;
            idx = null;
            if( !cnt ) {
                cb(err, results);
                cb = noopfn;
            }
        }
        mapfunc(data[idx], runnext);
    }

    while(len) { len -= 1; runeach(len); }
};


obj.map = obj.mapParallel;
obj.mapAllParallel = obj.mapAll;

obj.filterLimit = function(data, filterfunc, max, cb) {
    cb = cb || noopfn;
    var len = data.length;
    if( !max || max>len )
        throw_limiterr();
    var results = [];
    var remaining = 0;
    var called = 0;

    function runeach(idx) {
        var idxcalled;
        function runnext(err, counted) {
            if( !idxcalled ) {
                idxcalled = 1;
            } else {
                called_already(err, counted);
                return;
            }
            if( !err ) { 
                remaining -= 1;
                if( counted )
                    results[idx] = data[idx];
                if( runcnt<len ) {
                    if( !called ) {
                        remaining += 1;
                        runeach(runcnt++);
                    }
                } else {
                    if( !remaining && !called ) {
                        called = 1;
                        var filterdata = [];
                        var index = 0;
                        for(var i=0; i<len; i+=1) {
                            if( results[i] ) {
                                filterdata[index] = results[i];
                                index += 1;
                            }
                        }
                        cb(err, filterdata);
                    }
                }
            } else {
                if( !called ) {
                    called = 1;
                    cb(err, results);
                }
            }
        }
        filterfunc(data[idx], runnext);
    }

    for(var runcnt=0; runcnt<max; runcnt+=1 ) { remaining += 1;  runeach(runcnt); }
};

obj.mapLimit = function(data, mapfunc, max, cb) {
    cb = cb || noopfn;
    var len = data.length;
    if( !max || max>len )
        throw_limiterr();
    var results = [];
    var remaining = 0;
    var called = 0;

    function runeach(idx) {
        var idxcalled;
        function runnext(err, data) {
            if( !idxcalled ) {
                idxcalled = 1;
            } else {
                called_already(err, data);
                return;
            }
            if( !err ) { 
                remaining -= 1;
                results[idx] = data;
                if( runcnt<len ) {
                    if( !called ) {
                        remaining += 1;
                        runeach(runcnt++);
                    }
                } else {
                    if( !remaining && !called ) {
                        called = 1;
                        cb(err, results);
                    }
                }
            } else {
                if( !called ) {
                    called = 1;
                    cb(err, results);
                }
            }
        }
        mapfunc(data[idx], runnext);
    }

    for(var runcnt=0; runcnt<max; runcnt+=1 ) { remaining += 1;  runeach(runcnt); }
};

obj.parallel = function(tasks, done) {
    done = done || noopfn;
    var len = tasks.length, results = [], idx=len;
    function eachtsk(idx) {
      return function store(err, data) {
        if( idx === null ) {
            if( done !== noopfn )
                called_already(err, data);
            return;
        }
        if( !err ) {
          results[idx] = data;
          idx = null;
          len -= 1;
        } else {
          len = 0;
        }
        if( !len ) {
            done(err, results);
            done = noopfn;
        }
      };
    }
    while(idx) { idx -= 1; 
        //console.log('tasks idx', tasks[idx]);
        tasks[idx](eachtsk(idx)); 
    }
};

obj.all = function(tasks, done) {
    done = done || noopfn;
    var len = tasks.length, results = [], idx=len;
    function eachtsk(idx) {
      return function store(err, data) {
        if( idx === null ) {
            if( done !== noopfn )
                called_already(err, data);
            return;
        }
        if( !err )
            results[idx] = data;
        else
            results[idx] = err;
        idx = null;
        len -= 1;
        if( !len ) {
            done(null, results);
            done = noopfn;
        }
      };
    }
    while(idx) { idx -= 1; tasks[idx](eachtsk(idx)); }
};

obj.race = function(tasks, done) {
    done = done || noopfn;
    var idx = tasks.length;
    function once(err, data) {
        if( !err ) {
            done(null, data);
        } else {
            done(err, null);
        }
        done = noopfn;
    }
    while(idx) { idx -= 1; tasks[idx](once); }
};

obj.parallelLimit = function(tasks, max, done) {
    if( !max || max>tasks.length ) {
        throw_limiterr();
    }

    done = done || noopfn;
    var results = [],
        runcnt = max - 1,
        cnt = runcnt;

    function eachfnLimit(idx) {
      return function store(err, data) {
        var i = idx;
        if( i === null ) {
            called_already(err, data);
            return;
        }
        if( !err ) {
          results[i] = data;
          runcnt += 1;
          idx = null;
          var rc = runcnt;
          var tsk = tasks[rc];
          if( tsk ) {
              tsk(eachfnLimit(rc));
          } else if( cnt ) {
              cnt -= 1;
          } else {
              done(err, results);
              done = noopfn;
          }
        } else {
            done(err, results);
            done = noopfn;
        }
      };
    }
    for(var i=0; i<max; i+=1) { 
        tasks[i](eachfnLimit(i));
    }
};

obj.Noapply = function(fn) {
    var args = [].slice.call(arguments, 1);
    return function() {
        var len = arguments.length, moreargs;
        if( len>0 ) {
            moreargs = [].slice.call(arguments);
            for(var i=0; i<len; i++) {
                args.push(moreargs[i]);
            }
        }
        return fn.apply(null, args);
    };
};

function noopfn() {}

function called_already(err, data) {
    
    var called = 'callback called already';
    if( !obj.silent )
        console.error(called + '; err=', err, '; data=', data);
    if( obj.trace )
        console.trace(called + ' stack');
    else
        if( obj.errout )
            throw new Error(called);
}

function throw_limiterr() {
    throw new Error('limit not specified or too big');
}

obj.trace = 0;
obj.silent = 0;

})(typeof module === 'object' && typeof exports === 'object'?exports:this.sonicAsync=this.sonicAsync||{});
