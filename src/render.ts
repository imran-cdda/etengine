import { Context, FilterFn, Node } from "./types";
import { TemplateUtils } from "./utils";

export class TemplateRenderer {
  constructor(
    private filtersMap: Record<string, FilterFn>,
    private autoEscape: boolean
  ) {}

  render(nodes: Node[], ctx: Context): string {
    let out = "";
    for (const node of nodes) {
      out += this.renderNode(node, ctx);
    }
    return out;
  }

  private renderNode(node: Node, ctx: Context): string {
    switch (node.type) {
      case "text":
        return node.value;
      case "var":
        return this.renderVariable(node, ctx);
      case "for":
        return this.renderFor(node, ctx);
      case "if":
        return this.renderIf(node, ctx);
      default:
        return "";
    }
  }

  private renderVariable(node: any, ctx: Context): string {
    const value = TemplateUtils.evaluateVarExpression(node.expr, ctx);
    const after = this.applyFilters(value, node.filters, ctx);
    return this.autoEscape
      ? TemplateUtils.escapeHtml(after)
      : String(after ?? "");
  }

  private renderFor(node: any, ctx: Context): string {
    const list = TemplateUtils.evaluateVarExpression(node.listExpr, ctx);
    const body = node.body as Node[];
    let out = "";

    if (Array.isArray(list)) {
      for (const item of list) {
        const frame = { ...ctx, [node.itemName]: item };
        out += this.render(body, frame);
      }
    } else if (typeof list === "object" && list != null) {
      for (const key of Object.keys(list)) {
        const frame = { ...ctx, [node.itemName]: list[key] };
        out += this.render(body, frame);
      }
    }

    return out;
  }

  private renderIf(node: any, ctx: Context): string {
    for (const branch of node.branches) {
      if (branch.cond == null) {
        // else branch
        return this.render(branch.body, ctx);
      } else {
        if (TemplateUtils.evalCondition(branch.cond, ctx)) {
          return this.render(branch.body, ctx);
        }
      }
    }
    return "";
  }

  private applyFilters(
    val: any,
    filters: Array<{ name: string; args: string[] }>,
    ctx: Context
  ): any {
    let cur = val;
    for (const f of filters) {
      const fn = this.filtersMap[f.name];
      if (!fn) continue;

      const evaluatedArgs = f.args.map((a) => {
        if (a === "true") return true;
        if (a === "false") return false;
        if (/^-?\d+(\.\d+)?$/.test(a)) return Number(a);
        const resolved = TemplateUtils.resolvePath(ctx, a);
        return resolved !== undefined ? resolved : a;
      });

      cur = fn(cur, ...evaluatedArgs);
    }
    return cur;
  }
}
