var tst = 0;
if( tst ) {
    var numtsks = 50000;
    var endcnt = 50;
    var half = numtsks/2;
} else {
    var numtsks = 5
    var half = numtsks/2;
    var endcnt = 1;
}


var startSeries = function() {
    var start = performance.now();
    var runcnt = 0;
    for(var i=0;i<endcnt;i++) {
    asyncFlow.series(
        mk_wrapper(numtsks),
        function(err, results) {
            runcnt++;
            if( tst && runcnt>=(endcnt-1) )
                console.log(runcnt, 'series done', perf(start)); 
            else if( !tst )
                console.log(runcnt, 'series done', perf(start)); 
        },
        1
    );
    }
};

var startParallel = function() {
    var start = performance.now();
    var runcnt = 0;
    for(var i=0;i<endcnt;i++) {
    asyncFlow.parallel(
        mk_wrapper(numtsks),
        function(err, results) {
            runcnt++;
            if( tst && runcnt>=(endcnt-1) )
                console.log(runcnt, 'parallel done', perf(start)); 
            else if( !tst )
                console.log(runcnt, 'parallel done', perf(start)); 
        }
    );
    }
};

var startWaterfall = function() {
    var start = performance.now();
    var runcnt = 0;
    for(var i=0;i<endcnt;i++) {
    asyncFlow(
        mk_wrapper(numtsks),
        function(err, results) {
            runcnt++;
            if( tst & runcnt>=(endcnt-1) )
                console.log(runcnt, 'waterfall done', perf(start)); 
            else if( !tst )
                console.log('waterfall done', results);
        },
        1
    );
    }
};

var startIterator = function() {
    asyncFlow(
        [
            function(callback) {
            genericIntervalDraw(0, 450, iteratorCanvas, 30, 'red', 1, callback)},
            function(callback) {
            genericIntervalDraw(0, 450, iteratorCanvas, 60, 'blue', 1, callback)},
            function(callback) {
            genericIntervalDraw(0, 450, iteratorCanvas, 90, 'green', 1, callback)
            }
        ], 
        function(err, results) {
             console.log('Iterator done', results);
        }, 3
    );
};

var startEachLimit = function() {
    var start = performance.now();
    var runcnt = 0;
    
    for(var perfi=0;perfi<endcnt;perfi++) {
    asyncFlow(
        mk_wrapper(numtsks),
        function(err) {
            runcnt++;
            if( tst && runcnt>=(endcnt-1) )
                console.log(runcnt, 'limit done', perf(start)); 
            else if( !tst )
                console.log(runcnt, 'limit done', perf(start)); 
        },
        half
    );
    }
};

var startNesting = function() {
    asyncFlow(
        [
            function(callback) {
                asyncFlow(
                    [
                        function(callback) {
                            asyncFlow(
                                [
                                    function(callback) {
                                        genericIntervalDraw(0, 150, nestingCanvas, 30, 'blue', 1, callback);
                                    },
                                    function(callback) {
                                        genericIntervalDraw(150, 150, nestingCanvas, 60, 'red', 1, callback);
                                    }
                                ],
                                function(err, results) {
                                    callback(null, null); 
                                }
                            ); 
                        },
                        function(callback) {
                            asyncFlow(
                                [
                                    function(callback) {
                                        genericIntervalDraw(0, 150, nestingCanvas, 90, 'green', 1, callback);
                                    },
                                    function(callback) {
                                        genericIntervalDraw(150, 150, nestingCanvas, 120, 'pink', 1, callback);
                                    }
                                ],
                                function(err, results) {
                                    callback(null, null); 
                                }
                            ); 
                        }
                    ],
                    function(err, results) {
                        callback(null, null); 
                    }
                );
            },
            function(callback) {
                asyncFlow(
                    [
                        function(callback) {
                            genericIntervalDraw(300, 150, nestingCanvas, 150, 'cyan', 1, callback);
                        }, 
                        function(callback) {
                            genericIntervalDraw(300, 150, nestingCanvas, 180, 'grey', 1, callback);
                        }
                    ],
                    callback
                );
            }
        ],
        function(err, results) {
            console.log('nesting done');   
        }
    );
};
