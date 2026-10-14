import interpret from "../src/interpret.ts";
import replEnv from "../src/replEnv.ts";
import toString from "../src/utils/toString.ts";
import { assertEquals, assertThrows } from "@std/assert";

interface IPositiveTestCase {
  input: string;
  expectedOutput: string;
}

interface INegativeTestCase {
  input: string;
  reason: string;
}

const positiveTestCases: IPositiveTestCase[] = [
  { input: "1", expectedOutput: "1" },
  { input: "-1", expectedOutput: "-1" },
  { input: "0.1", expectedOutput: "0.1" },
  { input: "-0.1", expectedOutput: "-0.1" },
  { input: "(+ 1 2)", expectedOutput: "3" },
  { input: "(- 3 2)", expectedOutput: "1" },
  { input: "(* 3 4)", expectedOutput: "12" },
  { input: "(/ 6 3)", expectedOutput: "2" },
  { input: "(% 9 6)", expectedOutput: "3" },
  { input: "(pow 2 3)", expectedOutput: "8" },
  { input: "(+ (+ 1 2) 3)", expectedOutput: "6" },
  { input: "'1", expectedOutput: "1" },
  { input: "'-1", expectedOutput: "-1" },
  { input: "'0.1", expectedOutput: "0.1" },
  { input: "'-0.1", expectedOutput: "-0.1" },
  { input: "'foo", expectedOutput: "foo" },
  { input: "'foo-bar", expectedOutput: "foo-bar" },
  { input: "'fooBar", expectedOutput: "fooBar" },
  { input: "'(+ 1 2)", expectedOutput: "(+ 1 2)" },
  { input: "'(+ (+ 1 2) 3)", expectedOutput: "(+ (+ 1 2) 3)" },
  { input: "[]", expectedOutput: "[]" },
  { input: "[1 2 3]", expectedOutput: "[1 2 3]" },
  { input: "[(+ (+ 1 2) 3)]", expectedOutput: "[6]" },
  { input: "(quote foo)", expectedOutput: "foo" },
  { input: "(quote (+ 1 2))", expectedOutput: "(+ 1 2)" },
  { input: "(do (+ 1 2) (+ 2 3))", expectedOutput: "5" },
  { input: "((do +) 1 2)", expectedOutput: "3" },
  { input: "(def pi 3.14)", expectedOutput: "3.14" },
  { input: "(do (def pi 3.14) pi)", expectedOutput: "3.14" },
  { input: "(do (def pi 3.14) (do pi))", expectedOutput: "3.14" },
  { input: "(do (def pi 3.14) (def pi 3.142) pi)", expectedOutput: "3.142" },
  { input: "((lambda (x y) (+ x y)) 1 2)", expectedOutput: "3" },
  {
    input:
      "(do (def factorial (lambda (x) (if (= x 0) 1 (* x (factorial (- x 1)))))) (factorial 4))",
    expectedOutput: "24",
  },
  { input: "(do (def x 1) ((lambda (y) (+ x y)) 2))", expectedOutput: "3" },
  {
    input: "(do (def x 1) (def y 2) ((lambda () (+ x y))))",
    expectedOutput: "3",
  },
  { input: "(do (def x 1) ((lambda (x y) (+ x y)) 2 2))", expectedOutput: "4" },
  {
    input: "(do (def square (lambda (x) (* x x))) (square 3))",
    expectedOutput: "9",
  },
  { input: "(= 0 1)", expectedOutput: "false" },
  { input: "(= 1 1)", expectedOutput: "true" },
  { input: "(!= 0 1)", expectedOutput: "true" },
  { input: "(!= 1 1)", expectedOutput: "false" },
  { input: "(< 0 1)", expectedOutput: "true" },
  { input: "(< 1 0)", expectedOutput: "false" },
  { input: "(< 1 1)", expectedOutput: "false" },
  { input: "(<= 0 1)", expectedOutput: "true" },
  { input: "(<= 1 0)", expectedOutput: "false" },
  { input: "(<= 1 1)", expectedOutput: "true" },
  { input: "(> 0 1)", expectedOutput: "false" },
  { input: "(> 1 0)", expectedOutput: "true" },
  { input: "(> 1 1)", expectedOutput: "false" },
  { input: "(>= 0 1)", expectedOutput: "false" },
  { input: "(>= 1 0)", expectedOutput: "true" },
  { input: "(>= 1 1)", expectedOutput: "true" },
  { input: "(if (< 0 1) true false)", expectedOutput: "true" },
  { input: "(if (> 0 1) true false)", expectedOutput: "false" },
  { input: "(length [])", expectedOutput: "0" },
  { input: "(length [1 2 3])", expectedOutput: "3" },
  { input: '(length "")', expectedOutput: "0" },
  { input: '(length "hi")', expectedOutput: "2" },
  { input: "(nth [1 2 3] 0)", expectedOutput: "1" },
  { input: "(nth [1 2 3] 1)", expectedOutput: "2" },
  { input: "(nth [1 2 3] 2)", expectedOutput: "3" },
  { input: '(nth "hi" 0)', expectedOutput: '"h"' },
  { input: '(nth "hi" 1)', expectedOutput: '"i"' },
  { input: "(join [1] [2 3])", expectedOutput: "[1 2 3]" },
  { input: `(concat "a" "b" "c")`, expectedOutput: `"abc"` },
  { input: `(parse-integer "3")`, expectedOutput: "3" },
  { input: `(parse-float "3.14")`, expectedOutput: "3.14" },
  { input: `(do (def pi 3.14) (set pi 3.142) pi)`, expectedOutput: "3.142" },
  {
    input: `(do (def pi 3.14) (do (set pi 3.142)) pi)`,
    expectedOutput: "3.142",
  },
  {
    input: '{"name" "John Smith" "age" 42}',
    expectedOutput: '{"name" "John Smith" "age" 42}',
  },
];

