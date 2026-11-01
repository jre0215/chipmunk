import { readFileSync } from 'node:fs';

import Environment from "./Environment.js";
import evaluate from "./evaluate.js";
import interpret from "./interpret.js";
import Parser from "./Parser.js";
import Tokenizer from "./Tokenizer.js";
import {
  type ChipmunkBoolean,
  type ChipmunkNil,
  ChipmunkNodeType,
  type ChipmunkNumber,
  type ChipmunkString,
  type ChipmunkType,
  type ChipmunkVector,
} from "./types.js";
import toString from "./utils/toString.js";

const replEnv: Environment = new Environment();

function defineChipmunkFunction(
  name: string,
  callable: (args: ChipmunkType[]) => ChipmunkType,
): void {
  replEnv.set(name, {
    type: ChipmunkNodeType.Function,
    callable,
    isUserDefined: false,
    name,
  });
}

defineChipmunkFunction("+", (args: ChipmunkType[]): ChipmunkNumber => {
  const x: ChipmunkNumber = args[0] as ChipmunkNumber;
  const y: ChipmunkNumber = args[1] as ChipmunkNumber;
  return { type: ChipmunkNodeType.Number, value: x.value + y.value };
});

defineChipmunkFunction("-", (args: ChipmunkType[]): ChipmunkNumber => {
  const x: ChipmunkNumber = args[0] as ChipmunkNumber;
  const y: ChipmunkNumber = args[1] as ChipmunkNumber;
  return { type: ChipmunkNodeType.Number, value: x.value - y.value };
});

defineChipmunkFunction("*", (args: ChipmunkType[]): ChipmunkNumber => {
  const x: ChipmunkNumber = args[0] as ChipmunkNumber;
  const y: ChipmunkNumber = args[1] as ChipmunkNumber;
  return { type: ChipmunkNodeType.Number, value: x.value * y.value };
});

defineChipmunkFunction("/", (args: ChipmunkType[]): ChipmunkNumber => {
  const x: ChipmunkNumber = args[0] as ChipmunkNumber;
  const y: ChipmunkNumber = args[1] as ChipmunkNumber;
  return { type: ChipmunkNodeType.Number, value: x.value / y.value };
});

defineChipmunkFunction("%", (args: ChipmunkType[]): ChipmunkNumber => {
  const x: ChipmunkNumber = args[0] as ChipmunkNumber;
  const y: ChipmunkNumber = args[1] as ChipmunkNumber;
  return { type: ChipmunkNodeType.Number, value: x.value % y.value };
});

defineChipmunkFunction("pow", (args: ChipmunkType[]): ChipmunkNumber => {
  const x: ChipmunkNumber = args[0] as ChipmunkNumber;
  const y: ChipmunkNumber = args[1] as ChipmunkNumber;
  return { type: ChipmunkNodeType.Number, value: Math.pow(x.value, y.value) };
});

defineChipmunkFunction("=", (args: ChipmunkType[]): ChipmunkBoolean => {
  const x: ChipmunkNumber = args[0] as ChipmunkNumber;
  const y: ChipmunkNumber = args[1] as ChipmunkNumber;
  return { type: ChipmunkNodeType.Boolean, value: x.value === y.value };
});

defineChipmunkFunction("<", (args: ChipmunkType[]): ChipmunkBoolean => {
  const x: ChipmunkNumber = args[0] as ChipmunkNumber;
  const y: ChipmunkNumber = args[1] as ChipmunkNumber;
  return { type: ChipmunkNodeType.Boolean, value: x.value < y.value };
});

defineChipmunkFunction(">", (args: ChipmunkType[]): ChipmunkType => {
  const x: ChipmunkNumber = args[0] as ChipmunkNumber;
  const y: ChipmunkNumber = args[1] as ChipmunkNumber;
  return { type: ChipmunkNodeType.Boolean, value: x.value > y.value };
});

defineChipmunkFunction("length", (args: ChipmunkType[]): ChipmunkNumber => {
  if (args[0] === undefined) {
    throw new Error("length() takes a list, vector, or string");
  }
  const arg: ChipmunkType = args[0];
  if (arg.type === ChipmunkNodeType.List) {
    return { type: ChipmunkNodeType.Number, value: arg.items.length };
  } else if (arg.type === ChipmunkNodeType.String) {
    return { type: ChipmunkNodeType.Number, value: arg.value.length };
  } else if (arg.type === ChipmunkNodeType.Vector) {
    return { type: ChipmunkNodeType.Number, value: arg.items.length };
  } else {
    throw new Error("length() takes a list, vector, or string");
  }
});

