"use strict";

(function(obj) {
obj.fastWaterfall = function(fns, cb) {
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
}

obj.waterfall = function(fns, cb) {
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
        }
    }

    fns[0](null, next(1));
}

obj.series = function(tasks, cb) {
    obj.parallelLimit(tasks, 1, cb);
}

obj.filterSeries = function(data, filterfunc, cb) {
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
}

obj.mapSeries = function(data, mapfunc, cb) {
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
}

obj.filterParallel = function(data, filterfunc, cb) {
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
}

obj.filter = obj.filterParallel;

obj.mapParallel = function(data, mapfunc, cb) {
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
}


obj.map = obj.mapParallel;

obj.filterLimit = function(data, filterfunc, max, cb) {
    var len = data.length;
    if( !max || max>len )
        throw 'limit not specified or too big';
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
}

obj.mapLimit = function(data, mapfunc, max, cb) {
    var len = data.length;
    if( !max || max>len )
        throw 'limit not specified or too big';
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
}

obj.parallel = function(tasks, done) {
    var len = tasks.length, results = [];
    function eachtsk(idx) {
      return function store(err, data) {
        var i = idx;
        if( i === null ) {
            if( done !== noopfn )
                called_already(err, data);
            return;
        }
        if( !err ) {
          results[i] = data;
          idx = null;
        } else {
          i = 0
        }
        if( !i ) {
            done(err, results);
            done = noopfn;
        }
      }
    }
    while(len) { len -= 1; tasks[len](eachtsk(len)) };
}

obj.parallelLimit = function(tasks, max, done) {
  var len = tasks.length;
  if( !max || max>len ) {
      throw new Error("limit not specified or too big");
  }
  var rk = [max-1, [], done, 0, len, 0];
  
  for(var i=0; i<max; i+=1) { 
      rk[3] += 1;
      eachfnLimit(tasks, i, rk) 
  };
}

function eachfnLimit(tasks, idx, rk) {
  var called;
  function store(err, data) {
    if( !called ) {
        called = 1;
    } else {
        called_already(err, data);
        return;
    }
    rk[3] -= 1;
    if( !err ) {
      rk[1][idx] = data;
      rk[0] += 1;
      if( rk[0] < rk[4] ) {
          rk[3] += 1;
          eachfnLimit(tasks, rk[0], rk);
      } else {
          if( !rk[3] && !rk[5] ) {
            rk[5] = 1;
            rk[2](err, rk[1]);
          }
      }
    } else {
      if( !rk[5] ) {
        rk[5] = 1;
        rk[2](err, rk[1]);
      }
    }
  }
  tasks[idx](store);
}

obj.apply = function(fn) {
    var args = [].slice.call(arguments, 1);
    return function(cb) {
        args.push(cb);
        return fn.apply(null, args);
    };
}

function noopfn() {}

function called_already(err, data) {
    
    if( !obj.silent )
        console.error('callback called already; err=', err, '; data=', data);
    if( obj.trace )
        console.trace('called already stack');
    else
        if( !obj.noerrout )
            throw new Error('callback called already');
}
obj.trace = 0;
obj.silent = 1;
})(typeof module === 'object' && typeof exports === 'object'?exports:this.asyncFlow=this.asyncFlow||{});
