var jsdom = require("jsdom");
var markup, options={scripts: [
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/ng-describe/dist/ng-describe.js',
      'service-spec.js',
      'directive.js'
    ],
    virtualConsole: jsdom.createVirtualConsole().sendTo(console)
    };
var doc = jsdom.jsdom(markup, options);
var window = doc.defaultView;
window.addEventListener("error", function (event) {
      console.error("script error!!", event.error);
});
console.log('win', window);
