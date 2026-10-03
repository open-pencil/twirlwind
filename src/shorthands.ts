import {
  commaList,
  dimension,
  functionCall,
  isDimension,
  spaceList,
  stringify,
  valueNodes
} from './css'
import type { Declaration } from './types'

const boxShorthands: Record<string, [string, string, string, string]> = {
  margin: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
  padding: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
  inset: ['top', 'right', 'bottom', 'left'],
  'border-color': [
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color'
  ],
  'border-style': [
    'border-top-style',
    'border-right-style',
    'border-bottom-style',
    'border-left-style'
  ],
  'border-width': [
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width'
  ],
  'border-radius': [
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius'
  ],
  'scroll-margin': [
    'scroll-margin-top',
    'scroll-margin-right',
    'scroll-margin-bottom',
    'scroll-margin-left'
  ],
  'scroll-padding': [
    'scroll-padding-top',
    'scroll-padding-right',
    'scroll-padding-bottom',
    'scroll-padding-left'
  ]
}

const logicalPairShorthands: Record<string, [string, string]> = {
  'overscroll-behavior': ['overscroll-behavior-x', 'overscroll-behavior-y'],
  'margin-inline': ['margin-inline-start', 'margin-inline-end'],
  'margin-block': ['margin-block-start', 'margin-block-end'],
  'padding-inline': ['padding-inline-start', 'padding-inline-end'],
  'padding-block': ['padding-block-start', 'padding-block-end'],
  'inset-inline': ['inset-inline-start', 'inset-inline-end'],
  'inset-block': ['top', 'bottom'],
  'scroll-margin-inline': ['scroll-margin-inline-start', 'scroll-margin-inline-end'],
  'scroll-margin-block': ['scroll-margin-block-start', 'scroll-margin-block-end'],
  'scroll-padding-inline': ['scroll-padding-inline-start', 'scroll-padding-inline-end'],
  'scroll-padding-block': ['scroll-padding-block-start', 'scroll-padding-block-end']
}

export function expandShorthands(declarations: Declaration[]): Declaration[] {
  return declarations.flatMap((declaration) => {
    const overflow = expandOverflow(declaration)
    if (overflow) return overflow

    const gap = expandGap(declaration)
    if (gap) return gap

    const place = expandPlace(declaration)
    if (place) return place

    const logicalPair = expandLogicalPair(declaration)
    if (logicalPair) return logicalPair

    const listStyle = expandListStyle(declaration)
    if (listStyle) return listStyle

    const outline = expandOutline(declaration)
    if (outline) return outline

    const textDecoration = expandTextDecoration(declaration)
    if (textDecoration) return textDecoration

    const transition = expandTransition(declaration)
    if (transition) return transition

    const border = expandBorderCombined(declaration)
    if (border) return border

    const columnRule = expandColumnRule(declaration)
    if (columnRule) return columnRule

    const sizeExpanded = expandSize(declaration)
    if (sizeExpanded) return sizeExpanded

    const font = expandFont(declaration)
    if (font) return font

    const background = expandBackground(declaration)
    if (background) return background

    const longhands = boxShorthands[declaration.property]
    if (!longhands) return [declaration]

    const values = splitBoxValue(declaration.value)
    if (!values) return [declaration]

    return [
      { ...declaration, property: longhands[0], value: values[0] },
      { ...declaration, property: longhands[1], value: values[1] },
      { ...declaration, property: longhands[2], value: values[2] },
      { ...declaration, property: longhands[3], value: values[3] }
    ]
  })
}

const imageFunctions =
  /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)$/i

function isImage(part: string): boolean {
  const call = functionCall(part)
  return part === 'none' || (call !== undefined && imageFunctions.test(call.value))
}

/**
 * Assign each part to a longhand; a part no rule claims, or a longhand claimed twice, keeps the
 * shorthand. Longhands in `multiple` take several parts, joined, as `center top` does.
 */
function classifyParts(
  declaration: Declaration,
  parts: string[] | undefined,
  rules: Array<[property: string, matches: (part: string) => boolean]>,
  rest?: string,
  multiple: ReadonlySet<string> = new Set()
): Declaration[] | undefined {
  if (!parts || parts.length === 0) return undefined
  const expanded: Declaration[] = []
  for (const part of parts) {
    const repeated = rules.find(
      ([candidate, matches]) =>
        multiple.has(candidate) && matches(part) && claimed(expanded, candidate)
    )?.[0]
    const previous = repeated && expanded.find((item) => item.property === repeated)
    if (previous) {
      previous.value = `${previous.value} ${part}`
      continue
    }
    const property =
      rules.find(([candidate, matches]) => matches(part) && !claimed(expanded, candidate))?.[0] ??
      (rest && !claimed(expanded, rest) ? rest : undefined)
    if (!property) return undefined
    expanded.push({ ...declaration, property, value: part })
  }
  return expanded
}

