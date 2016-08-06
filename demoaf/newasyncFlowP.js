function asyncFlow(fns, cb) {
    var len = fns.length;
    //var results = [];

    //var runningCnt = len;



    while( len ) {
        len -= 1;
        var next = new Next(len, cb);
        fns[len](next.runnext.bind(next));
    }
}
    function Next(idx, cb) {
        this.idx = idx;
        if( !this.runningCnt ) {
            this.runningCnt = idx;
            this.cb = cb;
        }
    }
    Next.results = [];
    Next.prototype.runnext = function(err, data) {
        console.log('idx', this, this.idx);
        this.runningCnt -= 1;
        if( !err ) { 
            Next.results[this.idx] = data; 
        } else {
            this.runningCnt = 0;
        }

        //runningCnt?null:cb(err, results);
        if( !this.runningCnt ) {
            this.cb(err, Next.results);
        } 
        /*
        */
    }

//if( typeof module == 'object' && typeof module.exports == 'object' )
if( typeof module == 'object' )
    module.exports = asyncFlow;
