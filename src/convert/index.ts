import { lookupHexToken } from '../colors'
import { arbitraryProperty, arbitraryValue } from '../escape'
import type { ConvertedDeclaration, Declaration, ResolvedOptions } from '../types'
import { arbitraryPrefixes, exactUtilities, spacingProperties, valueAliases } from './data'
import { spacingToken } from './primitives'

export function convertDeclaration(
  declaration: Declaration,
  options: ResolvedOptions
): ConvertedDeclaration | ConvertedDeclaration[] | undefined {
  const exact = exactUtilities[declaration.property]?.[declaration.value]
  if (exact) return converted(declaration, exact, 'exact')

  const alias = valueAliases[declaration.property]?.[declaration.value.toLowerCase()]
  if (alias) return converted(declaration, alias, 'exact')

  if (
    (declaration.property === '-webkit-line-clamp' || declaration.property === 'line-clamp') &&
    /^\d+$/.test(declaration.value)
  ) {
    return converted(declaration, `line-clamp-${declaration.value}`, 'exact')
  }

  if (
    (declaration.property === '-webkit-line-clamp' || declaration.property === 'line-clamp') &&
    declaration.value === 'none'
  ) {
    return converted(declaration, 'line-clamp-none', 'exact')
  }

  const contentClass = convertContent(declaration)
  if (contentClass) return converted(declaration, contentClass, 'exact')

  if (declaration.property === 'z-index' && /^-?\d+$/.test(declaration.value)) {
    const value = declaration.value.startsWith('-')
      ? `-z-${declaration.value.slice(1)}`
      : `z-${declaration.value}`
    return converted(declaration, value, 'exact')
  }

  const numericClass = convertNumericUtility(declaration)
  if (numericClass) return converted(declaration, numericClass, 'exact')

  const borderWidthClass = convertBorderWidth(declaration)
  if (borderWidthClass) return converted(declaration, borderWidthClass, 'exact')

  const opacityClass = convertOpacity(declaration)
  if (opacityClass) return converted(declaration, opacityClass, 'exact')

  const spacingClass = convertSpacingLike(declaration, options)
  if (spacingClass) return converted(declaration, spacingClass, 'exact')

  const colorClass = convertColor(declaration, options)
  if (colorClass) return converted(declaration, colorClass, 'exact')

  const transformResult = convertTransform(declaration, options)
  if (transformResult) {
    if (Array.isArray(transformResult)) {
      return transformResult.map((cls) => converted(declaration, cls, 'exact'))
    }
    return converted(declaration, transformResult, 'exact')
  }

  const snapResult = convertSnapType(declaration)
  if (snapResult) {
    if (Array.isArray(snapResult)) {
      return snapResult.map((cls) => converted(declaration, cls, 'exact'))
    }
    return converted(declaration, snapResult, 'exact')
  }

  const filterResult = convertFilter(declaration)
  if (filterResult) {
    if (Array.isArray(filterResult)) {
      return filterResult.map((cls) => converted(declaration, cls, 'exact'))
    }
    return converted(declaration, filterResult, 'exact')
  }

  const shadowClass = convertShadow(declaration)
  if (shadowClass) return converted(declaration, shadowClass, 'exact')

  const gradientResult = convertGradient(declaration, options)
  if (gradientResult) {
    if (Array.isArray(gradientResult)) {
      return gradientResult.map((cls) => converted(declaration, cls, 'exact'))
    }
    return converted(declaration, gradientResult, 'exact')
  }

  const varRef = convertVarReference(declaration)
  if (varRef) return converted(declaration, varRef, 'exact')

  const prefix = arbitraryPrefixes[declaration.property]
  if (prefix && options.allowArbitraryValues) {
    return converted(declaration, arbitraryValue(prefix, declaration.value), 'arbitrary')
  }

  if (options.allowArbitraryProperties) {
    return converted(
      declaration,
      arbitraryProperty(declaration.property, declaration.value),
      'arbitrary'
    )
  }

  return undefined
}

