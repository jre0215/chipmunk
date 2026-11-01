# Chipmunk

Chipmunk is a Lisp interpreter with partial support for compiling to JavaScript.
It's implemented in [TypeScript](https://www.typescriptlang.org/) and runs on
[Node.js](https://nodejs.org/). The goal is to someday achieve self-hosting.

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

First, install dependencies:

```sh
npm install
```

To start a Chipmunk REPL:

```sh
npm run chipmunk
```

To run a Chipmunk program (any extra arguments are available to the program as
`argv`):

```sh
npm run chipmunk -- examples/game-of-life.ch
npm run chipmunk -- examples/factorial.ch 10
```

To compile a Chipmunk program to JavaScript:

```sh
# Compile to JavaScript
npm run compile -- examples/game-of-life.ch

# Run the compiled JavaScript
node examples/game-of-life.js
```

To run tests:

```sh
npm test
```

## Resources

- [Visual Studio Code extension](https://github.com/escamilla/chipmunk-lang)
  (provides syntax highlighting)
- [Documentation of core functions](docs/functions.md)
- [Source map visualization tool](https://sokra.github.io/source-map-visualization/)
  (made by someone else)
