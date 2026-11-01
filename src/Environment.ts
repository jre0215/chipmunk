import type { ChipmunkSymbol, ChipmunkType } from "./types.js";

class Environment {
  private data: Map<string, ChipmunkType> = new Map();

  public constructor(
    public readonly outerEnv?: Environment,
    bindSymbols: ChipmunkSymbol[] = [],
    bindExpressions: ChipmunkType[] = [],
  ) {
    for (let i: number = 0; i < bindSymbols.length; i++) {
      this.set(bindSymbols[i]!.name, bindExpressions[i]!);
    }
  }

  public find(key: string): Environment {
    if (this.data.has(key)) {
      return this;
    } else if (this.outerEnv) {
      return this.outerEnv.find(key);
    }
    throw new Error(`symbol not found: ${key}`);
  }

  public set(key: string, value: ChipmunkType): void {
    this.data.set(key, value);
  }

  public get(key: string): ChipmunkType {
    return this.find(key).data.get(key) as ChipmunkType;
  }
}

export default Environment;
