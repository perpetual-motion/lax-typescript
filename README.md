# Lax TypeScript

Runs lax-typescript scripts (.ts) 

Typescript: Scalable JavaScript development with types, classes and modules.

## Install

  `npm install -g git://github.com/perpetual-motion/lax-typescript.git`

## Usage

### command line usage
   `ltsc file [args...]`

#### Example
   `ltsc hello.ts`
   
   Compiles and runs the hello.ts script immediately.

### alternate usage
``` javascript 
require("lax-typescript");
require("foo.ts"); // will automatically compile and load foo.ts 
```    

## Notes
   lax-typescript uses the syntax from typescript with two changes:,
      
      - doesn't bother to validate typings
      - provides transparent usage of require for .ts files