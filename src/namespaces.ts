/**
 * Tailwind v4 theme variable namespaces: a variable declared in `@theme` under one of these
 * becomes a utility with the same key, so `--color-mint-500` gives `bg-mint-500`.
 * https://tailwindcss.com/docs/theme#theme-variable-namespaces
 */
export const themeNamespaces = [
  'color',
  'font',
  'text',
  'font-weight',
  'tracking',
  'leading',
  'tab-size',
  'breakpoint',
  'container',
  'spacing',
  'radius',
  'shadow',
  'inset-shadow',
  'drop-shadow',
  'blur',
  'perspective',
  'zoom',
  'aspect',
  'ease',
  'animate'
] as const

export type ThemeNamespace = (typeof themeNamespaces)[number]

export type ThemeVariable = {
  namespace: ThemeNamespace
  key: string
}

// Longest first, so `--font-weight-bold` is a font weight and not the font family `weight-bold`.
const byLength = [...themeNamespaces].sort((a, b) => b.length - a.length)

/** Keys Tailwind can name in a utility without escaping. */
const UTILITY_KEY = /^[a-z0-9][\w.-]*$/i

/**
 * The namespace and utility key of a theme variable, with or without its leading `--`.
 * Sub-variables such as `--text-xl--line-height` configure a utility rather than name one.
 */
export function parseThemeVariable(name: string): ThemeVariable | undefined {
  const bare = name.startsWith('--') ? name.slice(2) : name
  for (const namespace of byLength) {
    if (!bare.startsWith(`${namespace}-`)) continue
    const key = bare.slice(namespace.length + 1)
    if (!UTILITY_KEY.test(key) || key.includes('--')) return undefined
    return { namespace, key }
  }
  return undefined
}

/** Properties a namespace's utility sets from a whole `var()` value, and that utility's prefix. */
export const themeUtilities: Record<string, { namespace: ThemeNamespace; prefix: string }> = {
  color: { namespace: 'color', prefix: 'text' },
  'background-color': { namespace: 'color', prefix: 'bg' },
  'border-color': { namespace: 'color', prefix: 'border' },
  'border-top-color': { namespace: 'color', prefix: 'border-t' },
  'border-right-color': { namespace: 'color', prefix: 'border-r' },
  'border-bottom-color': { namespace: 'color', prefix: 'border-b' },
  'border-left-color': { namespace: 'color', prefix: 'border-l' },
  'outline-color': { namespace: 'color', prefix: 'outline' },
  fill: { namespace: 'color', prefix: 'fill' },
  stroke: { namespace: 'color', prefix: 'stroke' },
  'caret-color': { namespace: 'color', prefix: 'caret' },
  'accent-color': { namespace: 'color', prefix: 'accent' },
  'text-decoration-color': { namespace: 'color', prefix: 'decoration' },
  width: { namespace: 'spacing', prefix: 'w' },
  height: { namespace: 'spacing', prefix: 'h' },
  'min-width': { namespace: 'spacing', prefix: 'min-w' },
  'min-height': { namespace: 'spacing', prefix: 'min-h' },
  'max-width': { namespace: 'spacing', prefix: 'max-w' },
  'max-height': { namespace: 'spacing', prefix: 'max-h' },
  padding: { namespace: 'spacing', prefix: 'p' },
  'padding-top': { namespace: 'spacing', prefix: 'pt' },
  'padding-right': { namespace: 'spacing', prefix: 'pr' },
  'padding-bottom': { namespace: 'spacing', prefix: 'pb' },
  'padding-left': { namespace: 'spacing', prefix: 'pl' },
  margin: { namespace: 'spacing', prefix: 'm' },
  'margin-top': { namespace: 'spacing', prefix: 'mt' },
  'margin-right': { namespace: 'spacing', prefix: 'mr' },
  'margin-bottom': { namespace: 'spacing', prefix: 'mb' },
  'margin-left': { namespace: 'spacing', prefix: 'ml' },
  gap: { namespace: 'spacing', prefix: 'gap' },
  'row-gap': { namespace: 'spacing', prefix: 'gap-y' },
  'column-gap': { namespace: 'spacing', prefix: 'gap-x' },
  'font-size': { namespace: 'text', prefix: 'text' },
  'font-family': { namespace: 'font', prefix: 'font' },
  'font-weight': { namespace: 'font-weight', prefix: 'font' },
  'letter-spacing': { namespace: 'tracking', prefix: 'tracking' },
  'line-height': { namespace: 'leading', prefix: 'leading' },
  'border-radius': { namespace: 'radius', prefix: 'rounded' },
  'border-top-left-radius': { namespace: 'radius', prefix: 'rounded-tl' },
  'border-top-right-radius': { namespace: 'radius', prefix: 'rounded-tr' },
  'border-bottom-right-radius': { namespace: 'radius', prefix: 'rounded-br' },
  'border-bottom-left-radius': { namespace: 'radius', prefix: 'rounded-bl' },
  'box-shadow': { namespace: 'shadow', prefix: 'shadow' },
  'aspect-ratio': { namespace: 'aspect', prefix: 'aspect' },
  'transition-timing-function': { namespace: 'ease', prefix: 'ease' },
  animation: { namespace: 'animate', prefix: 'animate' },
  perspective: { namespace: 'perspective', prefix: 'perspective' },
  'tab-size': { namespace: 'tab-size', prefix: 'tab' },
  zoom: { namespace: 'zoom', prefix: 'zoom' }
}
