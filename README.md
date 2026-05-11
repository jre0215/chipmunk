# Chipmunk

Chipmunk is a Lisp interpreter with partial support for compiling to JavaScript.
It's implemented in [TypeScript](https://www.typescriptlang.org/) using the
[Deno](https://deno.com/) runtime. The goal is to someday achieve self-hosting.

## Example Program

Print the factorials of the numbers 1 to 10:

```lisp
(do
  (def factorial (lambda (x)
    (if (= x 0)
      1
      (* x (factorial (- x 1))))))
  (print-line (map factorial (range 10))))

; prints "[1 1 2 6 24 120 720 5040 40320 362880]"
```

## Command Line Interface

To start a Chipmunk REPL:

```sh
deno run src/index.ts
```

To run a Chipmunk program:

```sh
deno run --allow-read src/index.ts examples/game-of-life.ch
```

To compile a Chipmunk program to JavaScript:

```sh
# Compile to JavaScript
deno run --allow-read --allow-write src/compile.ts examples/game-of-life.ch

# Run the compiled JavaScript
deno run examples/game-of-life.js
```

To run tests:

```sh
deno test
```

## Resources

- [Visual Studio Code extension](https://github.com/escamilla/chipmunk-lang)
  (provides syntax highlighting)
- [Documentation of core functions](docs/functions.md)
- [Source map visualization tool](https://sokra.github.io/source-map-visualization/)
  (made by someone else)
