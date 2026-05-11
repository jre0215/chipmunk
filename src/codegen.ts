import { SourceNode } from "source-map";

import {
  JavaScriptArray,
  JavaScriptArrayAccess,
  JavaScriptAssignmentOperation,
  JavaScriptBinaryOperation,
  JavaScriptBoolean,
  JavaScriptConditionalOperation,
  JavaScriptConsoleLogStatement,
  JavaScriptFunctionCall,
  JavaScriptFunctionDefinition,
  JavaScriptIIFE,
  JavaScriptMethodCall,
  JavaScriptNode,
  JavaScriptNodeType,
  JavaScriptNull,
  JavaScriptNumber,
  JavaScriptPropertyAccess,
  JavaScriptString,
  JavaScriptVariable,
} from "./jstypes.ts";
import Parser from "./Parser.ts";
import Tokenizer from "./Tokenizer.ts";
import {
  ChipmunkList,
  ChipmunkNodeType,
  ChipmunkSymbol,
  ChipmunkType,
} from "./types.ts";
import escapeString from "./utils/escapeString.ts";

const binaryOperators: string[] = [
  "!=",
  "%",
  "*",
  "+",
  "-",
  "/",
  "<",
  "<=",
  "=",
  ">",
  ">=",
  "and",
  "or",
];

function sanitizeJavaScriptIdentifier(identifier: string): string {
  return identifier.replace(/\W/g, "_");
}