defineChipmunkFunction("nth", (args: ChipmunkType[]): ChipmunkType => {
  if (args[0] === undefined || args[1] === undefined) {
    throw new Error("nth() takes a list, string, or vector and a number");
  }
  if (
    (args[0].type === ChipmunkNodeType.List ||
      args[0].type === ChipmunkNodeType.Vector) &&
    args[1].type === ChipmunkNodeType.Number
  ) {
    const el = args[0].items[args[1].value];
    if (el === undefined) {
      throw new Error("not enough items in list");
    }
    return el;
  } else if (
    args[0].type === ChipmunkNodeType.String &&
    args[1].type === ChipmunkNodeType.Number
  ) {
    return {
      type: ChipmunkNodeType.String,
      value: args[0].value.charAt(args[1].value),
    };
  } else {
    throw new Error("nth() takes a list, string, or vector and a number");
  }
});

defineChipmunkFunction("slice", (args: ChipmunkType[]): ChipmunkVector => {
  if (args[0] === undefined || args[1] === undefined || args[2] === undefined) {
    throw new Error("slice() takes a vector and two numbers");
  }
  if (
    args[0].type === ChipmunkNodeType.Vector &&
    args[1].type === ChipmunkNodeType.Number &&
    args[2].type === ChipmunkNodeType.Number
  ) {
    return {
      type: ChipmunkNodeType.Vector,
      items: args[0].items.slice(args[1].value, args[2].value),
    };
  } else {
    throw new Error("slice() takes a vector and two numbers");
  }
});

defineChipmunkFunction("join", (args: ChipmunkType[]): ChipmunkVector => {
  if (args[0] === undefined || args[1] === undefined) {
    throw new Error("join() takes two vectors");
  }
  if (
    args[0].type === ChipmunkNodeType.Vector &&
    args[1].type === ChipmunkNodeType.Vector
  ) {
    return {
      type: ChipmunkNodeType.Vector,
      items: args[0].items.concat(args[1].items),
    };
  } else {
    throw new Error("join() takes two vectors");
  }
});

defineChipmunkFunction("concat", (args: ChipmunkType[]): ChipmunkString => {
  const castedArgs: ChipmunkString[] = args.map((arg: ChipmunkType) =>
    arg as ChipmunkString
  );
  const strings: string[] = castedArgs.map((arg: ChipmunkString) => arg.value);
  return { type: ChipmunkNodeType.String, value: strings.join("") };
});

defineChipmunkFunction("to-string", (args: ChipmunkType[]): ChipmunkString => {
  if (args[0] === undefined) {
    throw new Error('to-string() takes one argument');
  }
  return { type: ChipmunkNodeType.String, value: toString(args[0]) };
});

defineChipmunkFunction(
  "parse-integer",
  (args: ChipmunkType[]): ChipmunkType => {
    const arg: ChipmunkString = args[0] as ChipmunkString;
    return { type: ChipmunkNodeType.Number, value: parseInt(arg.value, 10) };
  },
);

defineChipmunkFunction("parse-float", (args: ChipmunkType[]): ChipmunkType => {
  const arg: ChipmunkString = args[0] as ChipmunkString;
  return { type: ChipmunkNodeType.Number, value: parseFloat(arg.value) };
});

defineChipmunkFunction(
  "print",
  (args: ChipmunkType[]): ChipmunkNil => {
    if (args[0] === undefined) {
      throw new Error('print() takes one argument');
    }
    const message: string = toString(args[0], true);
    console.log(message);
    return { type: ChipmunkNodeType.Nil };
  },
);

defineChipmunkFunction(
  "print-line",
  (args: ChipmunkType[]): ChipmunkNil => {
    if (args.length < 1) {
      console.log('\n');
    } else {
      const message: string = toString(args[0]!, true);
      console.log(message + '\n');
    }
    return { type: ChipmunkNodeType.Nil };
  },
);

