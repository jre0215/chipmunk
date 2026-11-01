import test from 'node:test';
import assert from 'node:assert';

import Environment from "./Environment.js";
import { ChipmunkNodeType } from "./types.js";

test("Environment.get() returns a value defined in the current environment",
  () => {
    const env: Environment = new Environment();
    env.set("pi", { type: ChipmunkNodeType.Number, value: 3.14 });
    assert.deepStrictEqual(env.get("pi"), { type: ChipmunkNodeType.Number, value: 3.14 });
  },
);

test("Environment.get() returns a value defined in the immediate outer environment",
  () => {
    const outerEnv: Environment = new Environment();
    const innerEnv: Environment = new Environment(outerEnv);
    outerEnv.set("pi", { type: ChipmunkNodeType.Number, value: 3.14 });
    assert.deepStrictEqual(
      innerEnv.get("pi"),
      { type: ChipmunkNodeType.Number, value: 3.14 },
    );
  },
);

test("Environment.get() returns a value defined in the non-immediate outer environment",
  () => {
    const outerEnv: Environment = new Environment();
    const innerEnv: Environment = new Environment(outerEnv);
    outerEnv.set("pi", { type: ChipmunkNodeType.Number, value: 3.14 });
    assert.deepStrictEqual(
      innerEnv.get("pi"),
      { type: ChipmunkNodeType.Number, value: 3.14 },
    );
  },
);

test("Environment.get() returns a value defined in the non-immediate outer environment",
  () => {
    const outermostEnv: Environment = new Environment();
    const outerEnv: Environment = new Environment(outermostEnv);
    const innerEnv: Environment = new Environment(outerEnv);
    outermostEnv.set("pi", { type: ChipmunkNodeType.Number, value: 3.14 });
    assert.deepStrictEqual(
      innerEnv.get("pi"),
      { type: ChipmunkNodeType.Number, value: 3.14 },
    );
  },
);

test("Environment.get() cannot return a value defined in the inner environment from the outer environment",
  () => {
    const outerEnv: Environment = new Environment();
    const innerEnv: Environment = new Environment(outerEnv);
    innerEnv.set("pi", { type: ChipmunkNodeType.Number, value: 3.14 });
    assert.throws(() => outerEnv.get("pi"));
  },
);

test("Environment.get() returns a value defined in the inner environment that shadows one defined in the outer environment",
  () => {
    const outerEnv: Environment = new Environment();
    const innerEnv: Environment = new Environment(outerEnv);
    outerEnv.set("pi", { type: ChipmunkNodeType.Number, value: 3.142 });
    innerEnv.set("pi", { type: ChipmunkNodeType.Number, value: 3.14 });
    assert.deepStrictEqual(
      innerEnv.get("pi"),
      { type: ChipmunkNodeType.Number, value: 3.14 },
    );
  },
);
