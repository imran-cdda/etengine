# Tiny Django Template Engine

A compact, Django-like template engine for TypeScript/JavaScript that works in any environment - Edge Functions, Cloudflare Workers, Deno, Node.js, and browsers. Zero dependencies, fully type-safe.

## Features

- 🚀 **Edge-Compatible** - No Node.js APIs, works everywhere
- 📦 **Zero Dependencies** - Lightweight and self-contained
- 🎯 **Django-Inspired Syntax** - Familiar `{{ }}` and `{% %}` tags
- 🔒 **Auto-Escaping** - XSS protection by default
- 🎨 **Extensible** - Class-based architecture for easy customization
- 📘 **TypeScript First** - Fully typed with excellent IDE support
- ⚡ **Fast** - Pre-compiled templates for optimal performance

## Installation

```bash
npm install tiny-django
# or
yarn add tiny-django
# or
pnpm add tiny-django
```

## Quick Start

```typescript
import { render } from "tiny-django";

const html = render("Hello, {{ name | upper }}!", { name: "world" });
console.log(html); // "Hello, WORLD!"
```

## Basic Usage

### Variables

```typescript
render("{{ user.name }}", { user: { name: "Alice" } });
// Output: "Alice"

render("{{ items[0].title }}", { items: [{ title: "First" }] });
// Output: "First"
```

### Filters

Apply filters using the pipe `|` syntax:

```typescript
render("{{ text | upper | truncate:10 }}", { text: "hello world" });
// Output: "HELLO WORL…"

render("{{ price | formatUSD }}", { price: 1234.56 });
// Output: "$1,234.56"

render('{{ date | formatDate:"en-GB" }}', { date: "2025-10-22" });
// Output: "22 Oct 2025"
```

#### Built-in Filters

- **`upper`** - Convert to uppercase
- **`lower`** - Convert to lowercase
- **`truncate:length`** - Truncate text with ellipsis
- **`formatDate:locale`** - Format dates (default: "en-US")
- **`formatUSD`** - Format as US dollar currency

### Loops

```typescript
const template = `
<ul>
{% for item in items %}
  <li>{{ item.name }}: {{ item.price | formatUSD }}</li>
{% endfor %}
</ul>
`;

render(template, {
  items: [
    { name: "Coffee", price: 4.5 },
    { name: "Tea", price: 3.0 },
  ],
});
```

### Conditionals

```typescript
const template = `
{% if user.age >= 18 %}
  <p>Welcome, {{ user.name }}!</p>
{% elif user.age >= 13 %}
  <p>Teen account for {{ user.name }}</p>
{% else %}
  <p>Parental consent required</p>
{% endif %}
`;

render(template, { user: { name: "Bob", age: 16 } });
```

### Expressions

You can use JavaScript expressions in variables and conditions:

```typescript
render("{{ price * quantity }}", { price: 10, quantity: 3 });
// Output: "30"

render("{% if items.length > 0 %}Has items{% endif %}", { items: [1, 2] });
// Output: "Has items"
```

## Advanced Usage

### Compile Once, Render Many

For better performance, compile templates once and reuse them:

```typescript
import { compile } from "tiny-django";

const template = compile("Hello, {{ name }}!");

console.log(template({ name: "Alice" })); // "Hello, Alice!"
console.log(template({ name: "Bob" })); // "Hello, Bob!"
```

### Using the Template Engine Class

```typescript
import { TemplateEngine } from "tiny-django";

const engine = new TemplateEngine({
  autoEscape: true,
  filters: {
    shout: (text) => text.toUpperCase() + "!!!",
  },
});

const html = engine.render("{{ message | shout }}", { message: "hello" });
// Output: "HELLO!!!"
```

### Custom Filters

```typescript
const engine = new TemplateEngine();

// Add a custom filter
engine.addFilter("reverse", (text) => {
  return String(text).split("").reverse().join("");
});

engine.render("{{ text | reverse }}", { text: "hello" });
// Output: "olleh"

// Filters with arguments
engine.addFilter("repeat", (text, times = 2) => {
  return String(text).repeat(Number(times));
});

engine.render("{{ text | repeat:3 }}", { text: "Ha" });
// Output: "HaHaHa"
```

### Disable Auto-Escaping

By default, HTML is escaped for security. You can disable this:

```typescript
import { TemplateEngine } from "tiny-django";

const engine = new TemplateEngine({ autoEscape: false });

engine.render("{{ html }}", { html: "<strong>Bold</strong>" });
// Output: "<strong>Bold</strong>"
```

## Extending the Engine

The class-based architecture makes it easy to extend functionality:

### Custom Parser

```typescript
import { TemplateParser, TemplateEngine } from "tiny-django";

class CustomParser extends TemplateParser {
  protected parseTag(tagInner: string, stack: any[]) {
    if (tagInner.startsWith("comment")) {
      // Handle custom {% comment %} tag
      return;
    }
    super.parseTag(tagInner, stack);
  }
}

class CustomEngine extends TemplateEngine {
  constructor(options = {}) {
    super(options);
    this.parser = new CustomParser();
  }
}
```

