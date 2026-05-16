import type { ConvertedDeclaration, ResolvedOptions } from './types'

type BoxGroup = {
  top: ConvertedDeclaration
  right: ConvertedDeclaration
  bottom: ConvertedDeclaration
  left: ConvertedDeclaration
}

const groups = [
  {
    properties: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
    all: 'm',
    x: 'mx',
    y: 'my',
    top: 'mt',
    right: 'mr',
    bottom: 'mb',
    left: 'ml'
  },
  {
    properties: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
    all: 'p',
    x: 'px',
    y: 'py',
    top: 'pt',
    right: 'pr',
    bottom: 'pb',
    left: 'pl'
  },
  {
    properties: ['top', 'right', 'bottom', 'left'],
    all: 'inset',
    x: 'inset-x',
    y: 'inset-y',
    top: 'top',
    right: 'right',
    bottom: 'bottom',
    left: 'left'
  },
  {
    properties: [
      'border-top-width',
      'border-right-width',
      'border-bottom-width',
      'border-left-width'
    ],
    all: 'border',
    x: 'border-x',
    y: 'border-y',
    top: 'border-t',
    right: 'border-r',
    bottom: 'border-b',
    left: 'border-l'
  },
  {
    properties: [
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color'
    ],
    all: 'border',
    x: 'border-x',
    y: 'border-y',
    top: 'border-t',
    right: 'border-r',
    bottom: 'border-b',
    left: 'border-l'
  },
  {
    properties: [
      'border-top-style',
      'border-right-style',
      'border-bottom-style',
      'border-left-style'
    ],
    all: 'border',
    x: 'border-x',
    y: 'border-y',
    top: 'border-t',
    right: 'border-r',
    bottom: 'border-b',
    left: 'border-l'
  },
  {
    properties: [
      'scroll-margin-top',
      'scroll-margin-right',
      'scroll-margin-bottom',
      'scroll-margin-left'
    ],
    all: 'scroll-m',
    x: 'scroll-mx',
    y: 'scroll-my',
    top: 'scroll-mt',
    right: 'scroll-mr',
    bottom: 'scroll-mb',
    left: 'scroll-ml'
  },
  {
    properties: [
      'scroll-padding-top',
      'scroll-padding-right',
      'scroll-padding-bottom',
      'scroll-padding-left'
    ],
    all: 'scroll-p',
    x: 'scroll-px',
    y: 'scroll-py',
    top: 'scroll-pt',
    right: 'scroll-pr',
    bottom: 'scroll-pb',
    left: 'scroll-pl'
  }
] as const

export function compressConverted(
  converted: ConvertedDeclaration[],
  options: ResolvedOptions
): ConvertedDeclaration[] {
  if (options.compression === 'none') return converted

  let remaining = [...converted]
  const compressed: ConvertedDeclaration[] = []

  for (const group of groups) {
    const found = findBoxGroup(remaining, group.properties)
    if (!found) continue

    const replacement = compressBox(found, group)
    remaining = remaining.filter((item) => !group.properties.includes(item.property as never))
    compressed.push(...replacement)
  }

  let result = [...remaining, ...compressed]
  result = compressRadius(result)
  result = compressAxisPairs(result)
  return result
}

function findBoxGroup(
  converted: ConvertedDeclaration[],
  properties: readonly string[]
): BoxGroup | undefined {
  const [topProperty, rightProperty, bottomProperty, leftProperty] = properties
  const top = converted.find((item) => item.property === topProperty)
  const right = converted.find((item) => item.property === rightProperty)
  const bottom = converted.find((item) => item.property === bottomProperty)
  const left = converted.find((item) => item.property === leftProperty)

  return top && right && bottom && left ? { top, right, bottom, left } : undefined
}

