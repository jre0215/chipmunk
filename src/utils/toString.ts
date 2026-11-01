import { ChipmunkNodeType, type ChipmunkSymbol, type ChipmunkType } from "../types.js";
import escapeString from "./escapeString.js";

function toString(ast: ChipmunkType, printable: boolean = false): string {
  if (ast.type === ChipmunkNodeType.Boolean) {
    return ast.value ? "true" : "false";
  } else if (ast.type === ChipmunkNodeType.Function) {
    if (ast.isUserDefined) {
      const stringParams: string = (ast.params as ChipmunkSymbol[])
        .map((param: ChipmunkSymbol): string => param.name).join(" ");
      const stringBody: string = toString(ast.body as ChipmunkType);
      return `(lambda (${stringParams}) ${stringBody})`;
    } else {
      return ast.name as string;
    }
  } else if (ast.type === ChipmunkNodeType.List) {
    const joined = ast.items.map((item: ChipmunkType) => toString(item)).join(
      " ",
    );
    return `(${joined})`;
  } else if (ast.type === ChipmunkNodeType.Map) {
    const chunks: string[] = [];
    ast.entries.forEach((value: ChipmunkType, key: string): void => {
      chunks.push(toString({ type: ChipmunkNodeType.String, value: key }));
      chunks.push(toString(value));
    });
    return `{${chunks.join(" ")}}`;
  } else if (ast.type === ChipmunkNodeType.Nil) {
    return "nil";
  } else if (ast.type === ChipmunkNodeType.Number) {
    return `${ast.value}`;
  } else if (ast.type === ChipmunkNodeType.String) {
    if (printable) {
      return ast.value;
    } else {
      return escapeString(ast.value);
    }
  } else if (ast.type === ChipmunkNodeType.Symbol) {
    return ast.name;
  } else if (ast.type === ChipmunkNodeType.Vector) {
    const joined = ast.items.map((item: ChipmunkType) => toString(item)).join(
      " ",
    );
    return `[${joined}]`;
  }
  throw new Error("unknown data type");
}

export default toString;