const negativeTestCases: INegativeTestCase[] = [
  {
    input: "(1)",
    reason: "the first item of a symbolic expression must be a symbol",
  },
  { input: "(foo)", reason: "the symbol is undefined" },
  { input: "-foo", reason: "a symbol cannot begin with a hyphen" },
  { input: "foo-", reason: "a symbol cannot end with a hyphen" },
  { input: ".1", reason: "a number cannot begin with a decimal point" },
  { input: "1.", reason: "a number cannot end with a decimal point" },
  {
    input: '(def "pi" 3.14)',
    reason: "the first argument to def must be a symbol",
  },
  {
    input: '(do (def pi 3.14) (set "pi" 3.142))',
    reason: "the first argument to set must be a symbol",
  },
  {
    input: "(if 1 true false)",
    reason: "the first argument to if must be a boolean",
  },
  {
    input: '(lambda "x" x)',
    reason: "the first argument to lambda must be a list of symbols",
  },
  {
    input: '(lambda ("x") x)',
    reason: "the first argument to lambda must be a list of symbols",
  },
  { input: '{name "John Smith"}', reason: "dictionary keys must be strings" },
  { input: '{"name"}', reason: "dictionaries cannot have missing keys" },
];

positiveTestCases.forEach((testCase: IPositiveTestCase) => {
  Deno.test({
    name: `${testCase.input} => ${testCase.expectedOutput}`,
    fn: () => {
      const actualOutput: string = toString(
        interpret(testCase.input, replEnv),
      );
      assertEquals(actualOutput, testCase.expectedOutput);
    },
  });
});

negativeTestCases.forEach((testCase: INegativeTestCase) => {
  Deno.test({
    name: `${testCase.input} cannot be evaluated because ${testCase.reason}`,
    fn: () => {
      assertThrows(() => interpret(testCase.input, replEnv));
    },
  });
});
