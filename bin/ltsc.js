var path = require('path');
var ltsc = require("../lib/lax-typescript.js");

if( process.argv.length > 2 ) {
    // identify the path to the start file.
    var tsfile =path.resolve( process.argv[2] );

    // remove the script runner from the arguments
    process.argv.splice(1,1);

    // run the script file
    ltsc.run( tsfile );    
} else {
    console.log("lax-typescript\r\n-----------------\r\n"+
    "   Runs lax-typescript scripts (.ts)\r\n"+
    "\r\nUsage:\r\n   ltsc file [args...]\r\n\r\n"+
"Example:\r\n   ltsc hello.ts\r\n"+
"   Compiles and runs the hello.ts script immediately.\r\n"+
"\r\nNotes:\r\n   lax-typescript uses the syntax from typescript with two changes: \r\n      - doesn't bother to validate typings"+
"\r\n      - provides transparent usage of require for .ts files"
    );
}