### Custom Renderer

```typescript
import { TemplateRenderer, Node, Context } from "tiny-django";

class CustomRenderer extends TemplateRenderer {
  protected renderNode(node: Node, ctx: Context): string {
    if (node.type === "custom") {
      // Handle custom node type
      return "<!-- custom -->";
    }
    return super.renderNode(node, ctx);
  }
}
```

### Custom Template Engine

```typescript
import { TemplateEngine, EngineOptions } from "tiny-django";

class MyTemplateEngine extends TemplateEngine {
  constructor(options: EngineOptions = {}) {
    super(options);

    // Add custom filters
    this.addFilter("capitalize", (text) => {
      return String(text).charAt(0).toUpperCase() + String(text).slice(1);
    });

    // Override auto-escape for specific patterns
    this.autoEscape = true;
  }

  render(template: string, context: Record<string, any> = {}): string {
    // Add default context variables
    const extendedContext = {
      ...context,
      _now: new Date(),
      _version: "1.0.0",
    };

    return super.render(template, extendedContext);
  }
}

const engine = new MyTemplateEngine();
engine.render("{{ text | capitalize }}", { text: "hello" });
// Output: "Hello"
```

## Utility Functions

### Extract Template Variables

Analyze templates to find all variable references:

```typescript
import { extractTemplatePaths } from "tiny-django";

const paths = extractTemplatePaths(`
  {{ user.name }}
  {% for item in items %}
    {{ item.price }}
  {% endfor %}
`);

console.log(paths); // ["user.name", "items", "item.price"]
```

## API Reference

### Functions

#### `render(template, context?, options?)`

Render a template string with context data.

```typescript
render(template: string, context?: Context, options?: EngineOptions): string
```

#### `compile(template, options?)`

Compile a template for reuse.

```typescript
compile(template: string, options?: EngineOptions): (context?: Context) => string
```

### Classes

#### `TemplateEngine`

Main template engine class.

**Constructor:**

```typescript
new TemplateEngine(options?: EngineOptions)
```

**Methods:**

- `compile(template: string)` - Compile a template
- `render(template: string, context?: Context)` - Render a template
- `addFilter(name: string, fn: FilterFn)` - Add a custom filter
- `removeFilter(name: string)` - Remove a filter
- `getFilters()` - Get all registered filters

#### `DefaultFilters`

Static class containing built-in filters.

**Methods:**

- `upper(value)` - Uppercase filter
- `lower(value)` - Lowercase filter
- `truncate(value, length?)` - Truncate filter
- `formatDate(value, locale?)` - Date formatting filter
- `formatUSD(value)` - USD currency filter
- `getAll()` - Get all default filters

#### `TemplateUtils`

Static utility methods for template operations.

**Methods:**

- `escapeHtml(text)` - Escape HTML entities
- `resolvePath(context, path)` - Resolve dotted paths
- `evalCondition(expr, context)` - Evaluate conditional expressions
- `evaluateVarExpression(expr, context)` - Evaluate variable expressions
- `extractTemplatePaths(template)` - Extract variable paths from template

## Types

```typescript
type Context = Record<string, any>;
type FilterFn = (value: any, ...args: any[]) => any;

interface EngineOptions {
  autoEscape?: boolean;
  filters?: Record<string, FilterFn>;
}

type Node =
  | { type: "text"; value: string }
  | {
      type: "var";
      expr: string;
      filters: Array<{ name: string; args: string[] }>;
      raw?: boolean;
    }
  | { type: "for"; itemName: string; listExpr: string; body: Node[] }
  | { type: "if"; branches: Array<{ cond?: string; body: Node[] }> };
```

## Security

### XSS Protection

Auto-escaping is **enabled by default** to prevent XSS attacks:

```typescript
render("{{ userInput }}", { userInput: '<script>alert("XSS")</script>' });
// Output: "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;"
```

Always keep auto-escaping enabled unless you have a specific reason to disable it and you trust the input source.

### Safe Expression Evaluation

The engine uses JavaScript's `Function` constructor with `with` statements for expression evaluation. While this allows flexible templating, be cautious with user-controlled template strings in production environments.

**Best practices:**

- Never allow users to provide template strings directly
- Only allow users to provide context data
- Keep templates under your control in your codebase

## Performance Tips

1. **Compile templates once** - Use `compile()` for templates you'll render multiple times
2. **Keep templates simple** - Complex JavaScript expressions in templates can slow rendering
3. **Use filters for formatting** - Filters are optimized and reusable
4. **Minimize nested loops** - Deep nesting can impact performance

## Browser Support

Works in all modern browsers and environments:

- ✅ Chrome, Firefox, Safari, Edge (modern versions)
- ✅ Node.js 14+
- ✅ Deno
- ✅ Cloudflare Workers
- ✅ Vercel Edge Functions
- ✅ Netlify Edge Functions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Credits

Inspired by Django's template engine, reimagined for modern JavaScript environments.

---

**Made with ❤️ for developers who need simple, fast templating**