function convertSpacingLike(
  declaration: Declaration,
  options: ResolvedOptions
): string | undefined {
  if (!spacingProperties.has(declaration.property)) return undefined

  const prefix = arbitraryPrefixes[declaration.property]
  if (!prefix) return undefined

  const token = spacingToken(declaration.value, options)
  if (!token) return undefined

  return token.startsWith('-') ? `-${prefix}-${token.slice(1)}` : `${prefix}-${token}`
}

function convertNumericUtility(declaration: Declaration): string | undefined {
  if (declaration.property === 'tab-size' && /^\d+$/.test(declaration.value)) {
    return `tab-${declaration.value}`
  }

  if (declaration.property === 'zoom') {
    const value = Number(declaration.value)
    if (Number.isFinite(value) && value > 0) return `zoom-${value * 100}`
  }

  if (declaration.property === 'order' && /^-?\d+$/.test(declaration.value)) {
    return declaration.value.startsWith('-')
      ? `-order-${declaration.value.slice(1)}`
      : `order-${declaration.value}`
  }

  if (
    (declaration.property === 'column-count' || declaration.property === 'columns') &&
    /^\d+$/.test(declaration.value)
  ) {
    return `columns-${declaration.value}`
  }

  const aspectRatio = convertAspectRatio(declaration)
  if (aspectRatio) return aspectRatio

  const gridLine = convertGridLine(declaration)
  if (gridLine) return gridLine

  const gridPlacement = convertGridPlacement(declaration)
  if (gridPlacement) return gridPlacement

  const gridTemplate = convertGridTemplate(declaration)
  if (gridTemplate) return gridTemplate

  if (declaration.property === 'flex-grow' && /^[01]$/.test(declaration.value)) {
    return declaration.value === '1' ? 'grow' : 'grow-0'
  }

  if (declaration.property === 'flex-shrink' && /^[01]$/.test(declaration.value)) {
    return declaration.value === '1' ? 'shrink' : 'shrink-0'
  }

  if (declaration.property === 'stroke-width' && /^\d+$/.test(declaration.value)) {
    return `stroke-${declaration.value}`
  }

  if (declaration.property === 'transition-duration') {
    const milliseconds = millisecondsValue(declaration.value)
    if (milliseconds !== undefined) return `duration-${milliseconds}`
  }

  if (declaration.property === 'transition-delay') {
    const milliseconds = millisecondsValue(declaration.value)
    if (milliseconds !== undefined) return `delay-${milliseconds}`
  }

  return undefined
}

function convertAspectRatio(declaration: Declaration): string | undefined {
  if (declaration.property !== 'aspect-ratio') return undefined

  const ratio = declaration.value.match(/^(\d+)\s*\/\s*(\d+)$/)
  if (!ratio) return undefined

  const [, width, height] = ratio
  if (width === height) return 'aspect-square'
  if (width === '16' && height === '9') return 'aspect-video'
  return `aspect-${width}/${height}`
}

function convertSnapType(declaration: Declaration): string | string[] | undefined {
  if (declaration.property !== 'scroll-snap-type') return undefined
  if (declaration.value === 'none') return 'snap-none'

  const parts = declaration.value.trim().toLowerCase().split(/\s+/)
  if (parts.length !== 2) return undefined

  const axes: Record<string, string> = {
    x: 'snap-x',
    y: 'snap-y',
    both: 'snap-both',
    block: 'snap-y',
    inline: 'snap-x'
  }
  const strictness: Record<string, string> = {
    mandatory: 'snap-mandatory',
    proximity: 'snap-proximity'
  }

  const axisClass = axes[parts[0] ?? '']
  const strictClass = strictness[parts[1] ?? '']
  if (!axisClass || !strictClass) return undefined

  return [axisClass, strictClass]
}

