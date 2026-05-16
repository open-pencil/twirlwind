import type { ConvertedDeclaration, ResolvedOptions } from './types'

const propertyOrder = [
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'z-index',
  'visibility',
  'overflow',
  'overflow-x',
  'overflow-y',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'flex-direction',
  'flex-wrap',
  'justify-content',
  'align-items',
  'align-content',
  'align-self',
  'gap',
  'row-gap',
  'column-gap',
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'font-size',
  'font-weight',
  'line-height',
  'text-align',
  'color',
  'background-color',
  'border-width',
  'border-color',
  'border-radius',
  'opacity',
  'box-shadow',
  'filter',
  'transform',
  'transition',
  'animation'
]

const orderIndex = new Map(propertyOrder.map((property, index) => [property, index]))

export function sortConverted(
  converted: ConvertedDeclaration[],
  options: ResolvedOptions
): ConvertedDeclaration[] {
  if (options.sort === 'input') return converted

  return [...converted].sort((left, right) => {
    const leftOrder = orderIndex.get(left.property) ?? Number.MAX_SAFE_INTEGER
    const rightOrder = orderIndex.get(right.property) ?? Number.MAX_SAFE_INTEGER
    return leftOrder - rightOrder
  })
}