function convertChipmunkNodeToJavaScriptNode(
  ast: ChipmunkType,
  root: boolean,
): JavaScriptNode {
  const line: number = ast.line as number;
  const column: number = (ast.column as number) - 1;

  if (root) {
    return {
      type: JavaScriptNodeType.IIFE,
      nodes: [convertChipmunkNodeToJavaScriptNode(ast, false)],
      isRootNode: true,
      line,
      column,
    };
  }

  if (ast.type === ChipmunkNodeType.List) {
    const head: ChipmunkType = ast.items[0];
    if (head.type === ChipmunkNodeType.Symbol) {
      if (binaryOperators.includes(head.name)) {
        let operator: string = head.name;
        if (operator === "=") {
          operator = "===";
        } else if (operator === "!=") {
          operator = "!==";
        } else if (operator === "and") {
          operator = "&&";
        } else if (operator === "or") {
          operator = "||";
        }
        const leftSide: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[1],
          false,
        );
        const rightSide: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[2],
          false,
        );
        return {
          type: JavaScriptNodeType.BINARY_OPERATION,
          operator,
          leftSide,
          rightSide,
          line,
          column,
        };
      } else if (head.name === "abs") {
        const argument: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[1],
          false,
        );
        return {
          type: JavaScriptNodeType.METHOD_CALL,
          object: {
            type: JavaScriptNodeType.VARIABLE,
            name: "Math",
            line,
            column,
          },
          methodName: "abs",
          args: [argument],
          line,
          column,
        };
      } else if (head.name === "concat") {
        const items: JavaScriptNode[] = ast.items.slice(1).map((item) =>
          convertChipmunkNodeToJavaScriptNode(item, false)
        );
        return {
          type: JavaScriptNodeType.METHOD_CALL,
          object: items[0],
          methodName: "concat",
          args: items.slice(1),
          line,
          column,
        };
      } else if (head.name === "def") {
        if (ast.items[1].type !== ChipmunkNodeType.Symbol) {
          throw new Error("first argument to def must be a symbol");
        }
        const name: string = sanitizeJavaScriptIdentifier(
          (ast.items[1] as ChipmunkSymbol).name,
        );
        const value: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[2],
          false,
        );
        return {
          type: JavaScriptNodeType.ASSIGNMENT_OPERATION,
          name,
          value,
          line,
          column,
        };
      } else if (head.name === "do") {
        const nodes: JavaScriptNode[] = ast.items.slice(1).map((
          item: ChipmunkType,
        ) => convertChipmunkNodeToJavaScriptNode(item, false));
        return {
          type: JavaScriptNodeType.IIFE,
          nodes,
          isRootNode: false,
          line,
          column,
        };
      } else if (head.name === "head") {
        const array: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[1],
          false,
        );
        return {
          type: JavaScriptNodeType.ARRAY_ACCESS,
          array,
          index: {
            type: JavaScriptNodeType.NUMBER,
            value: 0,
            line,
            column,
          },
          line,
          column,
        };
      } else if (head.name === "if") {
        const condition: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[1],
          false,
        );
        const valueIfTrue: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[2],
          false,
        );
        const valueIfFalse: JavaScriptNode =
          convertChipmunkNodeToJavaScriptNode(ast.items[3], false);
        return {
          type: JavaScriptNodeType.CONDITIONAL_OPERATION,
          condition,
          valueIfTrue,
          valueIfFalse,
          line,
          column,
        };
      } else if (head.name === "join") {
        const firstList: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[1],
          false,
        );
        const secondList: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[2],
          false,
        );
        return {
          type: JavaScriptNodeType.METHOD_CALL,
          object: firstList,
          methodName: "concat",
          args: [secondList],
          line,
          column,
        };
      } else if (head.name === "lambda") {
        if (ast.items[1].type !== ChipmunkNodeType.List) {
          throw new Error(
            "first argument to lambda must be list of parameters",
          );
        }
        const paramList: ChipmunkList = ast.items[1] as ChipmunkList;
        const paramSymbols: ChipmunkSymbol[] = paramList.items.map((
          item: ChipmunkType,
        ) => item as ChipmunkSymbol);
        const params: string[] = paramSymbols.map((item: ChipmunkSymbol) =>
          sanitizeJavaScriptIdentifier(item.name)
        );
        const body: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[2],
          false,
        );
        return {
          type: JavaScriptNodeType.FUNCTION_DEFINITION,
          params,
          body,
          line,
          column,
        };
      } else if (head.name === "length") {
        const object: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[1],
          false,
        );
        return {
          type: JavaScriptNodeType.PROPERTY_ACCESS,
          object,
          propertyName: "length",
          line,
          column,
        };
      } else if (head.name === "map") {
        const fn: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[1],
          false,
        );
        const object: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[2],
          false,
        );
        return {
          type: JavaScriptNodeType.METHOD_CALL,
          object,
          methodName: "map",
          args: [fn],
          line,
          column,
        };
      } else if (head.name === "nth") {
        const array: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[1],
          false,
        );
        const index: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[2],
          false,
        );
        return {
          type: JavaScriptNodeType.ARRAY_ACCESS,
          array,
          index,
          line,
          column,
        };
      } else if (head.name === "parse-integer") {
        const object: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[1],
          false,
        );
        return {
          type: JavaScriptNodeType.FUNCTION_CALL,
          functionName: "parseInt",
          args: [object, {
            type: JavaScriptNodeType.NUMBER,
            value: 10,
            line,
            column,
          }],
          line,
          column,
        };
      } else if (head.name === "print-line") {
        let object: JavaScriptNode;
        if (ast.items.length === 1) {
          object = {
            type: JavaScriptNodeType.STRING,
            value: "\n",
            line,
            column,
          };
        } else {
          object = convertChipmunkNodeToJavaScriptNode(ast.items[1], false);
        }
        return {
          type: JavaScriptNodeType.CONSOLE_LOG_STATEMENT,
          object,
          line,
          column,
        };
      } else if (head.name === "range") {
        const n: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[1],
          false,
        );
        return {
          type: JavaScriptNodeType.METHOD_CALL,
          object: {
            type: JavaScriptNodeType.VARIABLE,
            name: "Array",
            line,
            column,
          },
          methodName: "from",
          args: [
            {
              type: JavaScriptNodeType.METHOD_CALL,
              object: {
                type: JavaScriptNodeType.FUNCTION_CALL,
                functionName: "Array",
                args: [n],
                line,
                column,
              },
              methodName: "keys",
              args: [],
              line,
              column,
            },
          ],
          line,
          column,
        };
      } else if (head.name === "reduce") {
        const fn: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[1],
          false,
        );
        const initialValue: JavaScriptNode =
          convertChipmunkNodeToJavaScriptNode(ast.items[2], false);
        const object: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[3],
          false,
        );
        return {
          type: JavaScriptNodeType.METHOD_CALL,
          object,
          methodName: "reduce",
          args: [fn, initialValue],
          line,
          column,
        };
      } else if (head.name === "sum") {
        const object: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[1],
          false,
        );
        return {
          type: JavaScriptNodeType.METHOD_CALL,
          object,
          methodName: "reduce",
          args: [{
            type: JavaScriptNodeType.FUNCTION_DEFINITION,
            params: ["x", "y"],
            body: {
              type: JavaScriptNodeType.BINARY_OPERATION,
              operator: "+",
              leftSide: {
                type: JavaScriptNodeType.VARIABLE,
                name: "x",
                line,
                column,
              },
              rightSide: {
                type: JavaScriptNodeType.VARIABLE,
                name: "y",
                line,
                column,
              },
              line,
              column,
            },
            line,
            column,
          }, {
            type: JavaScriptNodeType.NUMBER,
            value: 0,
            line,
            column,
          }],
          line,
          column,
        };
      } else if (head.name === "to-string") {
        const object: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
          ast.items[1],
          false,
        );
        return {
          type: JavaScriptNodeType.FUNCTION_CALL,
          functionName: "String",
          args: [object],
          line,
          column,
        };
      } else {
        const functionName: string = sanitizeJavaScriptIdentifier(head.name);
        const args: JavaScriptNode[] = ast.items.slice(1).map((
          item: ChipmunkType,
        ) => convertChipmunkNodeToJavaScriptNode(item, false));
        return {
          type: JavaScriptNodeType.FUNCTION_CALL,
          functionName,
          args,
          line,
          column,
        };
      }
    }
    const items: JavaScriptNode[] = ast.items.map((item: ChipmunkType) =>
      convertChipmunkNodeToJavaScriptNode(item, false)
    );
    return { type: JavaScriptNodeType.ARRAY, items, line, column };
  } else if (ast.type === ChipmunkNodeType.Boolean) {
    return { type: JavaScriptNodeType.BOOLEAN, value: ast.value, line, column };
  } else if (ast.type === ChipmunkNodeType.Nil) {
    return { type: JavaScriptNodeType.NULL, line, column };
  } else if (ast.type === ChipmunkNodeType.Number) {
    return { type: JavaScriptNodeType.NUMBER, value: ast.value, line, column };
  } else if (ast.type === ChipmunkNodeType.String) {
    return { type: JavaScriptNodeType.STRING, value: ast.value, line, column };
  } else if (ast.type === ChipmunkNodeType.Symbol) {
    if (ast.name === "argv") {
      return {
        type: JavaScriptNodeType.VARIABLE,
        name:
          "((typeof Deno !== 'undefined') ? Deno.args : process.argv.slice(2))",
        line,
        column,
      };
    } else if (ast.name === "concat") {
      return {
        type: JavaScriptNodeType.FUNCTION_DEFINITION,
        params: ["x", "y"],
        body: {
          type: JavaScriptNodeType.BINARY_OPERATION,
          operator: "+",
          leftSide: {
            type: JavaScriptNodeType.VARIABLE,
            name: "x",
            line,
            column,
          },
          rightSide: {
            type: JavaScriptNodeType.VARIABLE,
            name: "y",
            line,
            column,
          },
          line,
          column,
        },
        line,
        column,
      };
    } else if (ast.name === "nil") {
      return { type: JavaScriptNodeType.NULL, line, column };
    } else if (ast.name === "true") {
      return { type: JavaScriptNodeType.BOOLEAN, value: true, line, column };
    } else if (ast.name === "false") {
      return { type: JavaScriptNodeType.BOOLEAN, value: false, line, column };
    } else {
      return {
        type: JavaScriptNodeType.VARIABLE,
        name: sanitizeJavaScriptIdentifier(ast.name),
        line,
        column,
      };
    }
  } else if (ast.type === ChipmunkNodeType.Vector) {
    const items: JavaScriptNode[] = ast.items.map((item: ChipmunkType) => {
      return convertChipmunkNodeToJavaScriptNode(item, false);
    });
    return { type: JavaScriptNodeType.ARRAY, items, line, column };
  }

  throw new Error("not implemented");
}

