
function mk_wrapper(n) {
    var nfuncs = [];

    var vp = 20;
    var ep = 100;
    var color = 'green';
    for(var i=0; i<n; i++) {
        (function(color) {
        nfuncs.push(function(callback) {
            genericIntervalDraw(0, ep++, seriesCanvas, vp++, color, 1, callback);
        });
        })(color);
        if( color == 'green' )
            color = 'blue';
        else if( color == 'red' )
            color = 'green';
        else if( color == 'blue' )
            color = 'red';
    }
    return nfuncs;
}