function convertContent(declaration: Declaration): string | undefined {
  if (declaration.property !== 'content') return undefined
  if (declaration.value === 'none') return 'content-none'

  const quoted = declaration.value.match(/^["'](.+)["']$/)?.[1]
  if (quoted) return `content-['${quoted.replace(/'/g, "\\'")}']`

  return undefined
}

function convertGridLine(declaration: Declaration): string | undefined {
  const prefixes: Record<string, string> = {
    'grid-column-start': 'col-start',
    'grid-column-end': 'col-end',
    'grid-row-start': 'row-start',
    'grid-row-end': 'row-end'
  }
  const prefix = prefixes[declaration.property]
  if (!prefix || !/^-?\d+$/.test(declaration.value)) return undefined

  return declaration.value.startsWith('-')
    ? `-${prefix}-${declaration.value.slice(1)}`
    : `${prefix}-${declaration.value}`
}

function convertGridPlacement(declaration: Declaration): string | undefined {
  if (declaration.value === '1 / -1') {
    if (declaration.property === 'grid-column') return 'col-span-full'
    if (declaration.property === 'grid-row') return 'row-span-full'
  }

  const span = declaration.value.match(/^span (\d+) \/ span \d+$/)?.[1]
  if (!span) return undefined

  if (declaration.property === 'grid-column') return `col-span-${span}`
  if (declaration.property === 'grid-row') return `row-span-${span}`
  return undefined
}

function convertGridTemplate(declaration: Declaration): string | undefined {
  const count = declaration.value.match(/^repeat\((\d+), minmax\(0, 1fr\)\)$/)?.[1]
  if (!count) return undefined

  if (declaration.property === 'grid-template-columns') return `grid-cols-${count}`
  if (declaration.property === 'grid-template-rows') return `grid-rows-${count}`
  return undefined
}

function millisecondsValue(value: string): number | undefined {
  const normalized = value.trim().toLowerCase()
  if (normalized.endsWith('ms')) {
    const parsed = Number(normalized.slice(0, -2))
    return Number.isInteger(parsed) ? parsed : undefined
  }

  if (normalized.endsWith('s')) {
    const parsed = Number(normalized.slice(0, -1))
    const milliseconds = parsed * 1000
    return Number.isInteger(milliseconds) ? milliseconds : undefined
  }

  return undefined
}

function convertBorderWidth(declaration: Declaration): string | undefined {
  const prefixes: Record<string, string> = {
    'border-width': 'border',
    'border-top-width': 'border-t',
    'border-right-width': 'border-r',
    'border-bottom-width': 'border-b',
    'border-left-width': 'border-l',
    'border-inline-start-width': 'border-s',
    'border-inline-end-width': 'border-e',
    'border-inline-width': 'border-x',
    'border-block-width': 'border-y'
  }
  const prefix = prefixes[declaration.property]
  if (!prefix) return undefined

  const normalized = declaration.value.trim().toLowerCase()
  if (normalized === '1px') return prefix
  if (normalized === '0' || normalized === '0px') return `${prefix}-0`
  const width = normalized.match(/^(2|4|8)px$/)?.[1]
  return width ? `${prefix}-${width}` : undefined
}

function convertOpacity(declaration: Declaration): string | undefined {
  if (declaration.property !== 'opacity') return undefined
  const value = Number(declaration.value)
  if (!Number.isFinite(value) || value < 0 || value > 1) return undefined
  const percent = value * 100
  if (!Number.isInteger(percent)) return undefined
  return `opacity-${percent}`
}

const colorAliases: Record<string, string> = {
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  currentcolor: 'currentColor'
}

const colorKeywords: Record<string, string> = {
  inherit: 'inherit',
  transparent: 'transparent',
  currentcolor: 'current'
}

function convertColor(declaration: Declaration, options: ResolvedOptions): string | undefined {
  const colorPrefixes: Record<string, string> = {
    color: 'text',
    fill: 'fill',
    stroke: 'stroke',
    'background-color': 'bg',
    'border-color': 'border',
    'border-top-color': 'border-t',
    'border-right-color': 'border-r',
    'border-bottom-color': 'border-b',
    'border-left-color': 'border-l',
    'border-inline-start-color': 'border-s',
    'border-inline-end-color': 'border-e',
    'border-inline-color': 'border-x',
    'border-block-color': 'border-y',
    'outline-color': 'outline',
    'text-decoration-color': 'decoration',
    'caret-color': 'caret',
    'accent-color': 'accent'
  }
  const prefix = colorPrefixes[declaration.property]
  if (!prefix || options.colorMatch === 'none') return undefined

  const normalized = normalizeColor(declaration.value)

  const keyword = colorKeywords[normalized]
  if (keyword) return `${prefix}-${keyword}`

  const hexToken = lookupHexToken(normalized)
  if (hexToken) return `${prefix}-${hexToken}`

  const token = Object.entries(options.theme.colors).find(
    ([, color]) => normalizeColor(color) === normalized
  )?.[0]
  if (token) return `${prefix}-${token}`

  const withOpacity = parseColorWithOpacity(normalized, options)
  if (withOpacity) return `${prefix}-${withOpacity}`

  return undefined
}

function parseColorWithOpacity(value: string, options: ResolvedOptions): string | undefined {
  const oklchMatch = value.match(/^oklch\(([^/]+)\/\s*([\d.]+)%?\s*\)$/)
  if (oklchMatch) {
    const [, colorPart, alpha] = oklchMatch
    if (!colorPart || !alpha) return undefined
    const baseColor = `oklch(${colorPart.trim()})`
    const baseNormalized = normalizeColor(baseColor)
    const token = Object.entries(options.theme.colors).find(
      ([, c]) => normalizeColor(c) === baseNormalized
    )?.[0]
    if (!token) return undefined
    const opacity = Math.round(Number(alpha))
    return `${token}/${opacity}`
  }

  const rgbaMatch = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/)
  if (rgbaMatch) {
    const [, r, g, b, a] = rgbaMatch
    if (!r || !g || !b || !a) return undefined
    const baseHex = `#${Number(r).toString(16).padStart(2, '0')}${Number(g).toString(16).padStart(2, '0')}${Number(b).toString(16).padStart(2, '0')}`
    const baseNormalized = normalizeColor(baseHex)
    const token = Object.entries(options.theme.colors).find(
      ([, c]) => normalizeColor(c) === baseNormalized
    )?.[0]
    if (!token) return undefined
    const opacity = Math.round(Number(a) * 100)
    return `${token}/${opacity}`
  }

  return undefined
}

function normalizeColor(value: string): string {
  const normalized = value.trim().toLowerCase()
  const alias = colorAliases[normalized]
  if (alias) return alias.toLowerCase()

  const rgbToHex = rgbFunctionToHex(normalized)
  if (rgbToHex) return rgbToHex

  return normalized
}

function rgbFunctionToHex(value: string): string | undefined {
  const match = value.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/)
  if (!match) {
    const modern = value.match(/^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\)$/)
    if (!modern) return undefined
    const [, r, g, b] = modern
    if (!r || !g || !b) return undefined
    return `#${toHex(Number(r))}${toHex(Number(g))}${toHex(Number(b))}`
  }
  const [, r, g, b] = match
  if (!r || !g || !b) return undefined
  return `#${toHex(Number(r))}${toHex(Number(g))}${toHex(Number(b))}`
}

