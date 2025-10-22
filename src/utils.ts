import { Context } from "./types";

export class TemplateUtils {
  static escapeHtml(s: any): string {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  static resolvePath(context: Context, path: string): any {
    try {
      const parts = path.split(".");
      let cur: any = context;
      for (const p of parts) {
        if (cur == null) return undefined;
        // support bracket like items[0]
        const bracketMatch = p.match(/^([^[]+)\[(\d+)\]$/);
        if (bracketMatch) {
          const key = bracketMatch[1];
          const idx = Number(bracketMatch[2]);
          if (key === undefined) return undefined;
          cur = cur[key];
          if (!Array.isArray(cur)) return undefined;
          cur = cur[idx];
        } else {
          cur = cur[p];
        }
      }
      return cur;
    } catch (e) {
      return undefined;
    }
  }

  static splitArgString(s: string): string[] {
    const res: string[] = [];
    let i = 0;
    const L = s.length;
    while (i < L) {
      while (i < L && /\s/.test(s.charAt(i))) i++;
      if (i >= L) break;
      if (s.charAt(i) === '"' || s.charAt(i) === "'") {
        const quote = s.charAt(i++);
        let buf = "";
        while (i < L && s.charAt(i) !== quote) {
          if (s.charAt(i) === "\\") {
            i++;
            if (i < L) buf += s.charAt(i++);
          } else {
            buf += s.charAt(i++);
          }
        }
        i++; // skip end quote
        res.push(buf);
      } else {
        // unquoted token (number or identifier)
        let buf = "";
        while (i < L && !/[\s,]/.test(s.charAt(i))) buf += s.charAt(i++);
        if (buf.endsWith(",")) buf = buf.slice(0, -1);
        res.push(buf);
        while (i < L && /[, ]/.test(s.charAt(i))) i++;
      }
      while (s.charAt(i) === ",") i++;
    }
    return res.filter(Boolean);
  }

  static evalCondition(expr: string, ctx: Context): boolean {
    try {
      const fn = new Function("ctx", "with (ctx) { return (" + expr + "); }");
      return !!fn(ctx);
    } catch (e) {
      return false;
    }
  }

  static evaluateVarExpression(expr: string, ctx: Context): any {
    const trimmed = expr.trim();
    // if it's a bare identifier or dotted path -> resolvePath
    if (/^[a-zA-Z_][a-zA-Z0-9_.[\]]*$/.test(trimmed)) {
      return this.resolvePath(ctx, trimmed);
    }
    // try evaluating it as JS in context (e.g., "user.age + 1")
    try {
      const fn = new Function(
        "ctx",
        "with (ctx) { return (" + trimmed + "); }"
      );
      return fn(ctx);
    } catch (e) {
      return undefined;
    }
  }

  static extractTemplatePaths(template: string): string[] {
    const regex =
      /\{\{\s*([\w\d._[\]]+)(?:\|[^}]*)?\s*\}\}|\{%\s*for\s+\w+\s+in\s+([\w\d._[\]]+)\s*%\}/g;
    const paths = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = regex.exec(template))) {
      const p = match[1] || match[2];
      if (p) paths.add(p);
    }
    return Array.from(paths);
  }
}
