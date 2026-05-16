import type { Declaration, StyleInput, StyleObject, StylePrimitive } from './types'

const unitlessProperties = new Set([
  'animation-iteration-count',
  'aspect-ratio',
  'border-image-outset',
  'border-image-slice',
  'border-image-width',
  'box-flex',
  'box-flex-group',
  'box-ordinal-group',
  'column-count',
  'columns',
  'flex',
  'flex-grow',
  'flex-negative',
  'flex-order',
  'flex-positive',
  'flex-shrink',
  'grid-area',
  'grid-column',
  'grid-column-end',
  'grid-column-start',
  'grid-row',
  'grid-row-end',
  'grid-row-start',
  '-webkit-line-clamp',
  'line-clamp',
  'line-height',
  'opacity',
  'order',
  'orphans',
  'scale',
  'scale-z',
  'stroke-width',
  'tab-size',
  'widows',
  'z-index',
  'zoom'
])

export function normalizeInput(input: StyleInput): Declaration[] {
  if (typeof input === 'string') {
    return parseCssText(input)
  }

  if (isCssStyleDeclaration(input)) {
    return Array.from({ length: input.length }, (_, index) => input.item(index))
      .filter(Boolean)
      .map((property) =>
        createDeclaration(
          property,
          input.getPropertyValue(property),
          input.getPropertyPriority(property) === 'important'
        )
      )
  }

  if (isIterable(input)) {
    return Array.from(input, ([property, value]) => normalizeEntry(property, value)).filter(
      Boolean
    ) as Declaration[]
  }

  return normalizeObject(input)
}

function parseCssText(cssText: string): Declaration[] {
  return cssText
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separator = part.indexOf(':')
      if (separator === -1) return undefined

      const property = part.slice(0, separator).trim()
      const value = part.slice(separator + 1).trim()
      return normalizeEntry(property, value)
    })
    .filter(Boolean) as Declaration[]
}

function normalizeObject(input: StyleObject, variants: string[] = []): Declaration[] {
  return Object.entries(input).flatMap(([property, value]) => {
    if (isNestedStyle(value)) {
      const variant = variantName(property)
      return variant ? normalizeObject(value, [...variants, variant]) : []
    }

    const declaration = normalizeEntry(property, value)
    return declaration ? [{ ...declaration, variants }] : []
  })
}

function variantName(key: string): string | undefined {
  if (key === 'dark') return 'dark'
  if (key.startsWith('&:')) return pseudoVariantName(key.slice(2))
  if (key.startsWith(':')) return pseudoVariantName(key.slice(1))
  if (key.startsWith('@media')) return mediaVariantName(key)
  if (key.startsWith('@supports')) return `supports-[${key.slice(9).trim()}]`
  if (key.startsWith('@container')) return containerVariantName(key)
  return undefined
}

function containerVariantName(query: string): string {
  const normalized = query.replace(/\s+/g, ' ').trim()
  const sizeMatch = normalized.match(/@container\s*\(min-width:\s*(\d+)px\)/)
  if (sizeMatch) {
    const px = Number(sizeMatch[1])
    const named: Record<number, string> = {
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
    return named[px] ?? `@min-[${px}px]`
  }
  return `@container-[${normalized.replace(/^@container\s*/, '')}]`
}

function pseudoVariantName(pseudo: string): string {
  return pseudo
    .replace(/^:/, '')
    .replace(/-child$/, '')
    .replace(/-of-type$/, '-of-type')
}

function mediaVariantName(query: string): string {
  const normalized = query.replace(/\s+/g, ' ').trim()
  if (/min-width:\s*640px/.test(normalized)) return 'sm'
  if (/min-width:\s*768px/.test(normalized)) return 'md'
  if (/min-width:\s*1024px/.test(normalized)) return 'lg'
  if (/min-width:\s*1280px/.test(normalized)) return 'xl'
  if (/min-width:\s*1536px/.test(normalized)) return '2xl'
  if (/prefers-color-scheme:\s*dark/.test(normalized)) return 'dark'
  if (/prefers-color-scheme:\s*light/.test(normalized)) return 'light'
  if (/prefers-reduced-motion:\s*reduce/.test(normalized)) return 'motion-reduce'
  if (/prefers-reduced-motion:\s*no-preference/.test(normalized)) return 'motion-safe'
  if (/prefers-contrast:\s*more/.test(normalized)) return 'contrast-more'
  if (/prefers-contrast:\s*less/.test(normalized)) return 'contrast-less'
  if (/\(hover:\s*hover\)/.test(normalized)) return 'hover'
  if (/\(pointer:\s*fine\)/.test(normalized)) return 'pointer-fine'
  if (/\(pointer:\s*coarse\)/.test(normalized)) return 'pointer-coarse'
  if (/print/.test(normalized)) return 'print'
  if (/\(orientation:\s*portrait\)/.test(normalized)) return 'portrait'
  if (/\(orientation:\s*landscape\)/.test(normalized)) return 'landscape'
  return `media-[${normalized.replace(/^@media\s*/, '')}]`
}

function normalizeEntry(propertyName: string, primitive: StylePrimitive): Declaration | undefined {
  if (primitive === null || primitive === undefined || primitive === '') {
    return undefined
  }

  const property = normalizePropertyName(propertyName)
  const { value, important } = normalizeValue(property, primitive)
  return createDeclaration(property, value, important)
}

function normalizePropertyName(propertyName: string): string {
  if (propertyName.startsWith('--')) return propertyName

  return propertyName
    .replace(/^Webkit/, '-webkit')
    .replace(/^Moz/, '-moz')
    .replace(/^ms/, '-ms')
    .replace(/^O/, '-o')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

function normalizeValue(
  property: string,
  primitive: Exclude<StylePrimitive, null | undefined>
): { value: string; important: boolean } {
  const rawValue =
    typeof primitive === 'number' && primitive !== 0 && !unitlessProperties.has(property)
      ? `${primitive}px`
      : String(primitive).trim()

  if (rawValue.endsWith('!important')) {
    return { value: rawValue.slice(0, -10).trim(), important: true }
  }

  return { value: rawValue, important: false }
}

function createDeclaration(property: string, value: string, important: boolean): Declaration {
  return { property, value, important, variants: [] }
}

function isCssStyleDeclaration(value: StyleInput): value is CSSStyleDeclaration {
  return typeof CSSStyleDeclaration !== 'undefined' && value instanceof CSSStyleDeclaration
}

function isIterable(value: unknown): value is Iterable<[string, StylePrimitive]> {
  return typeof value === 'object' && value !== null && Symbol.iterator in value
}

function isNestedStyle(value: StyleObject[string]): value is StyleObject {
  return typeof value === 'object' && value !== null
}