function toHex(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n)))
    .toString(16)
    .padStart(2, '0')
}

function convertFilter(declaration: Declaration): string | string[] | undefined {
  if (declaration.property !== 'filter' && declaration.property !== 'backdrop-filter')
    return undefined

  const prefix = declaration.property === 'backdrop-filter' ? 'backdrop-' : ''
  const value = declaration.value.trim().toLowerCase()

  const blur = value.match(/^blur\(([^)]+)\)$/)?.[1]
  if (blur === '8px') return `${prefix}blur`
  if (blur) return `${prefix}blur-[${blur}]`

  const brightness = value.match(/^brightness\(([^)]+)\)$/)?.[1]
  if (brightness) return percentageFilterClass(`${prefix}brightness`, brightness)

  const contrast = value.match(/^contrast\(([^)]+)\)$/)?.[1]
  if (contrast) return percentageFilterClass(`${prefix}contrast`, contrast)

  const grayscale = value.match(/^grayscale\(([^)]+)\)$/)?.[1]
  if (grayscale) return percentageFilterClass(`${prefix}grayscale`, grayscale)

  const invert = value.match(/^invert\(([^)]+)\)$/)?.[1]
  if (invert) return percentageFilterClass(`${prefix}invert`, invert)

  const saturate = value.match(/^saturate\(([^)]+)\)$/)?.[1]
  if (saturate) return percentageFilterClass(`${prefix}saturate`, saturate)

  const sepia = value.match(/^sepia\(([^)]+)\)$/)?.[1]
  if (sepia) return percentageFilterClass(`${prefix}sepia`, sepia)

  const hueRotate = value.match(/^hue-rotate\((-?\d+(?:\.\d+)?deg)\)$/)?.[1]
  if (hueRotate) {
    const rotate = rotateClass(hueRotate)
    return rotate
      ?.replace('rotate-', `${prefix}hue-rotate-`)
      .replace('-rotate-', `-${prefix}hue-rotate-`)
  }

  const opacity = value.match(/^opacity\(([^)]+)\)$/)?.[1]
  if (opacity && prefix === 'backdrop-') return percentageFilterClass('backdrop-opacity', opacity)

  const dropShadow = value.match(/^drop-shadow\((.+)\)$/)?.[1]
  if (dropShadow && prefix === '') return dropShadowClass(dropShadow)

  const multi = parseMultiFilter(value, prefix)
  if (multi && multi.length > 0) return multi.length === 1 ? multi[0] : multi

  return undefined
}

