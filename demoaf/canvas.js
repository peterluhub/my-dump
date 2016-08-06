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

var paraCanvas = document.getElementById('paraCanvas');
var startSeries = function() {
    var start = performance.now();
    var runcnt = 0;
    for(var i=0;i<endcnt;i++) {
    async.series(
        mk_wrapper(numtsks),
        function(err, results) {
            runcnt++;
            if( tst && runcnt>=(endcnt-1) )
                console.log(runcnt, 'series done', perf(start)); 
            else if( !tst )
                console.log(runcnt, 'series done', perf(start)); 
        }
    );
    }
};

var startParallel = function() {
    var start = performance.now();
    var runcnt = 0;
    for(var i=0;i<endcnt;i++) {
    async.parallel(
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
    for(var i=0;i<3;i++) {
    async.waterfall(
        [
            function(callback) {
                genericIntervalDraw(0, 150, waterfallCanvas, 30, 'red', 1, callback);
            },
            function(arg1, arg2, callback) {
                genericIntervalDraw(arg1, 150, waterfallCanvas, arg2 + 30, 'blue', 1, callback);
            },
            function(arg1, arg2, callback) {
                genericIntervalDraw(arg1, 150, waterfallCanvas, arg2 + 30, 'green', 1, callback);
            }
        ], function(err, results) {
            runcnt++;
            if( tst && runcnt>=(endcnt-1) )
                console.log(runcnt, 'waterfall done', perf(start)); 
            else if( !tst )
                console.log(runcnt, 'waterfall done', perf(start)); 
        }
    );
    }
};

var startIterator = function() {
    var runcnt = 0;
    async.iterator(
        [
            genericIntervalDraw(0, 450, iteratorCanvas, 30, 'red', 1, function() {}),
            genericIntervalDraw(0, 450, iteratorCanvas, 60, 'blue', 1, function() {}),
            genericIntervalDraw(0, 450, iteratorCanvas, 90, 'green', 1, function() {}),
        ]
    );
};

var startEachLimit = function() {
    var start = performance.now();
    var runcnt = 0;
    for(var i=0;i<endcnt;i++) {
    async.eachLimit(
        mk_wrapper(numtsks),
        half,
        function(item, callback) {
            item(callback);
        },
        function(err) {
            runcnt++;
            if( tst && runcnt>=(endcnt-1) )
                console.log(runcnt, 'limit done', perf(start)); 
            else if( !tst )
                console.log(runcnt, 'limit done', perf(start)); 
        }
    );
    }
};

var startNesting = function() {
    async.series(
        [
            function(callback) {
                async.parallel(
                    [
                        function(callback) {
                            async.series(
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
                            async.series(
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
                async.each(
                    [
                        function(callback) {
                            genericIntervalDraw(300, 150, nestingCanvas, 150, 'cyan', 1, callback);
                        }, 
                        function(callback) {
                            genericIntervalDraw(300, 150, nestingCanvas, 180, 'grey', 1, callback);
                        }
                    ],
                    function(item, callback) {
                        item(callback); 
                    },
                    callback
                );
            }
        ],
        function(err, results) {
            console.log('nesting done');   
        }
    );
};