function compressBox(
  box: BoxGroup,
  group: {
    all: string
    x: string
    y: string
    top: string
    right: string
    bottom: string
    left: string
  }
): ConvertedDeclaration[] {
  const top = extractToken(box.top.className, group.top)
  const right = extractToken(box.right.className, group.right)
  const bottom = extractToken(box.bottom.className, group.bottom)
  const left = extractToken(box.left.className, group.left)

  if (!top || !right || !bottom || !left) return [box.top, box.right, box.bottom, box.left]

  if (top === right && right === bottom && bottom === left) {
    return [withClass(box.top, `${group.all}-${top}`)]
  }

  if (top === bottom && right === left) {
    return [withClass(box.top, `${group.y}-${top}`), withClass(box.right, `${group.x}-${right}`)]
  }

  const result: ConvertedDeclaration[] = []
  if (top === bottom) {
    result.push(withClass(box.top, `${group.y}-${top}`))
  } else {
    result.push(
      withClass(box.top, `${group.top}-${top}`),
      withClass(box.bottom, `${group.bottom}-${bottom}`)
    )
  }

  if (right === left) {
    result.push(withClass(box.right, `${group.x}-${right}`))
  } else {
    result.push(
      withClass(box.right, `${group.right}-${right}`),
      withClass(box.left, `${group.left}-${left}`)
    )
  }

  return result
}

function extractToken(className: string, prefix: string): string | undefined {
  if (!className.startsWith(prefix + '-')) return undefined
  return className.slice(prefix.length + 1)
}

function compressAxisPairs(converted: ConvertedDeclaration[]): ConvertedDeclaration[] {
  let result = [...converted]

  const rowGap = result.find((c) => c.property === 'row-gap')
  const colGap = result.find((c) => c.property === 'column-gap')
  if (rowGap && colGap) {
    const rowToken = extractToken(rowGap.className, 'gap-y')
    const colToken = extractToken(colGap.className, 'gap-x')
    if (rowToken && colToken && rowToken === colToken) {
      result = result.filter((c) => c.property !== 'row-gap' && c.property !== 'column-gap')
      result.push(withClass(rowGap, `gap-${rowToken}`))
    }
  }

  return result
}

function compressRadius(converted: ConvertedDeclaration[]): ConvertedDeclaration[] {
  const tlProp = 'border-top-left-radius'
  const trProp = 'border-top-right-radius'
  const brProp = 'border-bottom-right-radius'
  const blProp = 'border-bottom-left-radius'

  const tl = converted.find((c) => c.property === tlProp)
  const tr = converted.find((c) => c.property === trProp)
  const br = converted.find((c) => c.property === brProp)
  const bl = converted.find((c) => c.property === blProp)

  if (!tl || !tr || !br || !bl) return converted

  const tlToken = extractToken(tl.className, 'rounded-tl')
  const trToken = extractToken(tr.className, 'rounded-tr')
  const brToken = extractToken(br.className, 'rounded-br')
  const blToken = extractToken(bl.className, 'rounded-bl')

  if (!tlToken || !trToken || !brToken || !blToken) return converted

  const radiusProps = new Set([tlProp, trProp, brProp, blProp])
  const rest = converted.filter((c) => !radiusProps.has(c.property))

  if (tlToken === trToken && trToken === brToken && brToken === blToken) {
    return [...rest, withClass(tl, `rounded-${tlToken}`)]
  }

  const result = [...rest]

  if (tlToken === blToken && trToken === brToken) {
    result.push(withClass(tl, `rounded-l-${tlToken}`))
    result.push(withClass(tr, `rounded-r-${trToken}`))
    return result
  }

  if (tlToken === trToken) {
    result.push(withClass(tl, `rounded-t-${tlToken}`))
  } else {
    result.push(tl, tr)
  }
  if (brToken === blToken) {
    result.push(withClass(br, `rounded-b-${brToken}`))
  } else {
    result.push(br, bl)
  }

  return result
}

function withClass(declaration: ConvertedDeclaration, className: string): ConvertedDeclaration {
  return { ...declaration, className }
}
