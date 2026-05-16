import type { Declaration } from './types'
import { splitCssValueList } from './value'

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

function expandBackground(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'background') return undefined

  const parts = splitCssValueList(declaration.value)
  if (parts.length < 1) return undefined

  const bgRepeats = new Set(['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'space', 'round'])
  const bgSizes = new Set(['cover', 'contain'])
  const bgAttachments = new Set(['fixed', 'local', 'scroll'])
  const bgPositions = new Set(['center', 'top', 'bottom', 'left', 'right'])

  const expanded: Declaration[] = []

  for (const part of parts) {
    if (bgRepeats.has(part)) {
      expanded.push({ ...declaration, property: 'background-repeat', value: part })
    } else if (bgSizes.has(part)) {
      expanded.push({ ...declaration, property: 'background-size', value: part })
    } else if (bgAttachments.has(part)) {
      expanded.push({ ...declaration, property: 'background-attachment', value: part })
    } else if (bgPositions.has(part)) {
      expanded.push({ ...declaration, property: 'background-position', value: part })
    } else if (part === 'none') {
      expanded.push({ ...declaration, property: 'background-image', value: 'none' })
    } else if (!expanded.some((d) => d.property === 'background-color')) {
      expanded.push({ ...declaration, property: 'background-color', value: part })
    }
  }

  return expanded.length > 0 ? expanded : undefined
}

function expandFont(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'font') return undefined

  const weights = new Set([
    'normal',
    'bold',
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
  const fontStyles = new Set(['italic', 'oblique'])

  const parts = splitCssValueList(declaration.value)
  if (parts.length < 2) return undefined

  const expanded: Declaration[] = []

  for (const part of parts) {
    if (fontStyles.has(part)) {
      expanded.push({ ...declaration, property: 'font-style', value: part })
    } else if (weights.has(part)) {
      expanded.push({ ...declaration, property: 'font-weight', value: part })
    } else if (part.includes('/')) {
      const [size, lineHeight] = part.split('/')
      if (size) expanded.push({ ...declaration, property: 'font-size', value: size })
      if (lineHeight) expanded.push({ ...declaration, property: 'line-height', value: lineHeight })
    } else if (/^\d/.test(part)) {
      expanded.push({ ...declaration, property: 'font-size', value: part })
    } else if (!expanded.some((d) => d.property === 'font-family')) {
      expanded.push({ ...declaration, property: 'font-family', value: part })
    }
  }

  return expanded.length >= 2 ? expanded : undefined
}

function expandSize(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'size') return undefined

  const parts = splitCssValueList(declaration.value)
  if (parts.length === 1 && parts[0]) {
    return [
      { ...declaration, property: 'width', value: parts[0] },
      { ...declaration, property: 'height', value: parts[0] }
    ]
  }

  if (parts.length === 2) {
    const [w, h] = parts
    if (!w || !h) return undefined
    return [
      { ...declaration, property: 'width', value: w },
      { ...declaration, property: 'height', value: h }
    ]
  }

  return undefined
}

function expandColumnRule(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'column-rule') return undefined

  const parts = splitCssValueList(declaration.value)
  if (parts.length < 2) return undefined

  const ruleStyles = new Set([
    'none',
    'solid',
    'dashed',
    'dotted',
    'double',
    'groove',
    'ridge',
    'inset',
    'outset'
  ])
  const expanded: Declaration[] = []

  for (const part of parts) {
    if (ruleStyles.has(part)) {
      expanded.push({ ...declaration, property: 'column-rule-style', value: part })
    } else if (/^\d/.test(part)) {
      expanded.push({ ...declaration, property: 'column-rule-width', value: part })
    } else {
      expanded.push({ ...declaration, property: 'column-rule-color', value: part })
    }
  }

  return expanded.length >= 2 ? expanded : undefined
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

  const parts = splitCssValueList(declaration.value)
  if (parts.length < 2 || parts.length > 3) return undefined

  const borderStyles = new Set([
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

  const expanded: Declaration[] = []
  for (const part of parts) {
    if (borderStyles.has(part)) {
      expanded.push({ ...declaration, property: longhands[1], value: part })
    } else if (/^\d/.test(part)) {
      expanded.push({ ...declaration, property: longhands[0], value: part })
    } else {
      expanded.push({ ...declaration, property: longhands[2], value: part })
    }
  }

  return expanded.length >= 2 ? expanded : undefined
}

function expandTransition(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'transition' || declaration.value === 'none') return undefined

  const parts = declaration.value.split(/\s+/)
  const expanded: Declaration[] = []

  for (const part of parts) {
    if (/^\d/.test(part) && (part.endsWith('ms') || part.endsWith('s'))) {
      if (!expanded.some((d) => d.property === 'transition-duration')) {
        expanded.push({ ...declaration, property: 'transition-duration', value: part })
      } else if (!expanded.some((d) => d.property === 'transition-delay')) {
        expanded.push({ ...declaration, property: 'transition-delay', value: part })
      }
    } else if (['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'].includes(part)) {
      expanded.push({ ...declaration, property: 'transition-timing-function', value: part })
    } else if (['all', 'none', 'color', 'opacity', 'shadow', 'transform'].includes(part)) {
      expanded.push({ ...declaration, property: 'transition-property', value: part })
    }
  }

  return expanded.length > 0 ? expanded : undefined
}

function expandOutline(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'outline') return undefined

  const parts = splitCssValueList(declaration.value)
  if (parts.length < 2) return undefined

  const outlineStyles = new Set([
    'none',
    'solid',
    'dashed',
    'dotted',
    'double',
    'groove',
    'ridge',
    'inset',
    'outset'
  ])
  const expanded: Declaration[] = []

  for (const part of parts) {
    if (outlineStyles.has(part)) {
      expanded.push({ ...declaration, property: 'outline-style', value: part })
    } else if (/^\d/.test(part)) {
      expanded.push({ ...declaration, property: 'outline-width', value: part })
    } else {
      expanded.push({ ...declaration, property: 'outline-color', value: part })
    }
  }

  return expanded.length > 0 ? expanded : undefined
}

