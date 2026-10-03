import { dimension, stringify, valueNodes, type FunctionNode, type Node } from './css'
import { escapeArbitraryValue } from './escape'

/** Tailwind v4 breakpoints by their `min-width`, in px at the default 16px root size. */
const breakpoints: Record<number, string> = {
  640: 'sm',
  768: 'md',
  1024: 'lg',
  1280: 'xl',
  1536: '2xl'
}

const containerSizes: Record<number, string> = {
  320: '@xs',
  384: '@sm',
  448: '@md',
  512: '@lg',
  576: '@xl',
  672: '@2xl',
  768: '@3xl',
  896: '@4xl',
  1024: '@5xl',
  1152: '@6xl',
  1280: '@7xl'
}

/** Media features with a Tailwind variant that means exactly the same query. */
const mediaFeatures: Record<string, string> = {
  'prefers-color-scheme:dark': 'dark',
  'prefers-reduced-motion:reduce': 'motion-reduce',
  'prefers-reduced-motion:no-preference': 'motion-safe',
  'prefers-contrast:more': 'contrast-more',
  'prefers-contrast:less': 'contrast-less',
  'pointer:fine': 'pointer-fine',
  'pointer:coarse': 'pointer-coarse',
  'pointer:none': 'pointer-none',
  'any-pointer:fine': 'any-pointer-fine',
  'any-pointer:coarse': 'any-pointer-coarse',
  'any-pointer:none': 'any-pointer-none',
  'orientation:portrait': 'portrait',
  'orientation:landscape': 'landscape',
  'forced-colors:active': 'forced-colors',
  'inverted-colors:inverted': 'inverted-colors',
  'scripting:none': 'noscript'
}

type Feature = { name: string; value: string }

/** `(min-width: 640px)` as a name and a value; anything else, such as range syntax, is not one. */
function feature(node: Node): Feature | undefined {
  if (node.type !== 'function' || node.value !== '') return undefined
  const parts = (node as FunctionNode).nodes.filter(
    (part) => part.type !== 'space' && part.type !== 'comment'
  )
  const [name, colon, ...value] = parts
  if (name?.type !== 'word' || colon?.type !== 'div' || colon.value !== ':' || value.length === 0)
    return undefined
  return { name: name.value.toLowerCase(), value: stringify(value).toLowerCase() }
}

function pixels(value: string): number | undefined {
  const parsed = dimension(value)
  if (parsed?.unit === 'px') return parsed.number
  if (parsed?.unit === 'rem') return parsed.number * 16
  return undefined
}

function mediaFeatureVariant({ name, value }: Feature): string | undefined {
  if (name === 'min-width') {
    const px = pixels(value)
    if (px === undefined) return undefined
    return breakpoints[px] ?? `min-[${escapeArbitraryValue(value)}]`
  }
  return mediaFeatures[`${name}:${value}`]
}

/** `[@media(hover:hover)]`: the exact query, for anything without a named variant. */
function arbitraryAtRule(rule: string, query: string): string {
  const trimmed = query.trim()
  const separator = trimmed.startsWith('(') ? '' : ' '
  return `[@${escapeArbitraryValue(`${rule}${separator}${trimmed}`)}]`
}

/**
 * Tailwind variants for a media query. Features joined by `and` stack (`sm:motion-reduce`);
 * a query any part of which has no exact variant is kept whole as an arbitrary variant, never
 * narrowed to the parts that matched.
 */
export function mediaVariants(query: string): string[] {
  const nodes = valueNodes(query)
  const [first] = nodes
  if (nodes.length === 1 && first?.type === 'word' && first.value.toLowerCase() === 'print')
    return ['print']

  const variants: string[] = []
  for (const [index, node] of nodes.entries()) {
    if (index % 2 === 1) {
      if (node.type === 'word' && node.value.toLowerCase() === 'and') continue
      return [arbitraryAtRule('media', query)]
    }
    const parsed = feature(node)
    const variant = parsed && mediaFeatureVariant(parsed)
    if (!variant) return [arbitraryAtRule('media', query)]
    variants.push(variant)
  }
  return variants.length > 0 && nodes.length % 2 === 1
    ? variants
    : [arbitraryAtRule('media', query)]
}

/** `@container (min-width: 512px)` is `@lg`; a named container adds `/name`. */
export function containerVariants(query: string): string[] {
  const nodes = valueNodes(query)
  const [name, condition] = nodes.length === 2 ? nodes : [undefined, nodes[0]]
  const named = name?.type === 'word' ? `/${name.value}` : ''
  const parsed = nodes.length <= 2 && condition ? feature(condition) : undefined
  const px = parsed?.name === 'min-width' ? pixels(parsed.value) : undefined
  if (px === undefined || (name && name.type !== 'word') || !parsed)
    return [arbitraryAtRule('container', query)]
  const size = containerSizes[px] ?? `@min-[${escapeArbitraryValue(parsed.value)}]`
  return [`${size}${named}`]
}

export function supportsVariants(query: string): string[] {
  return [arbitraryAtRule('supports', query)]
}