defineChipmunkFunction(
  "read-line",
  (): ChipmunkString => {
    throw new Error("not implemented");
  },
);

defineChipmunkFunction(
  "read-file",
  (args: ChipmunkType[]): ChipmunkString => {
    const path: string = (args[0] as ChipmunkString).value;
    const contents = readFileSync(path, 'utf8');
    return { type: ChipmunkNodeType.String, value: contents };
  },
);

defineChipmunkFunction("do", (args: ChipmunkType[]): ChipmunkType => {
  if (args.length < 1) {
    throw new Error('do() takes at least one argument');
  }
  return args[args.length - 1]!;
});

defineChipmunkFunction("parse-string", (args: ChipmunkType[]): ChipmunkType => {
  const input: ChipmunkString = args[0] as ChipmunkString;
  const tokenizer: Tokenizer = new Tokenizer(input.value);
  const parser: Parser = new Parser(tokenizer.tokenize());
  return parser.parse();
});

defineChipmunkFunction(
  "eval",
  (args: ChipmunkType[]): ChipmunkType => {
    if (args[0] === undefined) {
      throw new Error('eval() takes one argument');
    }
    return evaluate(args[0], replEnv);
  },
);

replEnv.set("nil", { type: ChipmunkNodeType.Nil });
replEnv.set("true", { type: ChipmunkNodeType.Boolean, value: true });
replEnv.set("false", { type: ChipmunkNodeType.Boolean, value: false });

const inputs: string[] = [
  // logic functions
  `(def not (lambda (x) (if x false true)))`,
  `(def and (lambda (x y) (if x y false)))`,
  `(def or (lambda (x y) (if x true y)))`,
  `(def != (lambda (x y) (not (= x y))))`,
  `(def <= (lambda (x y) (or (< x y) (= x y))))`,
  `(def >= (lambda (x y) (or (> x y) (= x y))))`,
  // math functions
  `(def even? (lambda (x) (= 0 (% x 2))))`,
  `(def odd? (lambda (x) (= 1 (% x 2))))`,
  `(def abs (lambda (x)
     (if (< x 0) (- 0 x) x)))`,
  `(def factorial (lambda (x) (if (= x 0) 1 (* x (factorial (- x 1))))))`,
  // list functions
  `(def empty? (lambda (collection)
     (= 0 (length collection))))`,
  `(def head (lambda (collection)
     (nth collection 0)))`,
  `(def tail (lambda (collection)
     (slice collection 1 (+ (length collection) 1))))`,
  `(def range (lambda (x)
     (if (<= x 0)
       []
       (join (range (- x 1))
             [(- x 1)]))))`,
  `(def map (lambda (function collection)
     (if (empty? collection)
       []
       (join [(function (head collection))]
             (map function (tail collection))))))`,
  `(def filter (lambda (predicate collection)
     (if (empty? collection)
       []
       (join (if (predicate (head collection))
               [(head collection)]
               [])
             (filter predicate (tail collection))))))`,
  `(def any? (lambda (predicate collection)
     (if (empty? collection)
       false
       (if (predicate (head collection))
         true
         (any? predicate (tail collection))))))`,
  `(def every? (lambda (predicate collection)
     (if (empty? collection)
       false
       (if (predicate (head collection))
         true
         (every? predicate (tail collection))))))`,
  `(def reduce (lambda (function value collection)
     (if (empty? collection)
       value
       (reduce function
               (function value (head collection))
               (tail collection)))))`,
  `(def sum (lambda (collection)
     (reduce + 0 collection)))`,
  `(def product (lambda (collection)
     (reduce * 1 collection)))`,
  `(def contains? (lambda (collection value)
     (if (empty? collection)
       false
       (if (= (head collection) value)
         true
         (contains? (tail collection) value)))))`,
  `(def reverse (lambda (collection)
     (if (empty? collection)
       collection
       (join (reverse (tail collection))
             [(head collection)]))))`,
  `(def find (lambda (predicate collection)
     (if (empty? collection)
       nil
       (do (def value (head collection))
                 (if (predicate value)
                   value
                   (find predicate (tail collection)))))))`,
  `(def load-file (lambda (path)
     (eval (parse-string (concat "(do " (read-file path) ")")))))`,
];

inputs.forEach((input: string): void => {
  interpret(input, replEnv);
});

export default replEnv;
