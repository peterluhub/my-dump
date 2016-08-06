//http://www.devblogrbmz.com/playing-around-with-async-js/
//
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
    var rn = 0;
    var intervalID = setTimeout(function() {
        callback(null, 150, 150);
    }, rn);
};

var resetCanvas = function(canvasID) {
    var canvas = document.getElementById(canvasID);
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 500, 200);
};

function perf(start) {
    var end = performance.now();
    var diff = parseFloat(end-start);
    return ';  took ' + diff + ' miliseconds';
}