function claimed(expanded: Declaration[], property: string): boolean {
  return expanded.some((declaration) => declaration.property === property)
}

function expandBackground(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'background') return undefined

  const bgRepeats = new Set(['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'space', 'round'])
  const bgAttachments = new Set(['fixed', 'local', 'scroll'])
  const bgPositions = new Set(['center', 'top', 'bottom', 'left', 'right'])

  return classifyParts(
    declaration,
    spaceList(declaration.value),
    [
      ['background-image', isImage],
      ['background-repeat', (part) => bgRepeats.has(part)],
      ['background-attachment', (part) => bgAttachments.has(part)],
      ['background-position', (part) => bgPositions.has(part)]
    ],
    'background-color',
    new Set(['background-position'])
  )
}

const fontStyles = new Set(['italic', 'oblique'])
const fontWeights = new Set([
  'bold',
  'bolder',
  'lighter',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900'
])

const fontSizeKeywords = new Set([
  'xx-small',
  'x-small',
  'small',
  'medium',
  'large',
  'x-large',
  'xx-large',
  'xxx-large',
  'smaller',
  'larger'
])

/** A size needs a unit or a keyword; a bare number in `font` is a weight. */
function isFontSize(part: string): boolean {
  const size = dimension(part)
  return fontSizeKeywords.has(part) || (size !== undefined && size.unit !== '')
}

/**
 * `font: [style] [weight] size[/line-height] family`. The family is everything after the size,
 * commas and quotes included; any other leading keyword keeps the shorthand.
 */
function expandFont(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'font') return undefined

  const nodes = valueNodes(declaration.value)
  const sizeIndex = nodes.findIndex((node) => node.type === 'word' && isFontSize(node.value))
  if (sizeIndex === -1) return undefined

  const leading = classifyParts(
    declaration,
    nodes.slice(0, sizeIndex).map((node) => stringify(node)),
    [
      ['font-style', (part) => fontStyles.has(part)],
      ['font-weight', (part) => fontWeights.has(part)]
    ]
  )
  if (sizeIndex > 0 && !leading) return undefined

  const size = nodes[sizeIndex]
  const slash = nodes[sizeIndex + 1]
  const hasLineHeight = slash?.type === 'div' && slash.value === '/'
  const lineHeight = hasLineHeight ? nodes[sizeIndex + 2] : undefined
  const family = nodes.slice(sizeIndex + (hasLineHeight ? 3 : 1))
  const familyStart = family[0]?.sourceIndex
  if (!size || (hasLineHeight && !lineHeight) || familyStart === undefined) return undefined

  return [
    ...(leading ?? []),
    { ...declaration, property: 'font-size', value: stringify(size) },
    ...(lineHeight
      ? [{ ...declaration, property: 'line-height', value: stringify(lineHeight) }]
      : []),
    { ...declaration, property: 'font-family', value: declaration.value.slice(familyStart).trim() }
  ]
}

function expandSize(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'size') return undefined

  const parts = spaceList(declaration.value)
  const [w, h = w] = parts ?? []
  if (!parts || parts.length > 2 || !w || !h) return undefined
  return [
    { ...declaration, property: 'width', value: w },
    { ...declaration, property: 'height', value: h }
  ]
}

const lineStyles = new Set([
  'none',
  'hidden',
  'solid',
  'dashed',
  'dotted',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset'
])
const lineWidths = new Set(['thin', 'medium', 'thick'])
const isLineWidth = (part: string) => lineWidths.has(part) || isDimension(part)

/** `<width> <style> <color>` in any order, as `border`, `outline` and `column-rule` take. */
function expandLine(
  declaration: Declaration,
  [width, style, color]: [string, string, string]
): Declaration[] | undefined {
  return classifyParts(
    declaration,
    spaceList(declaration.value),
    [
      [style, (part) => lineStyles.has(part)],
      [width, isLineWidth]
    ],
    color
  )
}

function expandColumnRule(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'column-rule') return undefined
  return expandLine(declaration, ['column-rule-width', 'column-rule-style', 'column-rule-color'])
}

