import { DefaultFilters } from "./filters";
import { TemplateParser } from "./parser";
import { TemplateRenderer } from "./render";
import { Context, EngineOptions, FilterFn } from "./types";

export class TemplateEngine {
  protected parser: TemplateParser;
  protected filtersMap: Record<string, FilterFn>;
  protected autoEscape: boolean;

  constructor(options: EngineOptions = {}) {
    this.parser = new TemplateParser();
    this.filtersMap = {
      ...DefaultFilters.getAll(),
      ...(options.filters || {}),
    };
    this.autoEscape = options.autoEscape !== false;
  }

  compile(template: string): (context?: Context) => string {
    const ast = this.parser.parse(template);
    const renderer = new TemplateRenderer(this.filtersMap, this.autoEscape);

    return (context: Context = {}) => {
      return renderer.render(ast, context);
    };
  }

  render(template: string, context: Context = {}): string {
    return this.compile(template)(context);
  }

  addFilter(name: string, fn: FilterFn): void {
    this.filtersMap[name] = fn;
  }

  removeFilter(name: string): void {
    delete this.filtersMap[name];
  }

  getFilters(): Record<string, FilterFn> {
    return { ...this.filtersMap };
  }
}
