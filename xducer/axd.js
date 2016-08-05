//var util = require('util');

(function(obj) {
"use strict";

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
    var setlv = [];
    var rvtype;
    return function (op) {
        function getlv(val) {
            if( rvtype )
                var rc = setlv.splice(0, setlv.length);
            else
                var rc = setlv[0];
            /*
            var rc = setlv[0];
            if( rc instanceof Array ) {
                setlv[0] = [];
            } else if( rc instanceof Object ) {
                setlv[0] = {};
            }
            */
            //console.log('===getlv', rc, setlv[0]);
            return rc;
        }
        if( op ) {
            if( op === 1 )
                return setlv;
            else
                rvtype = op;
        } else {
            return getlv;
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
        if(nf(x) )
           sv[0] = m(x);
    }
}

function emm(sv, m, nm){
    return function(x) { 
        sv[0] = m(nm(x));
    }
}

function em(sv, m){
    return function(x) { 
        sv(m(x));
    }
}

function efe(sv, fn){
    return function(x) { 
        sv[0] = fn(x);
        //console.log('sv', 'sv.val', sv.val, 'x=', x);
    }
}
function eff(sv, f, nf){
    function ffe(x) { 
        if( nf(x) && f(x) ) 
            sv[0] = x;
    }
    return ffe;
}

function efm(sv, f, nm){
    return function(x) { 
        var v = nm(x);
        if( f(v) ) 
            sv[0] = v;
    }
}

function ef(sv, f){
    return function(x) { 
        if( f(x) ) 
            sv[0] = x;
    }
}

function erfm(sv, r, nf, nm) { 
    sv[0]= r.reduce_type;
    
    //console.log('r==', sv, sv[0]);
    return function erduce(x) { 
        var v = nm(x);
        if( nf(v) )
            sv[0] = r(v, sv[0]);
        //console.log('erfmr', x, sv[0], v);
    };
    return erduce;
}

function er(sv, r) { 
    sv[0]= r.reduce_type;
    //console.log('reduce_type', r.reduce_type, 'r', r);

    
    return function erduce(x) { 
        //console.log('b==', x, sv[0]);
        sv[0] = r(x, sv[0]);
        //console.log('r==', x, sv[0]);
    };
    return erduce;
}

function ep(sv) { 
    //sv[0] = [];
    return function(x) { 
        //console.log('p', x, sv);
        sv.push(x);
        //sv[0].push(x);
    };
}

function et(sv, etake, limit) { 
    //console.log('et sv', sv[0]);
    //sv[0] = [];
    var cnt=1;
    return function(x) { 
        //console.log('inner et sv', sv[0], x, sv[1], sv[2]);
        /*
        if( sv[1] < sv[2] ) {
            sv[0].push(x);
            sv[1] += 1;
        */
        if( cnt<=limit ) {
            sv[0] = x;
            cnt += 1;
        } else {
            cnt = 1;
            etake();
        }
        //console.log('p', x, limit, cnt, 'v=',val);
    };
}

function mm(m, nm, c){
    return function(x) { 
        //console.log('mm', m(nm(x)), nm(x), x )
        c(m(nm(x)));
    }
};

function mf(m, nf, c){
    return function(x) { 
        nf(x) && c(m(x));
    }
};

function m(m, c){
    //console.log('map x', m);
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

function p(sv, c) { 
    //console.log('px', sv, sv[0])
    return function(x) { 
        sv.push(x);
        c(sv.slice(0));
        //console.log('px===', sv[0], x)
    };
}

function r(sv, fn, c) { 
    sv[0] = fn.reduce_type;
    console.log('rx', sv, sv[0])
    return function(x) { 
        //console.log('rx===', sv, sv[0], x)
        sv[0] = fn(x, sv[0]);
        //console.log('rx===', sv[0], x)
        c(sv[0]);
    };
}

function t(etake, c, limit) { 
    var cnt = 1;
    return function(x) { 
        //console.log('=====x', x, cnt, limit, cnt<limit);
        if( cnt <= limit ) {
            cnt += 1;
            c(x) 
        } else {
            cnt = 1;
            etake();
        }
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
    //console.log('lastval 1===', lastval(1))
    var api = {
        forEach: function(fn) { 
            fnchain.push(fn);
            fn.forEach = 1;
            return this;
        },
        map: function(fn) { 
            fnchain.push(fn);
            fn.map = 1;
            return this;
        },
        filter: function(fn) { 
            fnchain.push(fn);
            fn.filter = 1;
            return this;
        },
        skip: function(fn) { 
            fnchain.push({skip:fn});
            return this;
        },
        skipWhile: function(fn) { 
            fnchain.push(fn);
            fn.skipWhile = true;
            return this;
        },
        takeWhile: function(fn) { 
            options.takeWS = trueFalse();
            fnchain.push(fn);
            takefn = endTake();
            //console.log('takeWhile', ws, fn.takeWhile);
            fn.takeWS = trueFalse(true);
            return this;
        },
        take: function(fn) { 
            if( !fn ) {
                throw new Error('take function must have an argument > 0');
            }

            var takefake = function(){};
            takefake.take = fn;
            takefake.takev = [];
            fnchain.push(takefake);
            takefn = endTake();
            return this;
        },
        takeResult: function(fn) { 
            //var lr = 'LimitReached';
            //options.LimitReached = lr;
            //fnchain.push({take:fn, LimitReached:lr});
            options.takeResult = fn;
            return this;
        },
        push: function mypush() { 
        //            options.pushinitval = [];
        //            options.pushinitval[0] = [];
            fnchain.push(mypush);
            mypush.push = true;
            return this;
        },
        reduce: function(fn, reduce_type) { 
            fn.reduce_type = reduce_type;
            options.reduce_type = reduce_type;
            fn.reduce = true;
            fnchain.push(fn);
            return this;
        },
        cb: function(fn) { 
           cbfunc = fn;
           funclst.c = 1;
           return this; },
        limit: function(fn) { 
           options.limit = fn;
           funclst.l = 1;
           return this; },
        sync: function() { 
           options.sync = 'sync'; 
           return this; },
        create: function() { 
            options.sv = lastval(1);
            xducers = mk_xducers(fnchain, lastval, takefn, options);
            //console.log('xducers', xducers(1), 'sync', sync, 'cbfunc', cbfunc);
            if( options.sync ) {
                //fnchk(funclst, sync_supported, 'sync');
                options.lastval = lastval(1);
                //console.log('cre lastval', options.lastval)
                return transduce(xducers, options, null, lastval(), takefn);
                //return obj.transduce(xducers, options, null, lastval(), takefn);
            } else {
                fnchk(funclst, async_supported, 'async');
                return obj.transduce(xducers, options, cbfunc);
            }
        }
    };


    return api;
};

    function mk_xducers(fns, lastval, takefn, options) {
        var i = fns.length-1,
            len = i,
            ni,
            fn,
            nfn,
            core,
            chain=[],
            mftype;
        if( i===0 ) return noopfn;
        //console.log('len', len, i);
        while(i>=0) {
            //console.log('enter while', i);
            ni = i - 1;
            fn = fns[i];
            nfn = fns[ni];
            if( i === len ) {
                //var sv = lastval(1);
                //console.log('===sv lastval', sv);
                if( fn.map ) {
                    if( nfn && nfn.map ) {
                        (function(fn, nfn) {
                        chain.push(function(sv){ return emm(sv, fn, nfn)});
                        })(fn, nfn);
                        i -= 2;
                    } else if( nfn && nfn.filter ) {
                        (function(fn, nfn) {
                        chain.push(function(sv){ return emf(sv, fn, nfn)});
                        })(fn, nfn);
                        i -= 2;
                    } else {
                        (function(fn) {
                        chain.push(function(sv){ return em(sv, fn)});
                        })(fn);
                        i = ni;
                    }
                    //console.log('enter core map', i);
                } else if( fn.filter ) {
                    if( nfn && nfn.map ) {
                        (function(fn, nfn) {
                        chain.push(function(sv){ return efm(sv, fn, nfn)});
                        })(fn, nfn);
                        i -= 2;
                    } else if( nfn && nfn.filter ) {
                        (function(fn, nfn) {
                        chain.push(function(sv){ return eff(sv, fn, nfn)});
                        })(fn, nfn);
                        i -= 2;
                    } else {
                        (function(fn) {
                        chain.push(function(sv){ return ef(sv, fn)});
                        })(fn);
                        i = ni;
                    }
                    //console.log('enter core filter', i);
                } else if( fn.reduce ) {
                    options.initval = options.reduce_type;
                            options.reduecinitval = [];
                            options.reduecinitval[0] = options.reduce_type;
                    if( nfn && nfn.filter ) {
                        if( fns[i-2] && fns[i-2].map ) {
                            var nfm = fns[i-2];
                        (function(fn, nfn, nfm) {
                            chain.push(function(sv){ return erfm(sv, fn, nfn, nfm)});
                        })(fn, nfn, nfm);
                            i -= 3;
                            //console.log('enter fm only reduce', i);
                        } else {
                        (function(fn) {
                            chain.push(function(sv){ return er(sv, fn)});
                        })(fn);
                            i = ni;
                        }
                    } else {
                        //console.log('enter only reduce', fn);
                        (function(fn) {
                        chain.push(function(sv){ return er(sv, fn)});
                        })(fn);
                        i = ni;
                        //console.log('enter only reduce', i);
                    }
                    //console.log('enter core reduce', i);
                } else if( fn.push ) {
                    //sv[0] = [];
                    lastval(2);
                    core = ep(sv);
                    i = ni;
                } else if( fn.take ) {
                    /*
                    sv[0] = null;
                    sv[1] = 0;
                    sv[2] = fn.take;
                    */
                    core = et(sv, takefn, fn.take);
                    i = ni;
                } else if( fn.forEach ) {
                    core = efe(sv, fn)
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
                        (function(fn, nfn) {
                        chain.push(function(core){ return mm(fn, nfn, core)});
                        })(fn, nfn);
                        i -= 2;
                    } else if( nfn && nfn.filter ) {
                        (function(fn, nfn) {
                        chain.push(function(core){ return mf(fn, nfn, core)});
                        })(fn, nfn);
                        i -= 2;
                    } else {
                        (function(fn) {
                        chain.push(function(core){ return m(fn, core)});
                        })(fn);
                        i = ni;
                        //console.log('enter only map', i);
                    }
                    //console.log('enter core map', i);
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
                    core = p([], core);
                    i = ni;
                } else if( fn.reduce ) {
                    options.reduecinitval = [];
                    options.reduecinitval[0] = options.reduce_type;
                    core = r(options.reduecinitval, fn, core);
                    i = ni;
                    console.log('enter core reduce', i);
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
        return chain;
    }

var transduce = function(chain, opt, cb, getval, take) {
    cb = cb || noopfn;

    return function start(initdata) {
        //cb = xcb || cb;
        //return (function() {
        //})(initdata, fns, options, cb, getval, take, cb);
        var fns = chain, options=opt;
        //console.log('xcb', options, initdata);

                /*
                if( 'reduecinitval' in options )
                    options.reduecinitval[0] = options.reduce_type;
                else if( 'initval' in options )
                    options.lastval[0] = options.initval;
                else if( 'pushinitval' in options )
                    options.pushinitval[0] = [];
                while(i<len) {
                    core = fns[i](core);
                    i+=1
                }
                */
                var len = fns.length,
                    lastval = lastVal(),
                    core=fns[0](lastval(1)),
                    i=1;
                len = initdata.length;
                i=0;
    while(i<len) {
        core(initdata[i]);
        i+=1
    }
                //syncArrayXduce(initdata, core, take);
                //console.log('getval', getval);
                return lastval()();
        if( initdata instanceof Array ) {
            if( options.sync ) {
            } else if( options.limit ) {
                console.log('limit');
                arrayXduceLimit(initdata, fns, cb, options);
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
        i=0;

    /*

    if( take) {
        function setLen() { len = 0; }
        take(setLen);
    }

    */

    //for(i=0; i<len;  ) {
    while(i<len) {
        fns(data[i]);
        i+=1
    }
    //return lastval()();
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

})(typeof module === 'object' && typeof exports === 'object'?exports:this.xducer=this.xducer||{});
