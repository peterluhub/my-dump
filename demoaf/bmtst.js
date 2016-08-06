var bm = require('./bm');

var max = 100000;
var lim = 10;

function pluseq(max) {
    for(var i=0; i<max; ) {
        i += 1;
    }
}

function plusplus(max) {
    for(var i=0; i<max; ) {
        i++;
    }
}

function arraynew(max, lim) {
    for(var i=0; i<max; i+=1 ) {
        var a = new Array(lim);
        for(var j=0; j<lim;j+=1) {
            a[j]=j;
        }
    }
}

function arrayraw(max, lim) {
    for(var i=0; i<max; i+=1) {
        //var a = [0,1,2,3,4,5,6,7,8,9];
        var a = [];
        for(var j=0; j<lim;j+=1) {
            a[j]=j;
        }
    }
}

    var a1=0, a2=1;
function lookuparg(max, lim) {
    function l1() {
        function l2() {
            var a=a1, b=a2;
        }
        l2();
    }
    for(var i=0; i<max; i+=1) {
        l1();
    }
}

function passarg(max, lim) {
    var a1=0, a2=1;
    function l1(a1, a2) {
        function l2(a1, a2) {
            var a=a1, b=a2;
        }
        l2(a1,a2);
    }
    for(var i=0; i<max; i+=1) {
        l1(a1, a2);
    }
}

function loading(max) {}

bm('loading', loading, max, lim);
bm('arrayraw', arrayraw, max, lim);
bm('arraynew', arraynew, max, lim);
//bm('', lookuparg, max, lim);
//bm('', passarg, max, lim);