function compileJavaScriptArray(
  ast: JavaScriptArray,
  sourceFile: string | null = null,
  indent: number = 0,
): SourceNode {
  if (ast.items.length === 0) {
    return new SourceNode(
      ast.line,
      ast.column,
      sourceFile,
      "[]",
    );
  }

  if (ast.items[0].type === JavaScriptNodeType.FUNCTION_DEFINITION) {
    const functionNode: SourceNode = compileJavaScriptToSourceNode(
      ast.items[0],
      sourceFile,
      indent,
    );
    const argNodes: (SourceNode)[] = ast.items.slice(1).map((
      item: JavaScriptNode,
    ) => compileJavaScriptToSourceNode(item, sourceFile, indent));
    const argNodesWithCommas: any[] = [];
    for (let i: number = 0; i < argNodes.length; i++) {
      argNodesWithCommas.push(argNodes[i]);
      if (i < argNodes.length - 1) {
        argNodesWithCommas.push(", ");
      }
    }
    return new SourceNode(
      ast.line,
      ast.column,
      sourceFile,
      [functionNode, "(", ...argNodesWithCommas, ")"],
    );
  } else {
    const itemNodes: (SourceNode)[] = ast.items.map((
      item: JavaScriptNode,
    ) => compileJavaScriptToSourceNode(item, sourceFile, indent));
    const itemNodesWithCommas: any[] = [];
    for (let i: number = 0; i < itemNodes.length; i++) {
      itemNodesWithCommas.push(itemNodes[i]);
      if (i < itemNodes.length - 1) {
        itemNodesWithCommas.push(", ");
      }
    }
    return new SourceNode(
      ast.line,
      ast.column,
      sourceFile,
      ["[", ...itemNodesWithCommas, "]"],
    );
  }
}

