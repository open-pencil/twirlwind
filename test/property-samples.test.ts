import { expect, test } from 'bun:test'

import { propertySamples } from '../scripts/property-samples'
import { twirl } from '../src'
import { expectTailwindCompiles } from './helpers/tailwind'

function resultKind(style: (typeof propertySamples)[number]['style']) {
  const result = twirl.convert(style)
  if (result.exact.length > 0) return 'exact'
  if (result.arbitrary.some((item) => item.className.startsWith('['))) return 'arbitrary-property'
  return 'arbitrary-value'
}

test('representative property samples hit expected conversion tiers', () => {
  for (const sample of propertySamples) {
    expect(resultKind(sample.style), sample.name).toBe(sample.expectedKind)
  }
})

test('representative property sample classes compile with Tailwind', async () => {
  const classes = propertySamples.map((sample) => twirl.convert(sample.style).className)
  const css = await expectTailwindCompiles(classes)

  expect(css.length).toBeGreaterThan(100)
})