function expandTextDecoration(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'text-decoration') return undefined

  const parts = splitCssValueList(declaration.value)
  if (parts.length < 1) return undefined

  const lines = new Set(['underline', 'overline', 'line-through', 'none'])
  const styles = new Set(['solid', 'double', 'dotted', 'dashed', 'wavy'])
  const expanded: Declaration[] = []

  for (const part of parts) {
    if (lines.has(part)) {
      expanded.push({ ...declaration, property: 'text-decoration-line', value: part })
    } else if (styles.has(part)) {
      expanded.push({ ...declaration, property: 'text-decoration-style', value: part })
    }
  }

  return expanded.length > 0 ? expanded : undefined
}

function expandListStyle(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'list-style') return undefined

  const parts = splitCssValueList(declaration.value)
  if (parts.length === 0) return undefined

  const expanded = parts.flatMap((value) => {
    if (value === 'inside' || value === 'outside') {
      return [{ ...declaration, property: 'list-style-position', value }]
    }

    if (value === 'disc' || value === 'decimal' || value === 'none') {
      return [{ ...declaration, property: 'list-style-type', value }]
    }

    return []
  })

  return expanded.length > 0 ? expanded : undefined
}

function expandGap(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'gap') return undefined

  const parts = splitCssValueList(declaration.value)
  if (parts.length !== 2 || parts.some((part) => part.length === 0)) return undefined

  const [row, col] = parts
  if (!row || !col) return undefined

  return [
    { ...declaration, property: 'row-gap', value: row },
    { ...declaration, property: 'column-gap', value: col }
  ]
}

function expandPlace(declaration: Declaration): Declaration[] | undefined {
  const placeMap: Record<string, [string, string]> = {
    'place-items': ['align-items', 'justify-items'],
    'place-content': ['align-content', 'justify-content'],
    'place-self': ['align-self', 'justify-self']
  }
  const longhands = placeMap[declaration.property]
  if (!longhands) return undefined

  const parts = splitCssValueList(declaration.value)
  if (parts.length !== 2 || parts.some((part) => part.length === 0)) return undefined

  const [align, justify] = parts
  if (!align || !justify) return undefined

  return [
    { ...declaration, property: longhands[0], value: align },
    { ...declaration, property: longhands[1], value: justify }
  ]
}

function expandLogicalPair(declaration: Declaration): Declaration[] | undefined {
  const longhands = logicalPairShorthands[declaration.property]
  if (!longhands) return undefined

  const parts = splitCssValueList(declaration.value)
  if (parts.length !== 2 || parts.some((part) => part.length === 0)) return undefined

  const [start, end] = parts
  if (!start || !end) return undefined

  return [
    { ...declaration, property: longhands[0], value: start },
    { ...declaration, property: longhands[1], value: end }
  ]
}

function expandOverflow(declaration: Declaration): Declaration[] | undefined {
  if (declaration.property !== 'overflow') return undefined

  const parts = splitCssValueList(declaration.value)
  if (parts.length !== 2 || parts.some((part) => part.length === 0)) return undefined

  const [x, y] = parts
  if (!x || !y) return undefined

  return [
    { ...declaration, property: 'overflow-x', value: x },
    { ...declaration, property: 'overflow-y', value: y }
  ]
}

function splitBoxValue(value: string): [string, string, string, string] | undefined {
  const parts = splitCssValueList(value)
  if (parts.length < 1 || parts.length > 4 || parts.some((part) => part.length === 0))
    return undefined

  const [top, right = top, bottom = top, left = right] = parts
  if (!top || !right || !bottom || !left) return undefined

  return [top, right, bottom, left]
}
