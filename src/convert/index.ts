import { lookupHexToken } from '../colors'
import {
  canonical,
  commaList,
  dimension,
  functionArguments,
  functionCall,
  functionList,
  integer,
  spaceList,
  stringify,
  valueNodes,
  variableReference,
  type FunctionNode,
  type Node
} from '../css'
import { arbitraryProperty, arbitraryValue } from '../escape'
import { parseThemeVariable, themeUtilities } from '../namespaces'
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

  const lines = integer(declaration.value)
  if (
    (declaration.property === '-webkit-line-clamp' || declaration.property === 'line-clamp') &&
    lines !== undefined &&
    lines >= 0
  ) {
    return converted(declaration, `line-clamp-${lines}`, 'exact')
  }

  if (
    (declaration.property === '-webkit-line-clamp' || declaration.property === 'line-clamp') &&
    declaration.value === 'none'
  ) {
    return converted(declaration, 'line-clamp-none', 'exact')
  }

  const contentClass = convertContent(declaration)
  if (contentClass) return converted(declaration, contentClass, 'exact')

  const zIndex = declaration.property === 'z-index' ? integer(declaration.value) : undefined
  if (zIndex !== undefined) {
    return converted(declaration, signed('z', zIndex), 'exact')
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

  const themeClass = convertThemeVariable(declaration, options)
  if (themeClass) return converted(declaration, themeClass, 'exact')

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
  const count = integer(declaration.value)

  if (declaration.property === 'tab-size' && count !== undefined && count >= 0) {
    return `tab-${count}`
  }

  if (declaration.property === 'zoom') {
    const zoom = dimension(declaration.value)
    const percent =
      zoom?.unit === '%' ? zoom.number : zoom?.unit === '' ? zoom.number * 100 : undefined
    if (percent !== undefined && percent > 0 && Number.isInteger(percent)) return `zoom-${percent}`
  }

  if (declaration.property === 'order' && count !== undefined) return signed('order', count)

  if (
    (declaration.property === 'column-count' || declaration.property === 'columns') &&
    count !== undefined &&
    count > 0
  ) {
    return `columns-${count}`
  }

  const aspectRatio = convertAspectRatio(declaration)
  if (aspectRatio) return aspectRatio

  const gridLine = convertGridLine(declaration)
  if (gridLine) return gridLine

  const gridPlacement = convertGridPlacement(declaration)
  if (gridPlacement) return gridPlacement

  const gridTemplate = convertGridTemplate(declaration)
  if (gridTemplate) return gridTemplate

  if (declaration.property === 'flex-grow' && (count === 0 || count === 1)) {
    return count === 1 ? 'grow' : 'grow-0'
  }

  if (declaration.property === 'flex-shrink' && (count === 0 || count === 1)) {
    return count === 1 ? 'shrink' : 'shrink-0'
  }

  if (declaration.property === 'stroke-width' && count !== undefined && count >= 0) {
    return `stroke-${count}`
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

/** `-z-10` for `-10`: Tailwind puts the sign before the utility. */
function signed(prefix: string, value: number): string {
  return value < 0 ? `-${prefix}-${-value}` : `${prefix}-${value}`
}

function convertAspectRatio(declaration: Declaration): string | undefined {
  if (declaration.property !== 'aspect-ratio') return undefined

  const [width, slash, height, ...rest] = valueNodes(declaration.value)
  if (rest.length > 0 || slash?.type !== 'div' || slash.value !== '/') return undefined
  const w = width && integer(stringify(width))
  const h = height && integer(stringify(height))
  if (!w || !h || w < 0 || h < 0) return undefined

  if (w === h) return 'aspect-square'
  if (w === 16 && h === 9) return 'aspect-video'
  return `aspect-${w}/${h}`
}

function convertSnapType(declaration: Declaration): string | string[] | undefined {
  if (declaration.property !== 'scroll-snap-type') return undefined
  if (declaration.value === 'none') return 'snap-none'

  const parts = spaceList(declaration.value.toLowerCase())
  if (parts?.length !== 2) return undefined

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

/** A plain string; one with spaces or escapes goes to the arbitrary property, which escapes it. */
function convertContent(declaration: Declaration): string | undefined {
  if (declaration.property !== 'content') return undefined
  if (declaration.value === 'none') return 'content-none'

  const nodes = valueNodes(declaration.value)
  const [node] = nodes
  if (nodes.length !== 1 || node?.type !== 'string' || !node.value) return undefined
  if (/[\s_\]\\]/.test(node.value)) return undefined
  return `content-['${node.value.replaceAll("'", "\\'")}']`
}

function convertGridLine(declaration: Declaration): string | undefined {
  const prefixes: Record<string, string> = {
    'grid-column-start': 'col-start',
    'grid-column-end': 'col-end',
    'grid-row-start': 'row-start',
    'grid-row-end': 'row-end'
  }
  const prefix = prefixes[declaration.property]
  const line = integer(declaration.value)
  return prefix && line !== undefined ? signed(prefix, line) : undefined
}

/** `1 / -1` spans the grid; `span 3 / span 3` is what `col-span-3` writes. */
function convertGridPlacement(declaration: Declaration): string | undefined {
  const prefix =
    declaration.property === 'grid-column'
      ? 'col-span'
      : declaration.property === 'grid-row'
        ? 'row-span'
        : undefined
  if (!prefix) return undefined

  const [start, end, ...rest] = commaList(declaration.value.replaceAll('/', ','))
  if (rest.length > 0 || !start || !end) return undefined
  if (integer(start) === 1 && integer(end) === -1) return `${prefix}-full`

  const span = (part: string) => {
    const [keyword, count] = spaceList(part) ?? []
    return keyword === 'span' && count ? integer(count) : undefined
  }
  const count = span(start)
  return count !== undefined && count > 0 && span(end) === count ? `${prefix}-${count}` : undefined
}

/** `repeat(3, minmax(0, 1fr))` is what `grid-cols-3` writes. */
function convertGridTemplate(declaration: Declaration): string | undefined {
  const prefix =
    declaration.property === 'grid-template-columns'
      ? 'grid-cols'
      : declaration.property === 'grid-template-rows'
        ? 'grid-rows'
        : undefined
  const call = prefix ? functionCall(declaration.value) : undefined
  if (call?.value.toLowerCase() !== 'repeat') return undefined

  const [count, track, ...rest] = commaList(functionArguments(call))
  const columns = count ? integer(count) : undefined
  if (rest.length > 0 || !track || canonical(track) !== 'minmax(0,1fr)') return undefined
  return columns !== undefined && columns > 0 ? `${prefix}-${columns}` : undefined
}

function millisecondsValue(value: string): number | undefined {
  const time = dimension(value)
  const milliseconds =
    time?.unit === 'ms' ? time.number : time?.unit === 's' ? time.number * 1000 : undefined
  return milliseconds !== undefined && Number.isInteger(milliseconds) ? milliseconds : undefined
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
  const width = prefix ? dimension(declaration.value) : undefined
  if (!width || (width.unit !== 'px' && !(width.unit === '' && width.number === 0)))
    return undefined

  if (width.number === 1) return prefix
  if (width.number === 0) return `${prefix}-0`
  return [2, 4, 8].includes(width.number) ? `${prefix}-${width.number}` : undefined
}

function convertOpacity(declaration: Declaration): string | undefined {
  if (declaration.property !== 'opacity') return undefined
  const opacity = dimension(declaration.value)
  const percent =
    opacity?.unit === '%' ? opacity.number : opacity?.unit === '' ? opacity.number * 100 : undefined
  if (percent === undefined || percent < 0 || percent > 100) return undefined
  const rounded = Math.round(percent * 1e6) / 1e6
  return Number.isInteger(rounded) ? `opacity-${rounded}` : undefined
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

type Rgb = { r: number; g: number; b: number; alpha?: number }

/** A color function's channels and its alpha after `/` or a fourth comma argument. */
function splitAlpha(value: string): { name: string; base: string; alpha?: number } | undefined {
  const call = functionCall(value)
  if (!call) return undefined
  const isDivider = (node: Node, divider: string) => node.type === 'div' && node.value === divider
  const slash = call.nodes.findIndex((node) => isDivider(node, '/'))
  const commas = call.nodes.flatMap((node, index) => (isDivider(node, ',') ? [index] : []))
  const split = slash !== -1 ? slash : commas.length === 3 ? commas[2] : undefined
  const channels = split === undefined ? call.nodes : call.nodes.slice(0, split)
  const alphaNodes = split === undefined ? [] : call.nodes.slice(split + 1)
  const alpha = alphaNodes.length > 0 ? dimension(stringify(alphaNodes)) : undefined
  if (alphaNodes.length > 0 && (!alpha || (alpha.unit !== '' && alpha.unit !== '%')))
    return undefined
  return {
    name: call.value.toLowerCase(),
    base: stringify(channels),
    alpha: alpha && (alpha.unit === '%' ? alpha.number / 100 : alpha.number)
  }
}

function parseRgb(value: string): Rgb | undefined {
  const split = splitAlpha(value)
  if (split?.name !== 'rgb' && split?.name !== 'rgba') return undefined
  const channels = valueNodes(split.base)
    .filter((node) => node.type === 'word')
    .map((node) => integer(node.value))
  const [r, g, b] = channels
  if (channels.length !== 3 || r === undefined || g === undefined || b === undefined)
    return undefined
  return { r, g, b, alpha: split.alpha }
}

/** `rgb(…/0.5)` or `oklch(…/50%)` of a theme color is that color with an opacity modifier. */
function parseColorWithOpacity(value: string, options: ResolvedOptions): string | undefined {
  const split = splitAlpha(value)
  if (split?.alpha === undefined) return undefined
  const rgb = parseRgb(value)
  const base = rgb ? hex(rgb) : canonical(`${split.name}(${split.base})`)
  const token = Object.entries(options.theme.colors).find(
    ([, color]) => normalizeColor(color) === base
  )?.[0]
  const opacity = split.alpha * 100
  if (!token || !Number.isInteger(Math.round(opacity * 1e6) / 1e6)) return undefined
  return `${token}/${Math.round(opacity)}`
}

function normalizeColor(value: string): string {
  const normalized = canonical(value)
  const alias = colorAliases[normalized]
  if (alias) return alias.toLowerCase()

  const rgb = parseRgb(normalized)
  if (rgb && rgb.alpha === undefined) return hex(rgb)

  return normalized
}

function hex({ r, g, b }: Rgb): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
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
  const calls = functionList(declaration.value)
  if (!calls) return undefined

  // Every function must convert: a partial list would drop the filters left out.
  const classes = calls.map((call) => filterClass(call, prefix))
  if (classes.some((cls) => cls === undefined)) return undefined
  const result = classes as string[]
  return result.length === 1 ? result[0] : result
}

const percentageFilters = new Set([
  'brightness',
  'contrast',
  'grayscale',
  'invert',
  'saturate',
  'sepia'
])

function filterClass(call: FunctionNode, prefix: string): string | undefined {
  const name = call.value.toLowerCase()
  const argument = functionArguments(call)

  if (name === 'blur') {
    return argument === '8px' ? `${prefix}blur` : arbitraryValue(`${prefix}blur`, argument)
  }
  if (percentageFilters.has(name)) return percentageFilterClass(`${prefix}${name}`, argument)
  if (name === 'hue-rotate') return angleClass(`${prefix}hue-rotate`, argument)
  if (name === 'opacity' && prefix === 'backdrop-') {
    return percentageFilterClass('backdrop-opacity', argument)
  }
  if (name === 'drop-shadow' && prefix === '') return dropShadowValues[canonical(argument)]
  return undefined
}

const dropShadowValues = byCanonicalKey({
  '0 1px 1px rgb(0 0 0 / 0.05)': 'drop-shadow-xs',
  '0 1px 2px rgb(0 0 0 / 0.15)': 'drop-shadow-sm',
  '0 3px 3px rgb(0 0 0 / 0.12)': 'drop-shadow-md',
  '0 4px 4px rgb(0 0 0 / 0.15)': 'drop-shadow-lg',
  '0 9px 7px rgb(0 0 0 / 0.1)': 'drop-shadow-xl',
  '0 25px 25px rgb(0 0 0 / 0.15)': 'drop-shadow-2xl'
})

function percentageFilterClass(prefix: string, raw: string): string | undefined {
  const amount = dimension(raw)
  if (!amount || (amount.unit !== '%' && amount.unit !== '')) return undefined
  const value = amount.unit === '%' ? amount.number : amount.number * 100
  if (!Number.isInteger(Math.round(value * 1e6) / 1e6)) return arbitraryValue(prefix, raw)
  const percent = Math.round(value)
  if (
    percent === 100 &&
    (prefix.endsWith('grayscale') || prefix.endsWith('invert') || prefix.endsWith('sepia'))
  )
    return prefix
  return `${prefix}-${percent}`
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

/**
 * Tailwind applies `translate`, `rotate` and `scale` as their own properties, in that order, then
 * `transform` with rotations about each axis and skews. A transform list converts only when its
 * functions already appear in that order, each step once, so the classes compose the same matrix.
 */
const transformSteps: Record<
  string,
  { step: number; convert: (argument: string, options: ResolvedOptions) => string | undefined }
> = {
  translatex: { step: 0, convert: (a, o) => translateAxisClass('translate-x', a, o) },
  translatey: { step: 1, convert: (a, o) => translateAxisClass('translate-y', a, o) },
  translatez: { step: 2, convert: (a, o) => translateAxisClass('translate-z', a, o) },
  rotate: { step: 3, convert: (a) => rotateClass(a) },
  scale: { step: 4, convert: (a) => scaleClass(a) },
  scalex: { step: 5, convert: (a) => scaleClass(a, 'scale-x') },
  scaley: { step: 6, convert: (a) => scaleClass(a, 'scale-y') },
  scalez: { step: 7, convert: (a) => scaleClass(a, 'scale-z') },
  rotatex: { step: 8, convert: (a) => angleClass('rotate-x', a) },
  rotatey: { step: 9, convert: (a) => angleClass('rotate-y', a) },
  rotatez: { step: 10, convert: (a) => angleClass('rotate-z', a) },
  skewx: { step: 11, convert: (a) => angleClass('skew-x', a) },
  skewy: { step: 12, convert: (a) => angleClass('skew-y', a) }
}

function transformClassMulti(
  value: string,
  options: ResolvedOptions
): string | string[] | undefined {
  const calls = functionList(value)
  if (!calls) return undefined

  const classes: string[] = []
  let previous = -1
  for (const call of calls) {
    const step = transformSteps[call.value.toLowerCase()]
    if (!step || step.step <= previous) return undefined
    const cls = step.convert(functionArguments(call), options)
    if (!cls) return undefined
    classes.push(cls)
    previous = step.step
  }
  return classes.length === 1 ? classes[0] : classes
}

function rotateClass(value: string): string | undefined {
  return angleClass('rotate', value)
}

function angleClass(prefix: string, value: string): string | undefined {
  const angle = dimension(value)
  if (angle?.unit !== 'deg') return undefined

  const absolute = Math.abs(angle.number)
  const token = Number.isInteger(absolute) ? String(absolute) : `[${absolute}deg]`
  return angle.number < 0 ? `-${prefix}-${token}` : `${prefix}-${token}`
}

function translateClass(value: string, options: ResolvedOptions): string | undefined {
  const parts = spaceList(value)
  const [x, y = x] = parts ?? []
  if (!parts || parts.length > 2 || !x || y !== x) return undefined
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
  const scale = dimension(value)
  if (!scale || (scale.unit !== '' && scale.unit !== '%')) return undefined

  const percent = scale.unit === '%' ? scale.number : scale.number * 100
  const rounded = Math.round(percent * 1e6) / 1e6
  if (!Number.isInteger(rounded)) return arbitraryValue(prefix, value)

  return rounded < 0 ? `-${prefix}-${Math.abs(rounded)}` : `${prefix}-${rounded}`
}

const shadowValues = byCanonicalKey({
  '0 1px 2px 0 rgb(0 0 0 / 0.05)': 'shadow-xs',
  '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)': 'shadow-sm',
  '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)': 'shadow-md',
  '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)': 'shadow-lg',
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)': 'shadow-xl',
  '0 25px 50px -12px rgb(0 0 0 / 0.25)': 'shadow-2xl',
  'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)': 'shadow-inner'
})

function convertShadow(declaration: Declaration): string | undefined {
  if (declaration.property !== 'box-shadow') return undefined
  return shadowValues[canonical(declaration.value)]
}

/** Scale tables keyed by `canonical()`, so spacing and case in the input do not matter. */
function byCanonicalKey(table: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(table).map(([key, value]) => [canonical(key), value]))
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

function convertThemeVariable(
  declaration: Declaration,
  options: ResolvedOptions
): string | undefined {
  const name = variableReference(declaration.value)
  if (!name || !options.theme.variables.has(name)) return undefined
  const utility = themeUtilities[declaration.property]
  const variable = parseThemeVariable(name)
  if (!utility || variable?.namespace !== utility.namespace) return undefined
  return `${utility.prefix}-${variable.key}`
}

function convertVarReference(declaration: Declaration): string | undefined {
  const name = variableReference(declaration.value)
  const prefix = varPrefixes[declaration.property]
  return name && prefix ? `${prefix}-(${name})` : undefined
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

/**
 * `linear-gradient(to right, red, blue)` with two or three plain stops. A stop with a position
 * keeps the arbitrary value, since `from`/`via`/`to` alone would drop it.
 */
function convertGradient(
  declaration: Declaration,
  options: ResolvedOptions
): string | string[] | undefined {
  if (declaration.property !== 'background-image' && declaration.property !== 'background')
    return undefined

  const call = functionCall(declaration.value)
  if (call?.value.toLowerCase() !== 'linear-gradient') return undefined

  const [direction, ...stops] = commaList(functionArguments(call))
  if (!direction || stops.length < 2 || stops.length > 3) return undefined

  const angle = dimension(direction)
  const dirClass =
    gradientDirections[canonical(direction)] ??
    (angle?.unit === 'deg' && Number.isInteger(angle.number) && angle.number >= 0
      ? `bg-linear-${angle.number}`
      : undefined)
  if (!dirClass) return undefined

  const prefixes: Array<'from' | 'via' | 'to'> =
    stops.length === 3 ? ['from', 'via', 'to'] : ['from', 'to']
  const classes = stops.map((stop, index) => {
    const parts = spaceList(stop)
    const prefix = prefixes[index]
    return parts?.length === 1 && parts[0] && prefix
      ? matchGradientColor(parts[0], prefix, options)
      : undefined
  })
  if (classes.some((cls) => cls === undefined)) return undefined
  return [dirClass, ...(classes as string[])]
}

function matchGradientColor(
  stop: string,
  prefix: 'from' | 'via' | 'to',
  options: ResolvedOptions
): string | undefined {
  const color = stop.trim()
  const normalized = normalizeColor(color)

  const keyword = colorKeywords[normalized]
  if (keyword) return `${prefix}-${keyword}`

  const hexToken = lookupHexToken(normalized)
  if (hexToken) return `${prefix}-${hexToken}`

  const token = Object.entries(options.theme.colors).find(
    ([, c]) => normalizeColor(c) === normalized
  )?.[0]
  if (token) return `${prefix}-${token}`

  return arbitraryValue(prefix, color)
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
