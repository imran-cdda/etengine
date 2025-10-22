import { TemplateEngine } from "./engine";
import { Context, EngineOptions } from "./types";
import { TemplateUtils } from "./utils";

export function compile(template: string, options: EngineOptions = {}) {
  const engine = new TemplateEngine(options);
  return engine.compile(template);
}

export function render(
  template: string,
  context: Context = {},
  options?: EngineOptions
) {
  const engine = new TemplateEngine(options);
  return engine.render(template, context);
}

export const extractTemplatePaths = TemplateUtils.extractTemplatePaths;
