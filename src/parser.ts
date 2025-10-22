import { Node } from "./types";
import { TemplateUtils } from "./utils";

export class TemplateParser {
  private tagRegex = /(\{\{\s*([\s\S]+?)\s*\}\}|\{%\s*([\s\S]+?)\s*%\})/g;

  parse(template: string): Node[] {
    const out: Node[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    type Frame = { type: "root" | "for" | "if"; nodeList: Node[]; meta?: any };
    const stack: Frame[] = [{ type: "root", nodeList: out }];

    const pushTextToTop = (s: string) => {
      if (!s) return;
      stack[stack.length - 1]?.nodeList.push({ type: "text", value: s });
    };

    while ((match = this.tagRegex.exec(template))) {
      pushTextToTop(template.slice(lastIndex, match.index));
      lastIndex = match.index + match[0].length;

      const varInner = match[2];
      const tagInner = match[3];

      if (varInner !== undefined) {
        this.parseVariable(varInner, stack);
      } else if (tagInner !== undefined) {
        this.parseTag(tagInner, stack);
      }
    }

    pushTextToTop(template.slice(lastIndex));

    if (stack.length !== 1) {
      throw new Error("Unclosed tags in template");
    }

    return out;
  }

  private parseVariable(varInner: string, stack: any[]) {
    const varExpr = varInner.trim();
    const parts = varExpr.split("|").map((p) => p.trim());
    const expr = parts.shift() || "";
    const filters = parts.map((f) => {
      const m = f.match(/^([a-zA-Z0-9_]+)(?::(.*))?$/);
      if (!m) return { name: f, args: [] as string[] };
      const name = m[1];
      const args = m[2] ? TemplateUtils.splitArgString(m[2]) : [];
      return { name, args };
    });
    stack[stack.length - 1].nodeList.push({
      type: "var",
      expr,
      filters,
      raw: false,
    });
  }

  private parseTag(tagInner: string, stack: any[]) {
    const tag = tagInner.trim();

    if (tag.startsWith("for ")) {
      this.parseForTag(tag, stack);
    } else if (tag === "endfor") {
      this.parseEndForTag(stack);
    } else if (tag.startsWith("if ")) {
      this.parseIfTag(tag, stack);
    } else if (tag === "else") {
      this.parseElseTag(stack);
    } else if (tag.startsWith("elif ")) {
      this.parseElifTag(tag, stack);
    } else if (tag === "endif") {
      this.parseEndIfTag(stack);
    } else {
      throw new Error("Unknown tag: " + tag);
    }
  }

  private parseForTag(tag: string, stack: any[]) {
    const m = tag.match(/^for\s+([a-zA-Z0-9_]+)\s+in\s+([\s\S]+)$/);
    if (!m) throw new Error("Invalid for tag: " + tag);
    const itemName = m[1];
    const listExpr = m[2]?.trim();
    const node: any = {
      type: "for",
      itemName,
      listExpr,
      body: [] as Node[],
    };
    stack[stack.length - 1].nodeList.push(node);
    stack.push({ type: "for", nodeList: node.body, meta: node });
  }

  private parseEndForTag(stack: any[]) {
    const top = stack.pop();
    if (!top || top.type !== "for") {
      throw new Error("Unexpected endfor");
    }
  }

  private parseIfTag(tag: string, stack: any[]) {
    const cond = tag.slice(3).trim();
    const node: any = {
      type: "if",
      branches: [{ cond, body: [] as Node[] }],
    };
    stack[stack.length - 1].nodeList.push(node);
    stack.push({ type: "if", nodeList: node.branches[0].body, meta: node });
  }

  private parseElseTag(stack: any[]) {
    const top = stack[stack.length - 1];
    if (!top || top.type !== "if") {
      throw new Error("Unexpected else");
    }
    const node = top.meta as any;
    node.branches.push({ cond: undefined, body: [] });
    stack.pop();
    stack.push({
      type: "if",
      nodeList: node.branches[node.branches.length - 1].body,
      meta: node,
    });
  }

  private parseElifTag(tag: string, stack: any[]) {
    const top = stack[stack.length - 1];
    if (!top || top.type !== "if") {
      throw new Error("Unexpected elif");
    }
    const cond = tag.slice(5).trim();
    const node = top.meta as any;
    node.branches.push({ cond, body: [] });
    stack.pop();
    stack.push({
      type: "if",
      nodeList: node.branches[node.branches.length - 1].body,
      meta: node,
    });
  }

  private parseEndIfTag(stack: any[]) {
    const top = stack.pop();
    if (!top || top.type !== "if") {
      throw new Error("Unexpected endif");
    }
  }
}
