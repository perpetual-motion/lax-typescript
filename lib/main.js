var fs = require('fs');
var path = require('path');
var io = require("./io");
var ts = require("typescript-compiler");
var TypeScript = ts.TypeScript;
var libdpath = ts._libdPath;

require.extensions['.ts'] = require.extensions['.ts'] || function(module) {
    var js = '';

    var output = {
        Write: function(value) { js += value; },
        WriteLine: function(value) { js += value + "\n"; },
        Close: function() {}
    };

    var nulloutput = {
        Write: function(value) {},
        WriteLine: function(value) {},
        Close: function() {}
    };

    var settings = new TypeScript.CompilationSettings();
    settings.codeGenTarget = TypeScript.CodeGenTarget.ES5;
    settings.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
    settings.resolve = false;

    var env = new TypeScript.CompilationEnvironment(settings, io);
    var resolver = new TypeScript.CodeResolver(env);

    var moduleFilename = TypeScript.switchToForwardSlashes(module.filename);

    var units = [
        { fileName: libdpath }
        //,{ fileName: path.join(__dirname, "./d.ts/node-0.8.d.ts") }
    ];

    resolver.resolveCode(moduleFilename, "", false, {
        postResolution: function(file, code) {
            if (!units.some(function(u) { return u.fileName == code.path }))
                units.push({ fileName: code.path, code: code.content });
        },
        postResolutionError: function(file, message) {
           // throw new Error('TypeScript Error: ' + message + '\n File: ' + file);
        }
    });

    var compiler = new TypeScript.TypeScriptCompiler(null, new TypeScript.NullLogger(), settings);
    compiler.parser.errorRecovery = true;

    compiler.setErrorCallback(function(start, len, message, block) {
        // nope, we're lettin' it all ride. 
        if( message.indexOf("does not exist") > -1 ) { 
            return;
        }
        
        var code = units[block].code;

        var line = [
            code.substr(0, start).split('\n').slice(-1)[0].replace(/^\s+/, ""),
            code.substr(start, len),
            code.substr(start + len).split('\n').slice(0, 1)[0].replace(/\s+$/, "")
        ];

        var underline = [
            line[0].replace(/./g, '-'),
            line[1].replace(/./g, '^'),
            line[2].replace(/./g, '-'),
        ];

        var error = new Error('TypeScript Error: ' + message);
        error.stack = [
            'TypeScript Error: ' + message,
            'File: ' + units[block].fileName,
            'Start: ' + start + ', Length: ' + len,
            '',
            'Line: ' + line.join(""),
            '------' + underline.join("")
        ].join('\n')

       throw error;
       
    });
    
    units.forEach(function(u) {
        if (!u.code)
            u.code = fs.readFileSync(u.fileName, "utf8");

        compiler.addUnit(u.code, u.fileName, false);
    });

    compiler.typeCheck();

    compiler.emit(function(fn) {
        if (fn == moduleFilename.replace(/\.ts$/, ".js"))
            return output;
        else
            return nulloutput;
    });

    // console.log("-="+moduleFilename+"=-");
    // console.log(js);
    // console.log("-========================================================================-");
    
    module._compile(js, moduleFilename);
};

module.exports = { 
    run : function( sourcefile )  {
        require( sourcefile );   
    },
    
    compileToES3 : function( sourcecode, filename, lax ) {
        lax = lax || false;
        
        var match;
        if( match = /^\s*\/\/\/\s*lax\s*=\s*(\S*)\s*;/i.exec(sourcecode) ) {
            lax = (match[1] == 'true');
        }
        
        var js = '';

        var output = {
            Write: function(value) { js += value; },
            WriteLine: function(value) { js += value + "\n"; },
            Close: function() {}
        };

        var nulloutput = {
            Write: function(value) {},
            WriteLine: function(value) {},
            Close: function() {}
        };
        
        var moduleFilename = TypeScript.switchToForwardSlashes(filename);
        
        var settings = new TypeScript.CompilationSettings();
        settings.codeGenTarget = TypeScript.CodeGenTarget.ES3;
        settings.moduleGenTarget = TypeScript.ModuleGenTarget.Synchronous;
        settings.resolve = (lax == false);

        var env = new TypeScript.CompilationEnvironment(settings, io);
        var resolver = new TypeScript.CodeResolver(env);
        
        var units = [
            { fileName: libdpath }
        ];
           
        resolver.resolveCode(moduleFilename, "", false, {
            postResolution: function(file, code) {
                if (!units.some(function(u) { return u.fileName == code.path }))
                    units.push({ fileName: code.path, code: code.content });
            },
            postResolutionError: function(file, message) {
               throw new Error('TypeScript Error: ' + message + '\n File: ' + file);
            }
        });    
        
        var compiler = new TypeScript.TypeScriptCompiler(null, new TypeScript.NullLogger(), settings);
        compiler.parser.errorRecovery = true;

        compiler.setErrorCallback(function(start, len, message, block) {
            if( lax && message.indexOf("does not exist") > -1 ) { 
                return;
            }
        
            var code = units[block].code;

            var line = [
                code.substr(0, start).split('\n').slice(-1)[0].replace(/^\s+/, ""),
                code.substr(start, len),
                code.substr(start + len).split('\n').slice(0, 1)[0].replace(/\s+$/, "")
            ];

            var underline = [
                line[0].replace(/./g, '-'),
                line[1].replace(/./g, '^'),
                line[2].replace(/./g, '-'),
            ];

            var error = new Error('TypeScript Error: ' + message);
            error.stack = [
                'TypeScript Error: ' + message,
                'File: ' + units[block].fileName,
                'Start: ' + start + ', Length: ' + len,
                '',
                'Line: ' + line.join(""),
                '------' + underline.join("")
            ].join('\n')

            throw error;
       
        });

        units.forEach(function(u) {
            if (u.fileName == moduleFilename ) {
                // found the unit that we passed in.
                u.code = sourcecode;
            }
            
            if (!u.code)
                u.code = fs.readFileSync(u.fileName, "utf8");

            compiler.addUnit(u.code, u.fileName, false);
        });

        compiler.typeCheck();

        compiler.emit(function(fn) {
            // if it's outputting the file we gave it
            // we'll take the output then.
            if (fn == moduleFilename.replace(/\.ts$/, ".js"))
                return output;
            else
                return nulloutput;
        });
        
        return js;
    }
}