function compileJavaScriptArrayAccess(
  ast: JavaScriptArrayAccess,
  sourceFile: string | null = null,
  indent: number = 0,
): SourceNode {
  const arrayNode: SourceNode = compileJavaScriptToSourceNode(
    ast.array,
    sourceFile,
    indent,
  );
  const indexNode: SourceNode = compileJavaScriptToSourceNode(
    ast.index,
    sourceFile,
    indent,
  );
  return new SourceNode(
    ast.line,
    ast.column,
    sourceFile,
    [arrayNode, "[", indexNode, "]"],
  );
}

function compileJavaScriptAssignmentOperation(
  ast: JavaScriptAssignmentOperation,
  sourceFile: string | null = null,
  indent: number = 0,
): SourceNode {
  const valueNode: SourceNode = compileJavaScriptToSourceNode(
    ast.value,
    sourceFile,
    indent,
  );
  return new SourceNode(
    ast.line,
    ast.column,
    sourceFile,
    [" ".repeat(indent), `const ${ast.name} = `, valueNode],
  );
}

function compileJavaScriptBinaryOperation(
  ast: JavaScriptBinaryOperation,
  sourceFile: string | null = null,
  indent: number = 0,
): SourceNode {
  const leftSideNode: SourceNode = compileJavaScriptToSourceNode(
    ast.leftSide,
    sourceFile,
    indent,
  );
  const rightSideNode: SourceNode = compileJavaScriptToSourceNode(
    ast.rightSide,
    sourceFile,
    indent,
  );
  return new SourceNode(
    ast.line,
    ast.column,
    sourceFile,
    ["(", leftSideNode, " ", ast.operator, " ", rightSideNode, ")"],
  );
}

function compileJavaScriptBoolean(
  ast: JavaScriptBoolean,
  sourceFile: string | null = null,
  indent: number = 0,
): SourceNode {
  return new SourceNode(
    ast.line,
    ast.column,
    sourceFile,
    ast.value ? "true" : "false",
  );
}

function compileJavaScriptConditionalOperation(
  ast: JavaScriptConditionalOperation,
  sourceFile: string | null = null,
  indent: number = 0,
): SourceNode {
  const conditionNode: SourceNode = compileJavaScriptToSourceNode(
    ast.condition,
    sourceFile,
    indent,
  );
  const valueIfTrueNode: SourceNode = compileJavaScriptToSourceNode(
    ast.valueIfTrue,
    sourceFile,
    indent,
  );
  const valueIfFalseNode: SourceNode = compileJavaScriptToSourceNode(
    ast.valueIfFalse,
    sourceFile,
    indent,
  );
  return new SourceNode(
    ast.line,
    ast.column,
    sourceFile,
    ["(", conditionNode, " ? ", valueIfTrueNode, " : ", valueIfFalseNode, ")"],
  );
}

function compileJavaScriptConsoleLogStatement(
  ast: JavaScriptConsoleLogStatement,
  sourceFile: string | null = null,
  indent: number = 0,
): SourceNode {
  const objectNode: SourceNode = compileJavaScriptToSourceNode(
    ast.object,
    sourceFile,
    indent,
  );
  return new SourceNode(
    ast.line,
    ast.column,
    sourceFile,
    [
      "(function () {\n",
      " ".repeat(indent + 2),
      "const _ = ",
      objectNode,
      ";\n",
      " ".repeat(indent + 2),
      "console.log(_);\n",
      " ".repeat(indent + 2),
      "return _;\n",
      " ".repeat(indent),
      "})()",
    ],
  );
}