function parseMultiFilter(value: string, prefix: string): string[] | undefined {
  const functions = value.match(/[a-z-]+\([^)]+\)/gi)
  if (!functions || functions.length < 2) return undefined

  const classes: string[] = []
  for (const fn of functions) {
    const cls = parseSingleFilter(fn.toLowerCase(), prefix)
    if (cls) classes.push(cls)
  }
  return classes.length >= 2 ? classes : undefined
}

function parseSingleFilter(fn: string, prefix: string): string | undefined {
  const blur = fn.match(/^blur\(([^)]+)\)$/)?.[1]
  if (blur === '8px') return `${prefix}blur`
  if (blur) return `${prefix}blur-[${blur}]`

  const brightness = fn.match(/^brightness\(([^)]+)\)$/)?.[1]
  if (brightness) return percentageFilterClass(`${prefix}brightness`, brightness)

  const contrast = fn.match(/^contrast\(([^)]+)\)$/)?.[1]
  if (contrast) return percentageFilterClass(`${prefix}contrast`, contrast)

  const grayscale = fn.match(/^grayscale\(([^)]+)\)$/)?.[1]
  if (grayscale) return percentageFilterClass(`${prefix}grayscale`, grayscale)

  const saturate = fn.match(/^saturate\(([^)]+)\)$/)?.[1]
  if (saturate) return percentageFilterClass(`${prefix}saturate`, saturate)

  const sepia = fn.match(/^sepia\(([^)]+)\)$/)?.[1]
  if (sepia) return percentageFilterClass(`${prefix}sepia`, sepia)

  const invert = fn.match(/^invert\(([^)]+)\)$/)?.[1]
  if (invert) return percentageFilterClass(`${prefix}invert`, invert)

  const hueRotate = fn.match(/^hue-rotate\((-?\d+(?:\.\d+)?deg)\)$/)?.[1]
  if (hueRotate) {
    const rotate = rotateClass(hueRotate)
    return rotate
      ?.replace('rotate-', `${prefix}hue-rotate-`)
      .replace('-rotate-', `-${prefix}hue-rotate-`)
  }

  return undefined
}

