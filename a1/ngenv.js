var jsdom = require("jsdom");
var fs = require("fs");
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

var htmlstr = fs.readFileSync('index.html', 'utf-8');
var htmlstr = "http://localhost:8080/index.html";

jsdom.env({
    //html: htmlstr,
    url: htmlstr,
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
      var xmlhttp = new window.XMLHttpRequest();
      function xhrreq(xmlhttp, done) {
          return function () {
            if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
                var txt = xmlhttp.responseText;
                eval(txt);
                if( done )
                  window.onload(reporter);
            } else if( xmlhttp.status>=400) {
                    console.log('status', xmlhttp.status);
            }
          }
      };

      var xhrlst = [];
      var speclen = config.specinclude.length;
      var subspeclen = speclen - 1;
      for(var i=0; i<speclen; i++) {
          var spec = config.specinclude[i];
          xhrlst.push(new window.XMLHttpRequest());
          var xhr = xhrlst[xhrlst.length-1];
          xhr.onreadystatechange = xhrreq(xhr, subspeclen==i?true:false);
          console.log('spec', spec);
          xhr.open("GET","http://localhost:8080/"+spec,true);
          xhr.send();
      }

      var dumpBody = function (doc) {
          console.log('contents of the document:');
          //console.log(document.innerHTML);
          console.log(doc);
      };

      var document = window.document;
        /*
        */
      var mod = 'drv';
      angular.element(window.document).ready(function() {
        if( angular.bootstrap )
          return;
        else
          angular.bootstrap(window.document, [mod]);
      });

      var qs = function(selector) {
        return window.document.querySelector(selector);
      }
      var trigger = function(el, ev) {
        var e = window.document.createEvent('MouseEvent');
        e.initEvent(ev, true, true);
        el.dispatchEvent(e);
      }
      var body = qs("multi-select-box");
      var body = qs("body");
      var bsc = angular.element(body).scope();
      var optclick = 0;
      var rbclick = 0;
      var rbevt = 0;
      //body.addEventListener('DOMNodeInserted', function(evt) {
      body.addEventListener('DOMNodeInserted', function(evt) {
          var opt = document.querySelector('select').querySelector('option[label="a"]');
          var rb = document.querySelector('button[name="to right"]');
          var lb = document.querySelector('button[name="to left"]');
          var selall = document.querySelectorAll("select");
          if( selall.length >1 ) {
              if(selall[1].querySelector('option[label="c"]')) {
                  dumpBody(selall[1].innerHTML);
              }
          }
          if( optclick == 0 && opt ) {
              var dsc =angular.element(selall[0]).scope();
              optclick = 1;
              setTimeout(function() {
                  console.log('optclick', optclick);
                  dsc.toRightSelected =['a'];
                  opt.click();
                  dsc.$apply();
              setTimeout(function() {
                  dumpBody(selall[0].querySelector('option:checked').innerHTML);
                  rb.click()
                  dsc.$apply();
              dumpBody(selall[0].innerHTML);
              //var lo = selall[1].querySelector('option[label="a"]');
              dumpBody(selall[1].querySelector('option[label="a"]').innerHTML);
              setTimeout(function() {
                  console.log('selectedItems', dsc.selectedItems);
                  console.log('outdata', bsc.outdata);
                  dsc.toLeftSelected =['a'];
                  optclick = 2;
                  console.log('optclick', optclick);
                  selall[1].querySelector('option[label="a"]').click();
                  dumpBody(selall[0].innerHTML);
                  lb.click()
                  dsc.$apply();
                      dumpBody(selall[1].innerHTML);
                      dumpBody(selall[0].querySelector('option[label="a"]').innerHTML);
              }, 0);
              }, 0);
              }, 10);
          }
      }, true);
}
});
