function asyncFlow(tasks, done) {
  var len = tasks.length;
  var rk = [len, [], done, 0];
  var eachfn = asyncFlow.eachfn;
  
  while(len) { len -= 1; eachfn(tasks[len], len, rk) };
}

asyncFlow.eachfn = function(tsk, idx, rk) {
  function store(err, data) {
    if( !err ) {
      rk[1][idx] = data;
      rk[0] -= 1;
    } else {
      rk[0] = 0;
    }
    if( !rk[0] ) {
        if( !rk[3] ) {
            rk[3] = 1;
            rk[2](err, rk[1]);
        }
    }
  }
  tsk(store);
}
if( typeof module == 'object' )
module.exports = asyncFlow;

