import type Environment from "./Environment.js";
import type { ChipmunkType } from "./types.js";
import evaluate from "./evaluate.js";
import Parser from "./Parser.js";
import Tokenizer from "./Tokenizer.js";

function interpret(
  input: string,
  environment: Environment,
): ChipmunkType {
  const tokenizer: Tokenizer = new Tokenizer(input);
  const parser: Parser = new Parser(tokenizer.tokenize());
  return evaluate(parser.parse(), environment);
}

export default interpret;
