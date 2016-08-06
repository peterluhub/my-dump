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
    var ctx = canvas.getContext('2d');
    var lastPoint = from;    
    var rn = Math.random()*10;
    var intervalID = setInterval(function() {
        drawFromTo(lastPoint, lastPoint + steps, ctx, fromTop,  color);
        lastPoint += steps;
        if(lastPoint >= from + distance) {
            clearInterval(intervalID);
            callback(null, {last:lastPoint, from:fromTop});
        }
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