function expandBorderCombined(declaration: Declaration): Declaration[] | undefined {
  const sides: Record<string, [string, string, string]> = {
    border: ['border-width', 'border-style', 'border-color'],
    'border-top': ['border-top-width', 'border-top-style', 'border-top-color'],
    'border-right': ['border-right-width', 'border-right-style', 'border-right-color'],
    'border-bottom': ['border-bottom-width', 'border-bottom-style', 'border-bottom-color'],
    'border-left': ['border-left-width', 'border-left-style', 'border-left-color'],
    'border-inline-start': [
      'border-inline-start-width',
      'border-inline-start-style',
      'border-inline-start-color'
    ],
    'border-inline-end': [
      'border-inline-end-width',
      'border-inline-end-style',
      'border-inline-end-color'
    ],
    'border-block': ['border-block-width', 'border-block-style', 'border-block-color'],
    'border-block-start': [
      'border-block-start-width',
      'border-block-start-style',
      'border-block-start-color'
    ],
    'border-block-end': [
      'border-block-end-width',
      'border-block-end-style',
      'border-block-end-color'
    ],
    'border-inline': ['border-inline-width', 'border-inline-style', 'border-inline-color']
  }
  const longhands = sides[declaration.property]
  if (!longhands) return undefined
  const expanded = expandLine(declaration, longhands)
  return expanded && expanded.length >= 2 ? expanded : undefined
}

const timingKeywords = new Set([
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'linear',
  'step-start',
  'step-end'
])
const timingFunctions = new Set(['cubic-bezier', 'steps', 'linear'])

function isTime(part: string): boolean {
  const parsed = dimension(part)
  return parsed?.unit === 'ms' || parsed?.unit === 's'
}

function isTiming(part: string): boolean {
  const call = functionCall(part)
  return timingKeywords.has(part) || (call !== undefined && timingFunctions.has(call.value))
}

/** One transition only: a comma list keeps the shorthand rather than merging transitions. */
function expandTransition(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'transition' || declaration.value === 'none') return undefined
  if (commaList(declaration.value).length !== 1) return undefined

  return classifyParts(
    declaration,
    spaceList(declaration.value),
    [
      ['transition-duration', isTime],
      ['transition-delay', isTime],
      ['transition-timing-function', isTiming]
    ],
    'transition-property'
  )
}

function expandOutline(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'outline') return undefined
  const expanded = expandLine(declaration, ['outline-width', 'outline-style', 'outline-color'])
  return expanded && expanded.length >= 2 ? expanded : undefined
}

function expandTextDecoration(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'text-decoration') return undefined

  const lines = new Set(['underline', 'overline', 'line-through', 'none'])
  const styles = new Set(['solid', 'double', 'dotted', 'dashed', 'wavy'])
  return classifyParts(
    declaration,
    spaceList(declaration.value),
    [
      ['text-decoration-line', (part) => lines.has(part)],
      ['text-decoration-style', (part) => styles.has(part)],
      [
        'text-decoration-thickness',
        (part) => part === 'auto' || part === 'from-font' || isDimension(part)
      ]
    ],
    'text-decoration-color',
    new Set(['text-decoration-line'])
  )
}

function expandListStyle(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'list-style') return undefined

  return classifyParts(
    declaration,
    spaceList(declaration.value),
    [
      ['list-style-position', (part) => part === 'inside' || part === 'outside'],
      ['list-style-image', (part) => functionCall(part) !== undefined]
    ],
    'list-style-type'
  )
}

/** Two whitespace-separated values, as `gap`, `place-*`, `overflow` and logical pairs take. */
function splitPair(
  declaration: Declaration,
  [first, second]: [string, string]
): Declaration[] | undefined {
  const parts = spaceList(declaration.value)
  const [a, b] = parts ?? []
  if (parts?.length !== 2 || !a || !b) return undefined
  return [
    { ...declaration, property: first, value: a },
    { ...declaration, property: second, value: b }
  ]
}

function expandGap(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'gap') return undefined
  return splitPair(declaration, ['row-gap', 'column-gap'])
}

function expandPlace(declaration: Declaration): Declaration[] | undefined {
  const placeMap: Record<string, [string, string]> = {
    'place-items': ['align-items', 'justify-items'],
    'place-content': ['align-content', 'justify-content'],
    'place-self': ['align-self', 'justify-self']
  }
  const longhands = placeMap[declaration.property]
  return longhands ? splitPair(declaration, longhands) : undefined
}

function expandLogicalPair(declaration: Declaration): Declaration[] | undefined {
  const longhands = logicalPairShorthands[declaration.property]
  return longhands ? splitPair(declaration, longhands) : undefined
}

function expandOverflow(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'overflow') return undefined
  return splitPair(declaration, ['overflow-x', 'overflow-y'])
}

function splitBoxValue(value: string): [string, string, string, string] | undefined {
  const parts = spaceList(value)
  if (!parts || parts.length < 1 || parts.length > 4) return undefined

  const [top, right = top, bottom = top, left = right] = parts
  if (!top || !right || !bottom || !left) return undefined

  return [top, right, bottom, left]
}
