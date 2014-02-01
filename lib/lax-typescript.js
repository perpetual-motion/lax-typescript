
var vm = require('vm')
var fs = require('fs')


 var MyLogger = (function () {
    function MyLogger () {
     
    }
    MyLogger.prototype.information = function (x) {
        console.log(x);
        return false;
    };
    MyLogger.prototype.debug = function (x) {
        console.log(x);
        return false;
    };
    MyLogger.prototype.warning = function (x) {
        console.log(x );
        return false;
    };
    MyLogger.prototype.error = function (x) {
        console.log(x );
        return false;
    };
    MyLogger.prototype.fatal = function (x) {
        console.log(x );
        return false;
    };
    MyLogger.prototype.log = function (s) {
        console.log(s);
    };
    return MyLogger;
})();

function merge (a, b) {
    if (!a || !b) { 
        return a;
    }
	var keys = Object.keys(b);
    for (var k, i = 0, n = keys.length; i < n; i++) {
  	    k = keys[i];
  	    a[k] = b[k];
    }
    return a;
}


var source = String(fs.readFileSync(require.resolve("typescript").replace(/typescript\.js$/, "tsc.js"), 'utf8'));

source = source.replace("var batch = new TypeScript.BatchCompiler(TypeScript.IO);", "//var batch = new TypeScript.BatchCompiler(TypeScript.IO);" );
source = source.replace("batch.batchCompile();", "//batch.batchCompile();" );
source+= "module.exports = TypeScript";

var sandbox = {}
var exports = {}
merge(sandbox, global)
sandbox.exports = exports
sandbox.module = { exports: exports }
sandbox.require =require;

var TypeScript = vm.createScript( source).runInNewContext(sandbox)

require.extensions['.ts'] = require.extensions['.ts'] || function(module) {

    sandbox.module = module;
    sandbox.require = require;
   
    var filename = require.resolve( module.filename );
    var input = String(fs.readFileSync(filename), 'utf8');

    var compiler = new TypeScript.TypeScriptCompiler(new MyLogger() );
    var snapshot = TypeScript.ScriptSnapshot.fromString(input);
    compiler.addFile(filename, snapshot);

    var iter = compiler.compile();

    var output = '';
    while(iter.moveNext()) {
        var current = iter.current().outputFiles[0];
        output += !!current ? current.text : '';
    }

    var diags = compiler.getSyntacticDiagnostics(filename);
    if( diags.length) {
        // bad errors!
        for( each in diags ) {
            console.error( diags[each].fileName() +"("+ (1+diags[each].line())+ ","+ diags[each].character() +"): "+ diags[each].message() );    
        }
        
        throw new Error('Unable to compile TypeScript file.');
    }

    diags = compiler.getSemanticDiagnostics(filename);
    if (diags.length && output == '' ) {
        for( each in diags ) {
                console.warn(diags[each].fileName() +"("+ (1+diags[each].line())+ ","+ diags[each].character() +"): "+ diags[each].message() +"[Non-fatal]" );    
        }
        // console.log( require('util').inspect(  diagnostics[0].message() , { showHidden  : true, depth:5}) );
        // console.log( diagnostics[0].fileName() +"("+ diagnostics[0].line()+ ","+ diagnostics[0].character() +"): "+ diagnostics[0].message()  );
    }
    
    return vm.createScript(output,filename).runInNewContext(sandbox);
};

module.exports = { 
    run : function( sourcefile )  {
        require( sourcefile );   
    }
};
    