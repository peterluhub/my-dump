//var htmlsrc = fs.readFileSync("./msbtemplate.html", "utf-8");
module.exports = 
{
  homePage: "http://localhost:8080/index.html",
  jsinclude: [
      'node_modules/jasmine/node_modules/jasmine-core/lib/jasmine-core/jasmine.js',
      'node_modules/jasmine/node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js',
      'node_modules/jasmine/node_modules/jasmine-core/lib/jasmine-core/boot.js',
  /*
  'jasmine/lib/jasmine-2.3.4/jasmine.js',
  'jasmine/lib/jasmine-2.3.4/jasmine-html.js',
  'jasmine/lib/jasmine-2.3.4/boot.js',
  'node_modules/angular/angular.js',
  'node_modules/angular-mocks/angular-mocks.js',
  'node_modules/ng-describe/dist/ng-describe.js',
  'template_str.js',
  'app.js',
  'directive.js',
  */
  ],
  specinclude: [
     {url: "http://localhost:8080/",
      speclist: [
      //'httpdirective_jd_spec.js',
      'httpspec.js',
      'httpspec2.js',
      //'khttpspec.js',
      'e2etst.js',
     ]}
  ]
};
