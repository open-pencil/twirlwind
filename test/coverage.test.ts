import { expect, test } from 'bun:test'

import { twirl } from '../src'

test('falls back for every MDN CSS property', async () => {
  const data = await Bun.file('node_modules/mdn-data/css/properties.json').json()
  const properties = Object.keys(data as Record<string, unknown>)

  expect(properties.length).toBeGreaterThan(500)

  for (const property of properties) {
    const result = twirl.convert({ [property]: 'initial' })
    expect(result.className, property).not.toBe('')
  }
})
