import test from 'node:test';
import assert from 'node:assert';

import type { Token } from "./tokens.js";
import Parser from "./Parser.js";
import Tokenizer from "./Tokenizer.js";

interface INegativeTestCase {
  input: string;
  reason: string;
}

const negativeTests: INegativeTestCase[] = [
  {
    input: "(",
    reason: "an opening parenthesis must have a matching closing parenthesis",
  },
  {
    input: ")",
    reason: "a closing parenthesis must have a matching opening parenthesis",
  },
  {
    input: "[",
    reason:
      "an opening square bracket must have a matching closing square bracket",
  },
  {
    input: "]",
    reason:
      "a closing square bracket must have a matching opening square bracket",
  },
  { input: "foo bar", reason: "there can only be one topmost expression" },
  {
    input: "(add 1 2) foo",
    reason: "there can only be one topmost expression",
  },
  {
    input: "foo (add 1 2)",
    reason: "there can only be one topmost expression",
  },
];

negativeTests.forEach((testCase: INegativeTestCase) => {
  const name = `input cannot be parsed because ${testCase.reason}: ${testCase.input}`;
  test(name, () => {
    const tokenizer: Tokenizer = new Tokenizer(testCase.input);
    const tokens: Token[] = tokenizer.tokenize();
    const parser: Parser = new Parser(tokens);
    assert.throws(() => parser.parse());
  })
});
