import { expect, test } from 'bun:test'

import { twirl } from '../src'
import { conversionCases } from './fixtures/conversion-cases'
import {
  compileTailwindClasses,
  cssContainsDeclaration,
  expectTailwindCompiles
} from './helpers/tailwind'

test('conversion fixture classes compile with Tailwind', async () => {
  const emitted = conversionCases.flatMap(({ style }) => twirl.convert(style).classes)
  const css = await expectTailwindCompiles(emitted)

  expect(css.length).toBeGreaterThan(100)
})

test('conversion fixture classes compile to expected declarations', async () => {
  const classes = conversionCases.map(({ style }) => twirl.convert(style).className)
  const css = await compileTailwindClasses(classes)

  for (const { style, declarations = [] } of conversionCases) {
    const className = twirl.convert(style).className
    for (const [property, value] of declarations) {
      expect(
        cssContainsDeclaration(css, property, value),
        `${className}\n${property}: ${value}\n${css}`
      ).toBe(true)
    }
  }
})

test('MDN arbitrary property fallback classes compile with Tailwind', async () => {
  const data = await Bun.file('node_modules/mdn-data/css/properties.json').json()
  const properties = Object.keys(data as Record<string, unknown>)
  const classes = properties.map((property) => twirl.convert({ [property]: 'initial' }).className)
  const css = await expectTailwindCompiles(classes)

  expect(cssContainsDeclaration(css, 'scroll-timeline-name', 'initial')).toBe(true)
  expect(cssContainsDeclaration(css, 'corner-shape', 'initial')).toBe(true)
})
