var fs = require('fs'),
    esprima = require('./esprima'),
    filename = process.argv[2],
    content;
 
function customTracer(functionInfo) {
    var trace = 'TRACE.enterFunction(';
    trace += ''' + functionInfo.name + '', ';
    trace += ''' + filename + '', ';
    trace += functionInfo.loc.start.line + ', ';
    trace += 'arguments);n';
    return trace;
}
content = fs.readFileSync(filename, 'utf-8');
content = esprima.modify(content, esprima.Tracer.FunctionEntrance(customTracer));
fs.writeFileSync(filename.replace(/.js$/, '.traced.js'), content);
