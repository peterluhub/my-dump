var jsdom = require("jsdom");
var Reporter = require('jasmine-terminal-reporter');

var reporter = new Reporter({isVerbose: true,
        includeStackTrace: true
    });

var config = require("./jsdom_init_config");
var virtualConsole = jsdom.createVirtualConsole();
var require = require;

virtualConsole.on("jsdomError", function (error) {
      console.error('jdErr-> ', error.stack, error.detail);
});
virtualConsole.on("dir", function (message) {
      console.log("dir ->", message, arguments);
});
virtualConsole.on("error", function (message) {
      console.log("err ->", message, arguments);
});
virtualConsole.on("log", function (message) {
      console.log("->", message , arguments[1]);
});

jsdom.env({
    url: config.homePage,
    virtualConsole: virtualConsole,
    scripts: config.jsinclude,
    features: {
        FetchExternalResources: ["script"],
        ProcessExternalResources: ["script"],
        SkipExternalResources: false
    },
    done: function (err, window) {
      var angular = window.angular;
      var describe = window.describe;
      var beforeEach = window.beforeEach;
      var afterEach = window.afterEach;
      var it = window.it;
      var expect = window.expect;

      var document = window.document;

      var speccnt = 0;

      function xhrreq(xmlhttp, spec, speclen) {
        if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
            speccnt += 1;
            console.log('spec loaded', spec);
            var txt = xmlhttp.responseText + '//@ sourceURL='+ spec;
            eval(txt);
            if( speccnt == speclen ) {
              window.onload(reporter);
            }
        } else if( xmlhttp.status!=200 && xmlhttp.readyState == 4) {
            speccnt += 1;
            describe('Fail to load spec: '+spec, function(){
                it("status", function() {
                    expect(xmlhttp.statusText).toBe('OK');
                });
            });
            if( speccnt == speclen ) {
              window.onload(reporter);
            }
        }
      };

      function xhrtimeout(spec, speclen) { 
          speccnt += 1;
          describe('Timeout: '+spec, function(){
              it("Loading spec - "+spec, function() {
                  expect(spec).toBe('loaded');
              });
          });
          if( speccnt == speclen )
              window.onload(reporter);
      }

      function handlespec(url, spec, speclen) {
          xhr = new window.XMLHttpRequest();
          xhr.open("GET", url+spec, true);
          xhr.onreadystatechange = xhrreq.bind(null, xhr, spec, speclen);
          xhr.timeout = 5000;
          xhr.ontimeout = xhrtimeout.bind(null, spec, speclen);
          xhr.send();
      }

      config.specinclude.forEach(function(ele) {
          var speclist = ele.speclist;
          var speclen = speclist.length;
          var url = ele.url;
          speclist.forEach(function(spec) {
              handlespec(url, spec, speclen);
          });
      });
}
});
