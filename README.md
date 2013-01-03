# Lax TypeScript

Runs lax-typescript scripts (.ts) 
Typescript: Scalable JavaScript development with types, classes and modules.

## Install

  npm install -g lax-typescript

## Usage

   ltsc file [args...]

## Example
   ltsc hello.ts
   Compiles and runs the hello.ts script immediately.

## Notes
   lax-typescript uses the syntax from typescript with two changes:,
      - doesn't bother to validate typings
      - provides transparent usage of require for .ts files