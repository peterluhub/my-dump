var paraCanvas = document.getElementById('paraCanvas');
var seriesCanvas = document.getElementById('seriesCanvas');
var waterfallCanvas = document.getElementById('waterfallCanvas');
var iteratorCanvas = document.getElementById('iteratorCanvas');
var limitCanvas = document.getElementById('limitCanvas');
var nestingCanvas = document.getElementById('nestingCanvas');

var drawFromTo = function(from, to, ctx, y, color) {
    var col = color || 'red';

    ctx.beginPath();
    ctx.moveTo(from, y);
    ctx.lineTo(to, y);
    ctx.strokeStyle = col;
    ctx.stroke();
};

var genericIntervalDraw = function(from, distance, canvas, fromTop, color, steps, callback) {
    var ctx = canvas.getContext('2d');
    var lastPoint = from;    
    var intervalID = setInterval(function() {
        drawFromTo(lastPoint, lastPoint + steps, ctx, fromTop,  color);
        lastPoint += steps;
        if(lastPoint >= from + distance) {
            clearInterval(intervalID);
            callback(null, lastPoint, fromTop);
            //callback(null, lastPoint, fromTop);
        }
    }, 10);
};

var resetCanvas = function(canvasID) {
    var canvas = document.getElementById(canvasID);
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 500, 200);
};

var startSeries = function() {
    sonicAsync.series(
        [
            function(callback) {
                genericIntervalDraw(0, 150, seriesCanvas, 30, 'red', 1, callback);
            },
            function(callback) {
                genericIntervalDraw(0, 150, seriesCanvas, 60, 'blue', 1, callback);
            },
            function(callback) {
                genericIntervalDraw(0, 150, seriesCanvas, 90, 'green', 1, callback);
            }
        ], function(err, results) {
             console.log('series done');
        }
    );
};

var startParallel = function() {
    sonicAsync.parallel(
        [
            function(callback) {
                genericIntervalDraw(0, 450, paraCanvas, 30, 'red', 1, callback);
            },
            function(callback) {
                genericIntervalDraw(0, 450, paraCanvas, 60, 'blue', 1, callback);
            },
            function(callback) {
                genericIntervalDraw(0, 450, paraCanvas, 90, 'green', 1, callback);
            }
        ], function(err, results) {
             console.log('parallel done');
        }
    );
};

var startWaterfall = function() {
    sonicAsync.waterfall(
        [
            function(data, callback) {
                genericIntervalDraw(0, 150, waterfallCanvas, 30, 'red', 1, callback);
            },
            function(arg1,  callback) {
                genericIntervalDraw(arg1, 150, waterfallCanvas, 30 + 30, 'blue', 1, callback);
            },
            function(arg1,  callback) {
                genericIntervalDraw(arg1, 150, waterfallCanvas, 60 + 30, 'green', 1, callback);
            }
        ], function(err, results) {
             console.log('waterfall done');
        }
    );
};

var startIterator = function() {
    sonicAsync.iterator(
        [
            genericIntervalDraw(0, 450, iteratorCanvas, 30, 'red', 1, function() {}),
            genericIntervalDraw(0, 450, iteratorCanvas, 60, 'blue', 1, function() {}),
            genericIntervalDraw(0, 450, iteratorCanvas, 90, 'green', 1, function() {}),
        ]
    );
};

var startEachLimit = function() {
    sonicAsync.eachLimit(
        [
            function(callback) {
                genericIntervalDraw(0, 150, limitCanvas, 30, 'red', 1, callback);
            }, 
            function(callback) {
                genericIntervalDraw(0, 150, limitCanvas, 60, 'green', 1, callback);
            }, 
            function(callback) {
                genericIntervalDraw(0, 150, limitCanvas, 90, 'grey', 1, callback);
            }, 
            function(callback) {
                genericIntervalDraw(0, 150, limitCanvas, 120, 'pink', 1, callback);
            }, 
            function(callback) {
                genericIntervalDraw(0, 150, limitCanvas, 150, 'cyan', 1, callback);
            }, 
            function(callback) {
                genericIntervalDraw(0, 150, limitCanvas, 180, 'blue', 1, callback);
            }, 
        ],
        function(item, callback) {
            item(callback);
        },
        2,
        function(err) {
            console.log('limit done'); 
        }
    );
};

var startNesting = function() {
    sonicAsync.series(
        [
            function(callback) {
                sonicAsync.parallel(
                    [
                        function(callback) {
                            sonicAsync.series(
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
                            sonicAsync.series(
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
                sonicAsync.each(
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
