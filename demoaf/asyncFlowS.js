(function(obj) {
obj.waterfall = function(fns, cb) {
    var len = fns.length;
    var seqNum = 1;

    function runnext(err, data) {
        var fn;

        if( !err ) { 
            len -= 1;
            if( len ) {
                fn = fns[seqNum];
                seqNum += 1;
                fn(runnext);
            } else {
                cb(err, data);
            }
        } else {
            cb(err, data);
        }
    }

    fns[0](runnext);
}
})(typeof module == 'object' && exports?exports:this.asyncFlow=this.asyncFlow||{});
