import { assertEquals, assertThrows } from "@std/assert";

import Environment from "../src/Environment.ts";
import { ChipmunkNodeType } from "../src/types.ts";

Deno.test({
  name: "Environment.get() returns a value defined in the current environment",
  fn: () => {
    const env: Environment = new Environment();
    env.set("pi", { type: ChipmunkNodeType.Number, value: 3.14 });
    assertEquals(env.get("pi"), { type: ChipmunkNodeType.Number, value: 3.14 });
  },
});

Deno.test({
  name:
    "Environment.get() returns a value defined in the immediate outer environment",
  fn: () => {
    const outerEnv: Environment = new Environment();
    const innerEnv: Environment = new Environment(outerEnv);
    outerEnv.set("pi", { type: ChipmunkNodeType.Number, value: 3.14 });
    assertEquals(
      innerEnv.get("pi"),
      { type: ChipmunkNodeType.Number, value: 3.14 },
    );
  },
});

Deno.test({
  name:
    "Environment.get() returns a value defined in the non-immediate outer environment",
  fn: () => {
    const outerEnv: Environment = new Environment();
    const innerEnv: Environment = new Environment(outerEnv);
    outerEnv.set("pi", { type: ChipmunkNodeType.Number, value: 3.14 });
    assertEquals(
      innerEnv.get("pi"),
      { type: ChipmunkNodeType.Number, value: 3.14 },
    );
  },
});

Deno.test({
  name:
    "Environment.get() returns a value defined in the non-immediate outer environment",
  fn: () => {
    const outermostEnv: Environment = new Environment();
    const outerEnv: Environment = new Environment(outermostEnv);
    const innerEnv: Environment = new Environment(outerEnv);
    outermostEnv.set("pi", { type: ChipmunkNodeType.Number, value: 3.14 });
    assertEquals(
      innerEnv.get("pi"),
      { type: ChipmunkNodeType.Number, value: 3.14 },
    );
  },
});

Deno.test({
  name:
    "Environment.get() cannot return a value defined in the inner environment from the outer environment",
  fn: () => {
    const outerEnv: Environment = new Environment();
    const innerEnv: Environment = new Environment(outerEnv);
    innerEnv.set("pi", { type: ChipmunkNodeType.Number, value: 3.14 });
    assertThrows(() => outerEnv.get("pi"));
  },
});

Deno.test({
  name:
    "Environment.get() returns a value defined in the inner environment that shadows one defined in the outer environment",
  fn: () => {
    const outerEnv: Environment = new Environment();
    const innerEnv: Environment = new Environment(outerEnv);
    outerEnv.set("pi", { type: ChipmunkNodeType.Number, value: 3.142 });
    innerEnv.set("pi", { type: ChipmunkNodeType.Number, value: 3.14 });
    assertEquals(
      innerEnv.get("pi"),
      { type: ChipmunkNodeType.Number, value: 3.14 },
    );
  },
});