const dropShadowValues: Record<string, string> = {
  '0 1px 1px rgb(0 0 0 / 0.05)': 'drop-shadow-xs',
  '0 1px 2px rgb(0 0 0 / 0.15)': 'drop-shadow-sm',
  '0 3px 3px rgb(0 0 0 / 0.12)': 'drop-shadow-md',
  '0 4px 4px rgb(0 0 0 / 0.15)': 'drop-shadow-lg',
  '0 9px 7px rgb(0 0 0 / 0.1)': 'drop-shadow-xl',
  '0 25px 25px rgb(0 0 0 / 0.15)': 'drop-shadow-2xl'
}

function dropShadowClass(raw: string): string | undefined {
  return dropShadowValues[raw.trim().replace(/\s+/g, ' ')]
}

function percentageFilterClass(prefix: string, raw: string): string | undefined {
  const normalized = raw.trim()
  const value = normalized.endsWith('%')
    ? Number(normalized.slice(0, -1))
    : Number(normalized) * 100
  if (!Number.isFinite(value)) return undefined
  if (!Number.isInteger(value)) return `${prefix}-[${normalized}]`
  if (
    value === 100 &&
    (prefix.endsWith('grayscale') || prefix.endsWith('invert') || prefix.endsWith('sepia'))
  )
    return prefix
  return `${prefix}-${value}`
}

function convertTransform(
  declaration: Declaration,
  options: ResolvedOptions
): string | string[] | undefined {
  if (declaration.property === 'rotate') return rotateClass(declaration.value)
  if (declaration.property === 'scale') return scaleClass(declaration.value)
  if (declaration.property === 'scale-x') return scaleClass(declaration.value, 'scale-x')
  if (declaration.property === 'scale-y') return scaleClass(declaration.value, 'scale-y')
  if (declaration.property === 'scale-z') return scaleClass(declaration.value, 'scale-z')
  if (declaration.property === 'skew') return angleClass('skew', declaration.value)
  if (declaration.property === 'skew-x') return angleClass('skew-x', declaration.value)
  if (declaration.property === 'skew-y') return angleClass('skew-y', declaration.value)
  if (declaration.property === 'translate') return translateClass(declaration.value, options)
  if (declaration.property === 'translate-x')
    return translateAxisClass('translate-x', declaration.value, options)
  if (declaration.property === 'translate-y')
    return translateAxisClass('translate-y', declaration.value, options)
  if (declaration.property === 'translate-z')
    return translateAxisClass('translate-z', declaration.value, options)
  if (declaration.property === 'transform') return transformClassMulti(declaration.value, options)
  return undefined
}

type TransformParser = {
  pattern: RegExp
  convert: (match: string, options: ResolvedOptions) => string | undefined
}

const transformParsers: TransformParser[] = [
  { pattern: /rotate\((-?\d+(?:\.\d+)?deg)\)/i, convert: (m) => rotateClass(m) },
  { pattern: /rotateX\((-?\d+(?:\.\d+)?deg)\)/i, convert: (m) => angleClass('rotate-x', m) },
  { pattern: /rotateY\((-?\d+(?:\.\d+)?deg)\)/i, convert: (m) => angleClass('rotate-y', m) },
  { pattern: /rotateZ\((-?\d+(?:\.\d+)?deg)\)/i, convert: (m) => angleClass('rotate-z', m) },
  { pattern: /scale\((-?\d+(?:\.\d+)?)\)/i, convert: (m) => scaleClass(m) },
  { pattern: /scaleX\((-?\d+(?:\.\d+)?)\)/i, convert: (m) => scaleClass(m, 'scale-x') },
  { pattern: /scaleY\((-?\d+(?:\.\d+)?)\)/i, convert: (m) => scaleClass(m, 'scale-y') },
  { pattern: /scaleZ\((-?\d+(?:\.\d+)?)\)/i, convert: (m) => scaleClass(m, 'scale-z') },
  {
    pattern: /translateX\(([^)]+)\)/i,
    convert: (m, o) => translateAxisClass('translate-x', m, o)
  },
  {
    pattern: /translateY\(([^)]+)\)/i,
    convert: (m, o) => translateAxisClass('translate-y', m, o)
  },
  {
    pattern: /translateZ\(([^)]+)\)/i,
    convert: (m, o) => translateAxisClass('translate-z', m, o)
  },
  { pattern: /skewX\((-?\d+(?:\.\d+)?deg)\)/i, convert: (m) => angleClass('skew-x', m) },
  { pattern: /skewY\((-?\d+(?:\.\d+)?deg)\)/i, convert: (m) => angleClass('skew-y', m) }
]

