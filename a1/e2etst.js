describe('E2E test',function() {
var dumpBody = function (doc) {
  console.log('contents of the document:');
  //console.log(document.innerHTML);
  console.log(doc);
};

var qs = function(selector) {
return document.querySelector(selector);
}
var trigger = function(el, ev) {
var e = document.createEvent('MouseEvent');
e.initEvent(ev, true, true);
el.dispatchEvent(e);
}
console.log('1st querySelector');
var body = qs("multi-select-box");
var body = qs("body");
var bsc = angular.element(body).scope();
var optclick = 0;
var rbclick = 0;
var rbevt = 0;

console.log('2st querySelector');
  var opt = document.querySelector('select').querySelector('option[label="a"]');
  var rb = document.querySelector('button[name="to right"]');
  var lb = document.querySelector('button[name="to left"]');
  var selall = document.querySelectorAll("select");
//console.log('3st querySelector');

  it('dummy', function() {
      if( selall.length >1 ) {
          if(selall[1].querySelector('option[label="c"]')) {
              dumpBody(selall[1].innerHTML);
          }
      }
      expect(1).toBe(1)
  });
  var dm = function() { it('MSB', function() {
  if( selall.length >1 ) {
      if(selall[1].querySelector('option[label="c"]')) {
          dumpBody(selall[1].innerHTML);
      }
  }
  if( optclick == 0 && opt ) {
      var dsc =angular.element(selall[0]).scope();
      optclick = 1;
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
          if( bsc.outdata != 'b' ) {
              window.fail('binding of outdata failed');
              return true;
          } else {
          dsc.toLeftSelected =['a'];
          optclick = 2;
          console.log('optclick', optclick);
          selall[1].querySelector('option[label="a"]').click();
          dumpBody(selall[0].innerHTML);
          lb.click()
          dsc.$apply();
              dumpBody(selall[1].innerHTML);
              //expect(selall[0].querySelector('option[label="a"]').innerHTML).toBe('a');
         }
      }, 0);
      }, 0);
  }
body.addEventListener('DOMNodeInserted', function(evt) {
}, true);
});}
});