function compileJavaScriptFunctionCall(
  ast: JavaScriptFunctionCall,
  sourceFile: string | null = null,
  indent: number = 0,
): SourceNode {
  const argNodes: (SourceNode)[] = ast.args.map((
    item: JavaScriptNode,
  ) => compileJavaScriptToSourceNode(item, sourceFile, indent));
  const argNodesWithCommas: any[] = [];
  for (let i: number = 0; i < argNodes.length; i++) {
    argNodesWithCommas.push(argNodes[i]);
    if (i !== argNodes.length - 1) {
      argNodesWithCommas.push(", ");
    }
  }
  return new SourceNode(
    ast.line,
    ast.column,
    sourceFile,
    [ast.functionName, "(", ...argNodesWithCommas, ")"],
  );
}

function compileJavaScriptFunctionDefinition(
  ast: JavaScriptFunctionDefinition,
  sourceFile: string | null = null,
  indent: number = 0,
): SourceNode {
  const functionBodyNode: SourceNode = compileJavaScriptToSourceNode(
    ast.body,
    sourceFile,
    indent + 2,
  );
  return new SourceNode(
    ast.line,
    ast.column,
    sourceFile,
    [
      "(function (",
      ast.params.join(", "),
      ") {\n",
      " ".repeat(indent + 2),
      "return ",
      functionBodyNode,
      ";\n",
      " ".repeat(indent),
      "})",
    ],
  );
}

function compileJavaScriptIIFE(
  ast: JavaScriptIIFE,
  sourceFile: string | null = null,
  indent: number = 0,
): SourceNode {
  const statementNodes: (SourceNode)[] = ast.nodes.slice(
    0,
    ast.nodes.length - 1,
  )
    .map((node: JavaScriptNode) =>
      compileJavaScriptToSourceNode(node, sourceFile, indent + 2)
    );
  // TODO: fix statements not being aligned in the outputted JS
  const statementNodesWithLineBreaks: any[] = [];
  for (const statementNode of statementNodes) {
    statementNodesWithLineBreaks.push(statementNode);
    statementNodesWithLineBreaks.push(";\n");
  }
  const returnValueNode: SourceNode = compileJavaScriptToSourceNode(
    ast.nodes[ast.nodes.length - 1],
    sourceFile,
    indent + 2,
  );

  if (statementNodes.length === 0) {
    return new SourceNode(
      ast.line,
      ast.column,
      sourceFile,
      [
        "(function () {\n",
        " ".repeat(indent + 2),
        "return ",
        returnValueNode,
        ";\n",
        " ".repeat(indent),
        "})()",
      ],
    );
  } else {
    return new SourceNode(
      ast.line,
      ast.column,
      sourceFile,
      [
        "(function () {\n",
        ...statementNodesWithLineBreaks,
        " ".repeat(indent + 2),
        "return ",
        returnValueNode,
        ";\n",
        " ".repeat(indent),
        "})()",
      ],
    );
  }
}

function compileJavaScriptMethodCall(
  ast: JavaScriptMethodCall,
  sourceFile: string | null = null,
  indent: number = 0,
): SourceNode {
  const objectNode: SourceNode = compileJavaScriptToSourceNode(
    ast.object,
    sourceFile,
    indent,
  );
  const argNodes: (SourceNode)[] = ast.args.map((
    item: JavaScriptNode,
  ) => compileJavaScriptToSourceNode(item, sourceFile, indent));
  const argNodesWithCommas: any[] = [];
  for (let i: number = 0; i < argNodes.length; i++) {
    argNodesWithCommas.push(argNodes[i]);
    if (i !== argNodes.length - 1) {
      argNodesWithCommas.push(", ");
    }
  }
  return new SourceNode(
    ast.line,
    ast.column,
    sourceFile,
    [objectNode, ".", ast.methodName, "(", ...argNodesWithCommas, ")"],
  );
}

function compileJavaScriptNull(
  ast: JavaScriptNull,
  sourceFile: string | null = null,
): SourceNode {
  return new SourceNode(
    ast.line,
    ast.column,
    sourceFile,
    "null",
  );
}

function compileJavaScriptNumber(
  ast: JavaScriptNumber,
  sourceFile: string | null = null,
): SourceNode {
  return new SourceNode(
    ast.line,
    ast.column,
    sourceFile,
    ast.value.toString(),
  );
}

function compileJavaScriptPropertyAccess(
  ast: JavaScriptPropertyAccess,
  sourceFile: string | null = null,
  indent: number = 0,
): SourceNode {
  const objectNode: SourceNode = compileJavaScriptToSourceNode(
    ast.object,
    sourceFile,
    indent,
  );
  return new SourceNode(
    ast.line,
    ast.column,
    sourceFile,
    [objectNode, ".", ast.propertyName],
  );
}

