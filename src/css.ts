import valueParser, { type FunctionNode, type Node } from 'postcss-value-parser'

export type { FunctionNode, Node }

/** Top-level nodes of a CSS value, without whitespace or comments. */
export function valueNodes(value: string): Node[] {
  return valueParser(value).nodes.filter((node) => node.type !== 'space' && node.type !== 'comment')
}

export function stringify(nodes: Node | Node[]): string {
  return valueParser.stringify(nodes).trim()
}

/**
 * Top-level parts separated by whitespace: `1px solid rgb(0 0 0 / 0.5)` is three parts.
 * Undefined when the value also has top-level `,` or `/`, which a whitespace list cannot carry.
 */
export function spaceList(value: string): string[] | undefined {
  const nodes = valueNodes(value)
  if (nodes.some((node) => node.type === 'div')) return undefined
  return nodes.map((node) => stringify(node))
}

/** Top-level parts separated by `,`, each as written: `Inter, "Helvetica Neue", sans-serif`. */
export function commaList(value: string): string[] {
  const groups: Node[][] = [[]]
  for (const node of valueParser(value).nodes) {
    if (node.type === 'div' && node.value === ',') groups.push([])
    else groups[groups.length - 1]?.push(node)
  }
  return groups.map((group) => stringify(group))
}

/** The value as one function call, or undefined: `blur(calc(4px * 2))` is `blur`. */
export function functionCall(value: string): FunctionNode | undefined {
  const nodes = valueNodes(value)
  const [node] = nodes
  return nodes.length === 1 && node?.type === 'function' && node.value !== '' ? node : undefined
}

/** The arguments of a call as written, with nested functions intact. */
export function functionArguments(node: FunctionNode): string {
  return stringify(node.nodes)
}

/** Every top-level node is a function call, as in `filter` and `transform` lists. */
export function functionList(value: string): FunctionNode[] | undefined {
  const nodes = valueNodes(value)
  if (nodes.length === 0) return undefined
  const calls = nodes.filter(
    (node): node is FunctionNode => node.type === 'function' && node.value !== ''
  )
  return calls.length === nodes.length ? calls : undefined
}

/** `var(--brand)` is `--brand`; a fallback or anything around the call is not a bare reference. */
export function variableReference(value: string): string | undefined {
  const call = functionCall(value)
  if (call?.value.toLowerCase() !== 'var') return undefined
  const args = call.nodes.filter((node) => node.type !== 'space' && node.type !== 'comment')
  const [name] = args
  return args.length === 1 && name?.type === 'word' && name.value.startsWith('--')
    ? name.value
    : undefined
}

export type Dimension = { number: number; unit: string }

/** A number with its unit, lowercased: `-1.5rem` is `{ number: -1.5, unit: 'rem' }`. */
export function dimension(value: string): Dimension | undefined {
  const nodes = valueNodes(value)
  const [node] = nodes
  if (nodes.length !== 1 || node?.type !== 'word') return undefined
  const parsed = valueParser.unit(node.value)
  if (!parsed) return undefined
  const number = Number(parsed.number)
  return Number.isFinite(number) ? { number, unit: parsed.unit.toLowerCase() } : undefined
}

/** A number, with or without a unit, starts this part: `2px`, `.5s`, `0`. */
export function isDimension(value: string): boolean {
  return dimension(value) !== undefined
}

/**
 * Split `a: b; c: d` into declarations. A `;` ends one only at the top level, so semicolons in
 * strings (`content: ";"`) and functions (`url(data:image/png;base64,…)`) stay in their value.
 */
export function declarationList(cssText: string): Array<{ property: string; value: string }> {
  const boundaries: number[] = []
  for (const node of valueParser(cssText).nodes) {
    if (node.type !== 'word') continue
    for (
      let index = node.value.indexOf(';');
      index !== -1;
      index = node.value.indexOf(';', index + 1)
    ) {
      boundaries.push(node.sourceIndex + index)
    }
  }
  const declarations: Array<{ property: string; value: string }> = []
  let start = 0
  for (const end of [...boundaries, cssText.length]) {
    const part = cssText.slice(start, end)
    start = end + 1
    // A property name cannot contain `:`, so the first one ends it.
    const separator = part.indexOf(':')
    if (separator === -1) continue
    const property = part.slice(0, separator).trim()
    if (property) declarations.push({ property, value: part.slice(separator + 1).trim() })
  }
  return declarations
}

/** A unitless integer: `-2`, `12`; not `1.5`, `2px` or `+`. */
export function integer(value: string): number | undefined {
  const parsed = dimension(value)
  return parsed?.unit === '' && Number.isInteger(parsed.number) ? parsed.number : undefined
}

/**
 * One spelling per value for table lookups: lowercase, single spaces, no space around `,` and
 * `/`. `0 1px 2px rgb(0 0 0 / 0.1)` and `0  1px 2px RGB(0 0 0/0.1)` are the same key.
 */
export function canonical(value: string): string {
  const parsed = valueParser(value.trim())
  parsed.walk((node) => {
    if (node.type === 'space') node.value = ' '
    if (node.type === 'div') {
      node.before = ''
      node.after = ''
    }
    if (node.type === 'function') {
      node.before = ''
      node.after = ''
    }
  })
  return parsed.toString().toLowerCase()
}
