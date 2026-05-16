import { expect, test } from 'bun:test'

import { twirl } from '../src'
import { conversionCases } from './fixtures/conversion-cases'

test.each(conversionCases)('$name', ({ style, className }) => {
  expect(twirl.convert(style).className).toBe(className)
})

test('parses CSS declaration strings', () => {
  expect(twirl.convert('display: grid; padding-top: 8px').className).toBe('grid pt-2')
})

test('supports nested pseudo and media variants', () => {
  expect(
    twirl.convert({
      color: 'white',
      ':hover': { color: 'black' },
      '@media (min-width: 768px)': { display: 'flex' }
    }).className
  ).toBe('md:flex text-white hover:text-black')
})
