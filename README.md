# Chipmunk

Chipmunk is a Lisp interpreter with partial support for compiling to JavaScript.
It's implemented in [TypeScript](https://www.typescriptlang.org/) and runs on
[Node.js](https://nodejs.org/). The goal is to someday achieve self-hosting.

## Example Program

Print the factorials of the numbers 1 to 10:

```clojure
(do
  (def factorial (lambda (x)
    (if (= x 0)
      1
      (* x (factorial (- x 1))))))
  (print-line (map factorial (range 10))))

; prints "[1 1 2 6 24 120 720 5040 40320 362880]"
```

See the [documentation](docs/functions.md) for a list of functions

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
npm run chipmunk -- examples/game-of-life.chip
npm run chipmunk -- examples/factorial.chip 10
```

To compile a Chipmunk program to JavaScript and run it:

```sh
npm run compile -- examples/game-of-life.chip
node examples/game-of-life.js
```

To run tests:

```sh
npm test
```
