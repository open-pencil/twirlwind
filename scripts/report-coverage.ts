import { twirl } from '../src'
import { propertySamples } from './property-samples'

const data = await Bun.file('node_modules/mdn-data/css/properties.json').json()
const properties = Object.keys(data as Record<string, unknown>)

type Tier = 'exact' | 'arbitrary-value' | 'arbitrary-property'

function classify(result: ReturnType<typeof twirl.convert>): Tier {
  if (result.exact.length > 0) return 'exact'
  if (result.arbitrary.some((item) => item.className.startsWith('['))) return 'arbitrary-property'
  return 'arbitrary-value'
}

const rows = properties.map((property) => {
  const result = twirl.convert({ [property]: 'initial' })
  return { property, kind: classify(result), className: result.className }
})

const counts = rows.reduce<Record<string, number>>((acc, row) => {
  acc[row.kind] = (acc[row.kind] ?? 0) + 1
  return acc
}, {})

const sampleRows = propertySamples.map((sample) => {
  const result = twirl.convert(sample.style)
  return { ...sample, kind: classify(result), className: result.className }
})

const sampleCounts = sampleRows.reduce<Record<string, number>>((acc, row) => {
  acc[row.kind] = (acc[row.kind] ?? 0) + 1
  return acc
}, {})

console.log('MDN fallback sweep')
console.log(`CSS properties tested: ${rows.length}`)
console.log(`Exact utilities: ${counts.exact ?? 0}`)
console.log(`Arbitrary value utilities: ${counts['arbitrary-value'] ?? 0}`)
console.log(`Arbitrary properties: ${counts['arbitrary-property'] ?? 0}`)
console.log('')
console.log('Representative value samples')
console.log(`Samples tested: ${sampleRows.length}`)
console.log(`Exact utilities: ${sampleCounts.exact ?? 0}`)
console.log(`Arbitrary value utilities: ${sampleCounts['arbitrary-value'] ?? 0}`)
console.log(`Arbitrary properties: ${sampleCounts['arbitrary-property'] ?? 0}`)
console.log('')
console.log('Sample mismatches:')
for (const row of sampleRows.filter((item) => item.kind !== item.expectedKind)) {
  console.log(`- ${row.name}: expected ${row.expectedKind}, got ${row.kind} (${row.className})`)
}

const categories: Record<string, string[]> = {
  layout: [
    'display',
    'position',
    'float',
    'clear',
    'visibility',
    'isolation',
    'box-sizing',
    'contain',
    'z-index',
    'overflow',
    'overflow-x',
    'overflow-y'
  ],
  flexbox: [
    'flex',
    'flex-direction',
    'flex-wrap',
    'flex-grow',
    'flex-shrink',
    'flex-basis',
    'order',
    'align-items',
    'align-self',
    'align-content',
    'justify-content',
    'justify-items',
    'justify-self',
    'place-items',
    'place-content',
    'place-self',
    'gap',
    'row-gap',
    'column-gap'
  ],
  grid: [
    'grid-template-columns',
    'grid-template-rows',
    'grid-auto-flow',
    'grid-auto-columns',
    'grid-auto-rows',
    'grid-column',
    'grid-column-start',
    'grid-column-end',
    'grid-row',
    'grid-row-start',
    'grid-row-end'
  ],
  sizing: [
    'width',
    'height',
    'min-width',
    'min-height',
    'max-width',
    'max-height',
    'inline-size',
    'block-size',
    'aspect-ratio'
  ],
  spacing: [
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
    'inset',
    'top',
    'right',
    'bottom',
    'left'
  ],
  typography: [
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'font-stretch',
    'font-variant-numeric',
    'line-height',
    'letter-spacing',
    'text-align',
    'text-transform',
    'text-decoration-line',
    'text-decoration-style',
    'text-decoration-thickness',
    'text-underline-offset',
    'text-overflow',
    'text-wrap',
    'white-space',
    'word-break',
    'overflow-wrap',
    'hyphens',
    'vertical-align',
    '-webkit-line-clamp',
    'line-clamp',
    'tab-size',
    'list-style-type',
    'list-style-position'
  ],
  colors: [
    'color',
    'background-color',
    'border-color',
    'outline-color',
    'text-decoration-color',
    'caret-color',
    'accent-color',
    'fill',
    'stroke'
  ],
  borders: [
    'border-width',
    'border-style',
    'border-radius',
    'border-collapse',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
    'border-top-style',
    'border-top-left-radius',
    'border-top-right-radius',
    'outline-style',
    'outline-width',
    'outline-offset'
  ],
  transforms: [
    'transform',
    'rotate',
    'scale',
    'translate',
    'transform-origin',
    'transform-style',
    'backface-visibility',
    'perspective'
  ],
  filters: ['filter', 'backdrop-filter', 'opacity', 'mix-blend-mode', 'background-blend-mode'],
  transitions: [
    'transition-property',
    'transition-duration',
    'transition-delay',
    'transition-timing-function',
    'transition-behavior',
    'animation',
    'animation-name'
  ],
  interactivity: [
    'cursor',
    'pointer-events',
    'resize',
    'user-select',
    'touch-action',
    'scroll-behavior',
    'scroll-snap-type',
    'scroll-snap-align',
    'scroll-snap-stop',
    'overscroll-behavior',
    'will-change',
    'appearance'
  ],
  backgrounds: [
    'background-image',
    'background-size',
    'background-position',
    'background-repeat',
    'background-attachment',
    'background-clip',
    'background-origin'
  ],
  masks: ['mask-image', 'mask-mode', 'mask-size', 'mask-repeat', 'mask-origin', 'mask-clip']
}

console.log('')
console.log('Category coverage (with real representative values):')
for (const [category, props] of Object.entries(categories)) {
  const catSamples = sampleRows.filter((s) => {
    const result = twirl.convert(s.style)
    const declarations = [...result.exact, ...result.arbitrary, ...result.unmatched]
    return declarations.some((d) => props.includes(d.property))
  })

  const exact = catSamples.filter((s) => s.kind === 'exact').length
  const total = catSamples.length

  if (total === 0) {
    console.log(`  ${category}: no samples`)
  } else {
    const pct = Math.round((exact / total) * 100)
    const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5))
    console.log(`  ${category.padEnd(14)} ${bar} ${exact}/${total} (${pct}%)`)
  }
}

console.log('')
console.log('Standard CSS arbitrary-property fallbacks (non-vendor):')
const standardArbProp = rows
  .filter((r) => r.kind === 'arbitrary-property' && !r.property.startsWith('-'))
  .map((r) => r.property)
  .sort()

const groupedFallbacks: Record<string, string[]> = {}
for (const p of standardArbProp) {
  const prefix = p.split('-').slice(0, 2).join('-')
  ;(groupedFallbacks[prefix] ??= []).push(p)
}
const sortedGroups = Object.entries(groupedFallbacks).sort((a, b) => b[1].length - a[1].length)
for (const [prefix, items] of sortedGroups.slice(0, 10)) {
  console.log(`  ${prefix}: ${items.length} (${items.slice(0, 3).join(', ')}...)`)
}
console.log(`  Total: ${standardArbProp.length}`)
