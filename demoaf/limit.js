"use strict";
function asyncFlow(tasks, max, done) {
  if( !max ) {
      throw "limit not specified";
  }
  var rk = [max-1, [], done, 0, tasks.length, 0];
  var eachfn = asyncFlow.eachfn;
  
  for(var i=0; i<max; i+=1) { 
      rk[3] += 1;
      eachfn(tasks, i, rk) 
  };
}

asyncFlow.eachfn = function(tasks, idx, rk) {
  function store(err, data) {
    rk[3] -= 1;
    if( !err ) {
      rk[1][idx] = data;
      rk[0] += 1;
      if( rk[0] < rk[4] ) {
          rk[3] += 1;
          asyncFlow.eachfn(tasks, rk[0], rk);
      } else {
          if( !rk[5] ) {
            rk[5] = 1;
            rk[2](err, rk[1]);
          }
      }
    } else {
      if( !rk[5] ) {
        rk[5] = 1;
        rk[2](err, rk[1]);
      }
    }
//  console.log('store', tasks, idx, rk);
  }
  //console.log('tasks', tasks, idx, rk);
  tasks[idx](store);
}
if( typeof module == 'object' )
module.exports = asyncFlow;

