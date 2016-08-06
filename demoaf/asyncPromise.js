function asyncFlow(tasks, done) {
  //var results = [];
  var len = tasks.length;
  var rk = [len, done, [], null];
  var eachfn = asyncFlow.eachfn;
  //runcnt = len;
  
  asyncFlow.done = done;
  //console.log('tasks', len);
  //console.log('tasks', tasks);
  for(;len;) { len -= 1; eachfn(tasks[len], len, rk) };
}

asyncFlow.eachfn = function(tsk, idx, rk) {
  tsk.then(function(data) {
      //rk[2][idx] = data;
      rk[0] -= 1;
    if( !rk[0] ) {
        //console.log('call done', rk[0]);
        rk[1](null, rk[2]);
    }
  },
  function(err) {
      if( !rk[3] ) {
          rk[3] = true;
          rk[1](err);
      }
  });
}
if( typeof module == 'object' )
module.exports = asyncFlow;

