#!/usr/local/bin/node

var compressor = require('node-minify');

// Using Google Closure
new compressor.minify({
  type: 'gcc',
  //type: 'uglifyjs',
  fileIn: './asyncFlow.js',
  fileOut: 'asyncFlow.min.js',
  callback: function(err, min){
    console.log(err);
    //console.log(min);
  }
});