function transformClassMulti(
  value: string,
  options: ResolvedOptions
): string | string[] | undefined {
  const classes: string[] = []
  for (const parser of transformParsers) {
    const match = value.match(parser.pattern)
    if (match?.[1]) {
      const cls = parser.convert(match[1], options)
      if (cls) classes.push(cls)
    }
  }
  if (classes.length === 0) return undefined
  return classes.length === 1 ? classes[0] : classes
}

function rotateClass(value: string): string | undefined {
  return angleClass('rotate', value)
}

function angleClass(prefix: string, value: string): string | undefined {
  const normalized = value.trim().toLowerCase()
  if (!normalized.endsWith('deg')) return undefined

  const degrees = Number(normalized.slice(0, -3))
  if (!Number.isFinite(degrees)) return undefined

  const absolute = Math.abs(degrees)
  const token = Number.isInteger(absolute) ? String(absolute) : `[${absolute}deg]`
  return degrees < 0 ? `-${prefix}-${token}` : `${prefix}-${token}`
}

function translateClass(value: string, options: ResolvedOptions): string | undefined {
  const [x, y = x] = value.trim().split(/\s+/)
  if (!x || y !== x) return undefined
  return translateAxisClass('translate', x, options)
}

function translateAxisClass(
  prefix: 'translate' | 'translate-x' | 'translate-y' | 'translate-z',
  value: string,
  options: ResolvedOptions
): string | undefined {
  const token = spacingToken(value, options)
  if (!token) return undefined
  return token.startsWith('-') ? `-${prefix}-${token.slice(1)}` : `${prefix}-${token}`
}

function scaleClass(value: string, prefix = 'scale'): string | undefined {
  const scale = Number(value.trim())
  if (!Number.isFinite(scale)) return undefined

  const percent = scale * 100
  if (!Number.isInteger(percent)) return `${prefix}-[${value.trim()}]`

  return percent < 0 ? `-${prefix}-${Math.abs(percent)}` : `${prefix}-${percent}`
}

const shadowValues: Record<string, string> = {
  '0 1px 2px 0 rgb(0 0 0 / 0.05)': 'shadow-xs',
  '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)': 'shadow-sm',
  '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)': 'shadow-md',
  '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)': 'shadow-lg',
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)': 'shadow-xl',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)': 'shadow-2xl',
  'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)': 'shadow-inner'
}

function convertShadow(declaration: Declaration): string | undefined {
  if (declaration.property !== 'box-shadow') return undefined
  return shadowValues[declaration.value.trim().replace(/\s+/g, ' ')]
}

const varPrefixes: Record<string, string> = {
  color: 'text',
  'background-color': 'bg',
  'border-color': 'border',
  'border-top-color': 'border-t',
  'border-right-color': 'border-r',
  'border-bottom-color': 'border-b',
  'border-left-color': 'border-l',
  'outline-color': 'outline',
  fill: 'fill',
  stroke: 'stroke',
  'caret-color': 'caret',
  'accent-color': 'accent',
  'text-decoration-color': 'decoration',
  width: 'w',
  height: 'h',
  'min-width': 'min-w',
  'min-height': 'min-h',
  'max-width': 'max-w',
  'max-height': 'max-h',
  padding: 'p',
  'padding-top': 'pt',
  'padding-right': 'pr',
  'padding-bottom': 'pb',
  'padding-left': 'pl',
  margin: 'm',
  'margin-top': 'mt',
  'margin-right': 'mr',
  'margin-bottom': 'mb',
  'margin-left': 'ml',
  gap: 'gap',
  'row-gap': 'gap-y',
  'column-gap': 'gap-x',
  'font-size': 'text',
  'font-family': 'font',
  'border-radius': 'rounded',
  'border-width': 'border',
  'box-shadow': 'shadow',
  'line-height': 'leading',
  'letter-spacing': 'tracking'
}

