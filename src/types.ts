export type Context = Record<string, any>;
export type FilterFn = (value: any, ...args: any[]) => any;

export type Node =
  | { type: "text"; value: string }
  | {
      type: "var";
      expr: string;
      filters: Array<{ name: string; args: string[] }>;
      raw?: boolean;
    }
  | { type: "for"; itemName: string; listExpr: string; body: Node[] }
  | { type: "if"; branches: Array<{ cond?: string; body: Node[] }> };

export interface EngineOptions {
  autoEscape?: boolean;
  filters?: Record<string, FilterFn>;
}
