import type { JavaScriptNode } from "../src/jstypes.ts";
import type { ChipmunkType } from "../src/types.ts";
import {
  compileJavaScriptToSourceNode,
  convertChipmunkNodeToJavaScriptNode,
} from "../src/codegen.ts";
import Parser from "../src/Parser.ts";
import Tokenizer from "../src/Tokenizer.ts";

import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

interface IPositiveTestCase {
  input: string;
  expectedOutput:
    | number
    | string
    | null
    | boolean
    | (number | string | null | boolean)[];
}

const positiveTestCases: IPositiveTestCase[] = [
  { input: "1", expectedOutput: 1 },
  { input: "-1", expectedOutput: -1 },
  { input: "0.1", expectedOutput: 0.1 },
  { input: "-0.1", expectedOutput: -0.1 },
  { input: `"string"`, expectedOutput: "string" },
  { input: `nil`, expectedOutput: null },
  { input: `true`, expectedOutput: true },
  { input: `false`, expectedOutput: false },
  { input: `[]`, expectedOutput: [] },
  { input: `[1 2 3]`, expectedOutput: [1, 2, 3] },
  { input: `[1 (+ 1 1) (+ 1 2)]`, expectedOutput: [1, 2, 3] },
  {
    input: `(1 "string" null true false)`,
    expectedOutput: [1, "string", null, true, false],
  },
  { input: `(+ 1 2)`, expectedOutput: 3 },
  { input: `(- 3 2)`, expectedOutput: 1 },
  { input: `(* 2 3)`, expectedOutput: 6 },
  { input: `(/ 6 3)`, expectedOutput: 2 },
  { input: `(% 7 3)`, expectedOutput: 1 },
  { input: `(+ 1 (+ 1 1))`, expectedOutput: 3 },
  { input: `(= 1 0)`, expectedOutput: false },
  { input: `(= 1 1)`, expectedOutput: true },
  { input: `(!= 1 0)`, expectedOutput: true },
  { input: `(!= 1 1)`, expectedOutput: false },
  { input: `(> 1 0)`, expectedOutput: true },
  { input: `(> 0 1)`, expectedOutput: false },
  { input: `(< 1 0)`, expectedOutput: false },
  { input: `(< 0 1)`, expectedOutput: true },
  { input: `(>= 0 1)`, expectedOutput: false },
  { input: `(>= 1 1)`, expectedOutput: true },
  { input: `(>= 2 1)`, expectedOutput: true },
  { input: `(<= 0 1)`, expectedOutput: true },
  { input: `(<= 1 1)`, expectedOutput: true },
  { input: `(<= 2 1)`, expectedOutput: false },
  { input: `(do (def pi 3.14) pi)`, expectedOutput: 3.14 },
  { input: `(do (do (def pi 3.14) pi))`, expectedOutput: 3.14 },
  {
    input: `(do (def square (lambda (x) (* x x))) (square 3))`,
    expectedOutput: 9,
  },
  { input: `(if 1 "true" "false")`, expectedOutput: "true" },
  { input: `(if 1 "true" "false")`, expectedOutput: "true" },
  { input: `(if 0 "true" "false")`, expectedOutput: "false" },
  {
    input:
      `(do (def factorial (lambda (x) (if (= x 0) 1 (* x (factorial (- x 1)))))) (factorial 10))`,
    expectedOutput: 3628800,
  },
  { input: `(abs -1)`, expectedOutput: 1 },
  { input: `(nth [1 2 3] 1)`, expectedOutput: 2 },
  { input: `(head [1 2 3])`, expectedOutput: 1 },
  { input: `(parse-integer "1")`, expectedOutput: 1 },
  { input: `(concat "a" "b" "c")`, expectedOutput: "abc" },
  { input: `(map (lambda (x) (* x x)) [1 2 3])`, expectedOutput: [1, 4, 9] },
  { input: `(reduce (lambda (x y) (+ x y)) 0 [1 2 3])`, expectedOutput: 6 },
  { input: `(range 3)`, expectedOutput: [0, 1, 2] },
  { input: `(sum [1 2 3])`, expectedOutput: 6 },
  { input: `(and true true)`, expectedOutput: true },
  { input: `(and true false)`, expectedOutput: false },
  { input: `(and false true)`, expectedOutput: false },
  { input: `(and false false)`, expectedOutput: false },
  { input: `(or true true)`, expectedOutput: true },
  { input: `(or true false)`, expectedOutput: true },
  { input: `(or false true)`, expectedOutput: true },
  { input: `(or false false)`, expectedOutput: false },
];

positiveTestCases.forEach((testCase: IPositiveTestCase) => {
  Deno.test({
    name: `${testCase.input} => ${testCase.expectedOutput}`,
    fn: () => {
      const tokenizer: Tokenizer = new Tokenizer(testCase.input);
      const parser: Parser = new Parser(tokenizer.tokenize());
      const chipmunkAst: ChipmunkType = parser.parse();
      const javaScriptAst: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
        chipmunkAst,
        true,
      );
      const javaScriptCode: string = compileJavaScriptToSourceNode(
        javaScriptAst,
      ).toString();
      const actualOutput: string = eval(javaScriptCode);
      assertEquals(actualOutput, testCase.expectedOutput);
    },
  });
});
