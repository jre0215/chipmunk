import * as readline from 'node:readline/promises';
import { argv, stdin as input, stdout as output } from 'node:process';

import interpret from "./interpret.js";
import replEnv from "./replEnv.js";
import { ChipmunkNodeType, type ChipmunkString, type ChipmunkType } from "./types.js";
import toString from "./utils/toString.js";
import EvaluationError from "./EvaluationError.js";

function main(): void {
  if (argv.length < 3) {
    runChipmunkRepl();
  } else {
    runChipmunkProgram(argv.slice(2));
  }
}

async function runChipmunkRepl(): Promise<void> {
  console.log('Enter "exit" or press ^C to exit\n');
  console.log('Tip: The underscore symbol ("_") always contains the value of the last expression\n');
  const rl = readline.createInterface({ input, output });
  while (true) {
    let line: string;
    try {
      line = await rl.question('> ');
    } catch (e: unknown) {
      // Ctrl+C and Ctrl+D reject the pending question with an AbortError.
      if (e instanceof Error && e.name === "AbortError") {
        console.log();
        rl.close();
        process.exit();
      }
      throw e;
    }
    const trimmedLine = line.trim();
    if (trimmedLine.length > 0) {
      if (trimmedLine === "exit") {
        rl.close();
        process.exit();
      }
      let result: ChipmunkType;
      try {
        result = interpret(line, replEnv);
      } catch (e: unknown) {
        if (e instanceof EvaluationError) {
          console.log(e.message + '\n');
        } else {
          console.log("An unexpected error occurred", e);
        }
        continue;
      }
      replEnv.set("_", result);
      if (result.type !== ChipmunkNodeType.Nil) {
        console.log(toString(result) + "\n");
      }
    }
  }
}

function runChipmunkProgram(args: string[]): void {
  const [programName, ...programArgs] = args;
  const chipmunkArgv: ChipmunkString[] = [];
  for (const arg of programArgs) {
    chipmunkArgv.push({
      type: ChipmunkNodeType.String,
      value: arg,
    });
  }
  replEnv.set("argv", {
    type: ChipmunkNodeType.Vector,
    items: chipmunkArgv,
  });
  interpret(`(load-file "${programName}")`, replEnv);
  process.exit();
}

main();
