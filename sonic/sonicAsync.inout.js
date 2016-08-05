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
        core,
        cbfunc,
        limit,
        sync;
    var api = {
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
        push: function(fn) { 
            fnchain.push({push:1});
            return api;
        },
        reduce: function(fn, reduce_type) { 
            fn.reduce_type = reduce_type;
            fn.reduce = 1;
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
            xducers = mk_xducers(fnchain);
            //console.log('xducers', xducers(1), 'sync', sync, 'cbfunc', cbfunc);
            if( options.sync ) {
                fnchk(funclst, sync_supported, 'sync');
                return obj.transduce(xducers, options);
            } else {
                fnchk(funclst, async_supported, 'async');
                return obj.transduce(xducers, options, cbfunc);
            }
        }
    };

    function mk_xducers(fns) {
        var len = fns.length;
        var i=0;
        var core;
        var mftype;
        //console.log('len', len, fns);
        while(i<len) {
            console.log('enter while', i);
            if( i===0 ) {
                console.log('enter core', i);
                if( fns[i].map ) {
                    core = (function(m){
                        return function(x) { return m(x);};
                    })(fns[i]);
                    ++i;
                    mftype = 'm';
                } else if( fns[i].filter ) {
                    if( fns[i+1] && fns[i+1].map ) {
                        core = (function(f,m) { 
                            return function(x) { 
                                return f(x) && m(x);
                            };
                        })(fns[i], fns[i+1]);
                        i += 2;
                        mftype = 'm';
                        console.log('enter core filter map', i);
                    } else if( fns[i+1] && fns[i+1].filter ) {
                        mftype = 'f';
                        core = (function(f,f1) { 
                            if( (i+2) === len ) {
                                return function(x) { 
                                    return f(x) && f1(x) && x;
                                };
                            } else {
                                return function(x) { 
                                    console.log('core f(x) && f1(x)', f(x) && f1(x), x);
                                    return f(x) && f1(x) && x;
                                };
                            }
                        })(fns[i], fns[i+1]);
                        i += 2;
                        console.log('enter core filter filter', i);
                    } else {
                        core = (function(f) { 
                            return function(x) { 
                                return f(x) && x;
                            };
                        })(fns[i]);
                    }
                    console.log('enter core filter', i);
                } else if( fns[i].push ) {
                    core = (function(f) { 
                        var pa = [];
                        return function(x) { 
                            pa.push(x);
                            return pa;
                        };
                    })(fns[i]);
                    i++;
                    mftype = 'p';
                } else if( fns[i].reduce ) {
                    core = (function(f) { 
                        var val = f.reduce_type;
                        return function(x) { 
                            val = f(x, val);
                            return val;
                        };
                    })(fns[i]);
                    i++;
                    mftype = 'r';
                }
            } else {
                if( fns[i].map ) {
                    if( mftype == 'm' ) {
                        core = (function(f, core){
                            return function(x) { 
                                var v = core(x);
                                console.log('map v', v, x, v&&f(v));
                                return (v===0||v)&&f(v);
                            };
                        })(fns[i], core);
                        mftype = 'm';
                        i+=1;
                    } else if( mftype == 'f' ) {
                        core = (function(m,f) { 
                            return function(x) { 
                                var v = f(x);
                                //console.log('f(x) && m(x)', f(x) && m(x), x);
                                return v && m(v);
                            };
                        })(fns[i], core);
                    }
                    mftype = 'm';
                    i++;

                } else if( fns[i].filter ) {
                    if( mftype == 'f' ) {
                        if( fns[i+1] && fns[i+1].map ) {
                            core = (function(f,m,f1) { 
                                return function(x) { 
                                    var v = f1(x);
                                    console.log('f1(x)', x, v);
                                    return v && f(v) && m(v);
                                };
                            })(fns[i], fns[i+1], core);
                            i += 2;
                            mftype = 'm';
                        } else if( fns[i+1] && fns[i+1].filter ) {
                            core = (function(f,f1,f2) { 
                                return function(x) { 
                                    var v = f2(x);
                                    return f(v) && f1(v) && v;
                                };
                            })(fns[i], fns[i+1], core);
                            i += 2;
                            mftype = 'f';
                        } else {
                            core = (function(f,f1) { 
                                return function(x) { 
                                    var v = f1(x);
                                    return f(v) && v;
                                };
                            })(fns[i], core);
                        }
                    } else if( mftype == 'm' ) {
                        if( fns[i+1] && fns[i+1].map ) {
                            core = (function(f,m,m1) { 
                                return function(x) { 
                                    var v = m1(x);
                                    return f(v) && m(v);
                                };
                            })(fns[i], fns[i+1], core);
                            i += 2;
                            mftype = 'm';
                        } else if( fns[i+1] && fns[i+1].filter ) {
                            core = (function(f,f1,f2) { 
                                return function(x) { 
                                    var v = f2(x);
                //console.log('f(v) && f1(v) && v', f(v) && f1(v) && v, v, f(v), f1(v), f2(x));
                //console.log('f(v) f1(v)', f, f1);
                                    return f(v) && f1(v) && v;
                                };
                            })(fns[i], fns[i+1], core);
                            i += 2;
                            mftype = 'f';
                        } else {
                            core = (function(f,m) { 
                                return function(x) { 
                                    var v = m(x);
                                    return f(v) && v;
                                };
                            })(fns[i], core);
                            i++;
                        }
                    }
                } else if( fns[i].push ) {
                    core = (function(f) { 
                        var pa=[];
                        return function(x) { 
                            var v = f(x);
                            //console.log('v, pa', v, pa);
                            if( v ) {
                                pa.push(v);
                                return pa;
                            } else {
                                return pa;
                            }
                        };
                    })(core);
                    i++;
                    mftype = 'p';
                } else if( fns[i].reduce ) {
                    core = (function(f, f1) { 
                        var val = f.reduce_type;
                        return function(x) { 
                            var v = f1(x);
                            if(v) {
                                val = f(v, val);
                                return val;
                            } else {
                                return val;
                            }
                        };
                    })(fns[i], core);
                    i++;
                    mftype = 'r';
                }
            }
        }
        //console.log('core', util.inspect(core, true, 7, true));
        return core;
    }

    return api;
};

obj.transduce = function(fns, options, cb) {
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
                return syncArrayXduce(initdata, fns, options);
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

function syncArrayXduce(data, fns, options) {
    var len = data.length,
        val,
        i;

    //console.log('options', fns, options);
    for(i=0; i<len; i++) {
        val=fns(data[i]);
    //console.log('val', val);
    }
    return val;
}

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
