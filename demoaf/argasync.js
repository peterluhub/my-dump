
function waterfall(fni, cb) {
    var seqNum = 1;
    function runnext(err, data) {
        var  fn = fns[seqNum];
        if( !err ) { 
            if( fn ) {
                //console.log('seqNum', seqNum, len);
                seqNum += 1;
                fn[0].apply(null, fn[1]);
            } else {
                cb(err, data);
            }
        } else {
            cb(err, data);
        }
    }

    var fns = fni(err, data, runnext);
    fns[0][0].apply(null, fns[0][1]);
}
    module.exports = waterfall;