function compileJavaScriptString(
  ast: JavaScriptString,
  sourceFile: string | null = null,
): SourceNode {
  return new SourceNode(
    ast.line,
    ast.column,
    sourceFile,
    escapeString(ast.value),
  );
}

function compileJavaScriptVariable(
  ast: JavaScriptVariable,
  sourceFile: string | null = null,
): SourceNode {
  return new SourceNode(
    ast.line,
    ast.column,
    sourceFile,
    ast.name,
  );
}

function compileJavaScriptToSourceNode(
  ast: JavaScriptNode,
  sourceFile: string | null = null,
  indent: number = 0,
): SourceNode {
  if (ast.type === JavaScriptNodeType.ARRAY) {
    return compileJavaScriptArray(ast, sourceFile, indent);
  } else if (ast.type === JavaScriptNodeType.ARRAY_ACCESS) {
    return compileJavaScriptArrayAccess(ast, sourceFile, indent);
  } else if (ast.type === JavaScriptNodeType.ASSIGNMENT_OPERATION) {
    return compileJavaScriptAssignmentOperation(ast, sourceFile, indent);
  } else if (ast.type === JavaScriptNodeType.BINARY_OPERATION) {
    return compileJavaScriptBinaryOperation(ast, sourceFile, indent);
  } else if (ast.type === JavaScriptNodeType.BOOLEAN) {
    return compileJavaScriptBoolean(ast, sourceFile, indent);
  } else if (ast.type === JavaScriptNodeType.CONDITIONAL_OPERATION) {
    return compileJavaScriptConditionalOperation(ast, sourceFile, indent);
  } else if (ast.type === JavaScriptNodeType.CONSOLE_LOG_STATEMENT) {
    return compileJavaScriptConsoleLogStatement(ast, sourceFile, indent);
  } else if (ast.type === JavaScriptNodeType.FUNCTION_CALL) {
    return compileJavaScriptFunctionCall(ast, sourceFile, indent);
  } else if (ast.type === JavaScriptNodeType.FUNCTION_DEFINITION) {
    return compileJavaScriptFunctionDefinition(ast, sourceFile, indent);
  } else if (ast.type === JavaScriptNodeType.IIFE) {
    return compileJavaScriptIIFE(ast, sourceFile, indent);
  } else if (ast.type === JavaScriptNodeType.METHOD_CALL) {
    return compileJavaScriptMethodCall(ast, sourceFile, indent);
  } else if (ast.type === JavaScriptNodeType.NULL) {
    return compileJavaScriptNull(ast, sourceFile);
  } else if (ast.type === JavaScriptNodeType.NUMBER) {
    return compileJavaScriptNumber(ast, sourceFile);
  } else if (ast.type === JavaScriptNodeType.PROPERTY_ACCESS) {
    return compileJavaScriptPropertyAccess(ast, sourceFile, indent);
  } else if (ast.type === JavaScriptNodeType.STRING) {
    return compileJavaScriptString(ast, sourceFile);
  } else if (ast.type === JavaScriptNodeType.VARIABLE) {
    return compileJavaScriptVariable(ast, sourceFile);
  } else {
    throw new Error("unrecognized node");
  }
}

function compileChipmunkFileToJavaScript(path: string): void {
  const input: string = Deno.readTextFileSync(path);
  const tokenizer: Tokenizer = new Tokenizer(`(do ${input})`);
  const parser: Parser = new Parser(tokenizer.tokenize());
  const chipmunkAst: ChipmunkType = parser.parse();

  const javaScriptAst: JavaScriptNode = convertChipmunkNodeToJavaScriptNode(
    chipmunkAst,
    true,
  );
  const javaScriptCodeFile: string = path.replace(/.\w+$/, ".js");
  const javaScriptSourceMapFile: string = javaScriptCodeFile + ".map";

  const generatedCode: any = compileJavaScriptToSourceNode(javaScriptAst, path)
    .toStringWithSourceMap({
      file: javaScriptCodeFile,
    });
  Deno.writeTextFileSync(
    javaScriptCodeFile,
    generatedCode.code + "\n//# sourceMappingURL=" + javaScriptSourceMapFile +
      "\n",
  );
  Deno.writeTextFileSync(javaScriptSourceMapFile, generatedCode.map.toString());
}

export {
  compileChipmunkFileToJavaScript,
  compileJavaScriptToSourceNode,
  convertChipmunkNodeToJavaScriptNode,
};