function convertVarReference(declaration: Declaration): string | undefined {
  const match = declaration.value.match(/^var\(\s*(--[\w-]+)\s*\)$/)
  if (!match?.[1]) return undefined

  const prefix = varPrefixes[declaration.property]
  if (prefix) return `${prefix}-(${match[1]})`

  return undefined
}

const gradientDirections: Record<string, string> = {
  'to right': 'bg-linear-to-r',
  'to left': 'bg-linear-to-l',
  'to top': 'bg-linear-to-t',
  'to bottom': 'bg-linear-to-b',
  'to top right': 'bg-linear-to-tr',
  'to top left': 'bg-linear-to-tl',
  'to bottom right': 'bg-linear-to-br',
  'to bottom left': 'bg-linear-to-bl'
}

function convertGradient(
  declaration: Declaration,
  options: ResolvedOptions
): string | string[] | undefined {
  if (declaration.property !== 'background-image' && declaration.property !== 'background')
    return undefined

  const value = declaration.value.trim()
  const linearMatch = value.match(/^linear-gradient\((.+)\)$/)
  if (!linearMatch?.[1]) return undefined

  const inner = linearMatch[1]
  const firstComma = findTopLevelComma(inner)
  if (firstComma === -1) return undefined

  const directionPart = inner.slice(0, firstComma).trim()
  const colorsPart = inner.slice(firstComma + 1).trim()

  const dirClass =
    gradientDirections[directionPart] ??
    (directionPart.match(/^\d+deg$/) ? `bg-linear-${directionPart.replace('deg', '')}` : undefined)
  if (!dirClass) return undefined

  const colorStops = splitGradientStops(colorsPart)
  if (colorStops.length < 2 || colorStops.length > 3) return undefined

  const classes: string[] = [dirClass]

  const fromColor = matchGradientColor(colorStops[0] ?? '', 'from', options)
  if (!fromColor) return undefined
  classes.push(fromColor)

  if (colorStops.length === 3) {
    const viaColor = matchGradientColor(colorStops[1] ?? '', 'via', options)
    if (!viaColor) return undefined
    classes.push(viaColor)
  }

  const toColor = matchGradientColor(colorStops[colorStops.length - 1] ?? '', 'to', options)
  if (!toColor) return undefined
  classes.push(toColor)

  return classes
}

function matchGradientColor(
  stop: string,
  prefix: 'from' | 'via' | 'to',
  options: ResolvedOptions
): string | undefined {
  const color = stop.trim().split(/\s+/)[0]
  if (!color) return undefined

  const normalized = normalizeColor(color)

  const keyword = colorKeywords[normalized]
  if (keyword) return `${prefix}-${keyword}`

  const hexToken = lookupHexToken(normalized)
  if (hexToken) return `${prefix}-${hexToken}`

  const token = Object.entries(options.theme.colors).find(
    ([, c]) => normalizeColor(c) === normalized
  )?.[0]
  if (token) return `${prefix}-${token}`

  return `${prefix}-[${color}]`
}

function findTopLevelComma(value: string): number {
  let depth = 0
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '(') depth++
    else if (value[i] === ')') depth--
    else if (value[i] === ',' && depth === 0) return i
  }
  return -1
}

function splitGradientStops(value: string): string[] {
  const stops: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '(') depth++
    else if (value[i] === ')') depth--
    else if (value[i] === ',' && depth === 0) {
      stops.push(value.slice(start, i).trim())
      start = i + 1
    }
  }
  stops.push(value.slice(start).trim())
  return stops.filter(Boolean)
}

function converted(
  declaration: Declaration,
  className: string,
  kind: 'exact' | 'arbitrary'
): ConvertedDeclaration {
  const important = declaration.important ? '!' : ''
  const variants = declaration.variants.length > 0 ? `${declaration.variants.join(':')}:` : ''
  return { ...declaration, className: `${important}${variants}${className}`, kind }
}
