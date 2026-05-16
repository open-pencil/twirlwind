import { expect, test } from 'bun:test'

import { twirl } from '../src'
import { compileTailwindClasses, cssContainsDeclaration } from './helpers/tailwind'

const cases = [
  [{ width: 'calc(100% - 1rem)' }, 'width', 'calc(100% - 1rem)'],
  [
    { gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))' },
    'grid-template-columns',
    'repeat(auto-fit,minmax(0,1fr))'
  ],
  [
    { backgroundImage: 'url("https://example.com/a%20b.png")' },
    'background-image',
    'url("https://example.com/a%20b.png")'
  ],
  [{ color: 'rgb(1 2 3)' }, 'color', '#010203'],
  [{ content: '"hello world"' }, 'content', '"hello world"']
] as const

test('arbitrary values and properties survive Tailwind compilation', async () => {
  const classes = cases.map(([style]) => twirl.convert(style).className)
  const css = await compileTailwindClasses(classes)

  for (const [, property, value] of cases) {
    expect(cssContainsDeclaration(css, property, value), `${property}: ${value}\n${css}`).toBe(true)
  }
})
