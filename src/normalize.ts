import { declarationList, valueNodes } from './css'
import type { Declaration, StyleInput, StyleObject, StylePrimitive } from './types'
import { containerVariants, mediaVariants, supportsVariants } from './variants'

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
  return declarationList(cssText).flatMap(({ property, value }) => {
    const declaration = normalizeEntry(property, value)
    return declaration ? [declaration] : []
  })
}

function normalizeObject(input: StyleObject, variants: string[] = []): Declaration[] {
  return Object.entries(input).flatMap(([property, value]) => {
    if (isNestedStyle(value)) {
      const nested = variantNames(property)
      return nested ? normalizeObject(value, [...variants, ...nested]) : []
    }

    const declaration = normalizeEntry(property, value)
    return declaration ? [{ ...declaration, variants }] : []
  })
}

function variantNames(key: string): string[] | undefined {
  if (key === 'dark') return ['dark']
  if (key.startsWith('&:')) return [pseudoVariantName(key.slice(2))]
  if (key.startsWith(':')) return [pseudoVariantName(key.slice(1))]
  if (key.startsWith('@media')) return mediaVariants(key.slice('@media'.length))
  if (key.startsWith('@supports')) return supportsVariants(key.slice('@supports'.length))
  if (key.startsWith('@container')) return containerVariants(key.slice('@container'.length))
  return undefined
}

function pseudoVariantName(pseudo: string): string {
  return pseudo
    .replace(/^:/, '')
    .replace(/-child$/, '')
    .replace(/-of-type$/, '-of-type')
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

  const priority = importantIndex(rawValue)
  if (priority !== undefined) {
    return { value: rawValue.slice(0, priority).trim(), important: true }
  }

  return { value: rawValue, important: false }
}

/** Where a trailing `!important` starts; inside a string or function it is part of the value. */
function importantIndex(value: string): number | undefined {
  const nodes = valueNodes(value)
  const last = nodes.at(-1)
  if (last?.type !== 'word') return undefined
  if (last.value.toLowerCase() === '!important') return last.sourceIndex
  const bang = nodes.at(-2)
  if (last.value.toLowerCase() === 'important' && bang?.type === 'word' && bang.value === '!')
    return bang.sourceIndex
  return undefined
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
