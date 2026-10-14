import Environment from "./Environment.ts";
import EvaluationError from "./EvaluationError.ts";
import {
  ChipmunkFunction,
  ChipmunkList,
  ChipmunkNodeType,
  ChipmunkSymbol,
  ChipmunkType,
} from "./types.ts";

function evaluate(
  ast: ChipmunkType,
  env: Environment,
): ChipmunkType {
  if (ast.type === ChipmunkNodeType.Symbol) {
    return env.get(ast.name);
  }

  if (ast.type === ChipmunkNodeType.Vector) {
    return {
      type: ChipmunkNodeType.Vector,
      items: ast.items.map((value) => evaluate(value, env)),
    };
  }

  if (ast.type === ChipmunkNodeType.List) {
    if (ast.items.length === 0) {
      return ast;
    }

    const head: ChipmunkType = ast.items[0];
    if (head.type === ChipmunkNodeType.Symbol) {
      if (head.name === "def") {
        const arg1: ChipmunkType = ast.items[1];
        if (arg1.type !== ChipmunkNodeType.Symbol) {
          const expectedType: string =
            ChipmunkNodeType[ChipmunkNodeType.Symbol];
          const actualType: string = ChipmunkNodeType[arg1.type];
          throw new EvaluationError(
            `expected first argument to '${head.name}' to be of type ` +
              `${expectedType} but got type ${actualType}`,
          );
        }
        const key: string = arg1.name;
        const value: ChipmunkType = evaluate(ast.items[2], env);
        env.set(key, value);
        return value;
      } else if (head.name === "if") {
        const condition: ChipmunkType = ast.items[1];
        const result: ChipmunkType = evaluate(condition, env);

        if (result.type !== ChipmunkNodeType.Boolean) {
          const expectedType: string =
            ChipmunkNodeType[ChipmunkNodeType.Boolean];
          const actualType: string = ChipmunkNodeType[result.type];
          throw new EvaluationError(
            `expected first argument to '${head.name}' to be of type ` +
              `${expectedType} but got type ${actualType}`,
          );
        }

        if (result.value) {
          return evaluate(ast.items[2], env);
        } else {
          return evaluate(ast.items[3], env);
        }
      } else if (head.name === "lambda") {
        const arg1: ChipmunkType = ast.items[1];
        if (arg1.type !== ChipmunkNodeType.List) {
          const expectedType: string = ChipmunkNodeType[ChipmunkNodeType.List];
          const actualType: string = ChipmunkNodeType[arg1.type];
          throw new EvaluationError(
            `expected first argument to '${head.name}' to be of type ` +
              `${expectedType} but got type ${actualType}`,
          );
        }

        const functionParams: ChipmunkSymbol[] = arg1.items.map(
          (item: ChipmunkType) => {
            if (item.type !== ChipmunkNodeType.Symbol) {
              const expectedType: string =
                ChipmunkNodeType[ChipmunkNodeType.Symbol];
              const actualType: string = ChipmunkNodeType[item.type];
              throw new EvaluationError(
                `expected first argument to '${head.name}' to be list containing ` +
                  `items of type ${expectedType} but got type ${actualType}`,
              );
            }
            return item;
          },
        );

        const functionBody: ChipmunkType = ast.items[2];

        const newFunction: ChipmunkFunction = {
          type: ChipmunkNodeType.Function,
          callable: (functionArgs: ChipmunkType[]): ChipmunkType => {
            return evaluate(
              functionBody,
              new Environment(env, functionParams, functionArgs),
            );
          },
          isUserDefined: true,
          params: functionParams,
          body: functionBody,
        };

        return newFunction;
      } else if (head.name === "quote") {
        return ast.items[1];
      } else if (head.name === "set") {
        const arg1: ChipmunkType = ast.items[1];
        if (arg1.type !== ChipmunkNodeType.Symbol) {
          const expectedType: string =
            ChipmunkNodeType[ChipmunkNodeType.Symbol];
          const actualType: string = ChipmunkNodeType[arg1.type];
          throw new EvaluationError(
            `expected first argument to '${head.name}' to be of type ` +
              `${expectedType} but got type ${actualType}`,
          );
        }
        const key: string = arg1.name;
        const envToUpdate: Environment = env.find(key);
        const value: ChipmunkType = evaluate(ast.items[2], env);
        envToUpdate.set(key, value);
        return value;
      }
    }

    const evaluatedList: ChipmunkList = {
      type: ChipmunkNodeType.List,
      items: ast.items.map((item: ChipmunkType) => evaluate(item, env)),
    };

    const item0: ChipmunkType = evaluatedList.items[0];
    if (item0.type !== ChipmunkNodeType.Function) {
      const actualType: string = ChipmunkNodeType[item0.type];
      throw new EvaluationError(
        "expected first item of list to be of type FUNCTION but got type " +
          actualType,
      );
    }

    const fn: ChipmunkFunction = item0;
    const args: ChipmunkType[] = evaluatedList.items.slice(1);
    return fn.callable(args);
  }

  return ast;
}

export default evaluate;
