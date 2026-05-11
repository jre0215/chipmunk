import { TextLineStream } from "@std/streams/text-line-stream";

import interpret from "./interpret.ts";
import replEnv from "./replEnv.ts";
import { ChipmunkNodeType, ChipmunkString, ChipmunkType } from "./types.ts";
import toString from "./utils/toString.ts";

function main(): void {
  if (Deno.args.length === 0) {
    runChipmunkRepl();
  } else {
    runChipmunkProgram(Deno.args);
  }
}

async function runChipmunkRepl(): Promise<void> {
  Deno.stdout.writeSync(
    new TextEncoder().encode('Enter "exit" or press ^C to exit\n'),
  );
  Deno.stdout.writeSync(
    new TextEncoder().encode(
      'Tip: The underscore symbol ("_") always contains the value of the last expression\n',
    ),
  );
  const stdinReadable = Deno.stdin.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
  while (true) {
    Deno.stdout.writeSync(new TextEncoder().encode("> "));
    for await (const line of stdinReadable) {
      const trimmedLine = line.trim();
      if (trimmedLine.length > 0) {
        if (trimmedLine === "exit") {
          Deno.exit(0);
        }
        let result: ChipmunkType;
        try {
          result = interpret(line, replEnv);
        } catch (e) {
          Deno.stdout.writeSync(new TextEncoder().encode(e.message + "\n"));
          continue;
        }
        replEnv.set("_", result);
        if (result.type !== ChipmunkNodeType.Nil) {
          Deno.stdout.writeSync(
            new TextEncoder().encode(toString(result) + "\n"),
          );
        }
      }
      Deno.stdout.writeSync(new TextEncoder().encode("> "));
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
  Deno.exit(0);
}

if (import.meta.main) {
  main();
}
