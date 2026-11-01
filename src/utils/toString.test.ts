import test from 'node:test';
import assert from 'node:assert';

import interpret from "../interpret.js";
import replEnv from "../replEnv.js";
import toString from "./toString.js";

interface ITestCase {
  input: string;
  expectedOutput: string;
  printable?: boolean;
}

const testCases: ITestCase[] = [
  { input: "true", expectedOutput: "true" },
  { input: "false", expectedOutput: "false" },
  { input: "+", expectedOutput: "+" },
  { input: "nil", expectedOutput: "nil" },
  { input: "3.14", expectedOutput: "3.14" },
  { input: "'pi", expectedOutput: "pi" },
  // ChipmunkString test cases (printable = false)
  { input: `"test"`, expectedOutput: `"test"`, printable: false },
  { input: `"test\\ntest"`, expectedOutput: `"test\\ntest"`, printable: false },
  { input: `"\\"test\\""`, expectedOutput: `"\\"test\\""`, printable: false },
  {
    input: `"\\\\test\\\\"`,
    expectedOutput: `"\\\\test\\\\"`,
    printable: false,
  },
  // ChipmunkString test cases (printable = true)
  { input: `"test"`, expectedOutput: `test`, printable: true },
  { input: `"test\\ntest"`, expectedOutput: `test\ntest`, printable: true },
  { input: `"\\"test\\""`, expectedOutput: `"test"`, printable: true },
  { input: `"\\\\test\\\\"`, expectedOutput: `\\test\\`, printable: true },
];

testCases.forEach((testCase: ITestCase) => {
  const name = `\`${testCase.input}\` => \`${testCase.expectedOutput}\` (printable = ${testCase.printable})`;
  test(name, () => {
    const actualOutput: string = toString(
      interpret(testCase.input, replEnv),
      testCase.printable,
    );
    assert.strictEqual(actualOutput, testCase.expectedOutput);
  })
});
