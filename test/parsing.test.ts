import { describe, expect, test } from 'bun:test'

import { twirl, type StyleInput } from '../src'
import { compileTailwindClasses, cssContainsDeclaration } from './helpers/tailwind'

type Case = {
  name: string
  style: StyleInput
  className: string
  /** Declarations the compiled classes must contain, checked with the Tailwind CLI. */
  declarations?: Array<[property: string, value: string]>
  /** Text the compiled CSS must contain, such as the at-rule a variant produces. */
  contains?: string[]
}

const cases: Case[] = [
  {
    name: 'a semicolon inside a string does not end the declaration',
    style: 'content: ";"; display: grid',
    className: "grid content-[';']",
    declarations: [['--tw-content', '";"']]
  },
  {
    name: 'a semicolon inside url() does not end the declaration',
    style: 'background-image: url(data:image/png;base64,AA); display: grid',
    className: 'grid bg-[url(data:image/png;base64,AA)]',
    declarations: [['background-image', 'url(data:image/png;base64,AA)']]
  },
  {
    name: '!important inside a string is part of the value',
    style: { content: '"!important"' },
    className: "content-['!important']"
  },
  {
    name: 'font shorthand keeps the whole family list',
    style: { font: '700 1rem/1.2 Inter, sans-serif' },
    className: 'text-base font-bold leading-[1.2] font-[Inter,_sans-serif]',
    declarations: [['font-family', 'Inter, sans-serif']]
  },
  {
    name: 'font shorthand with an unknown keyword stays whole',
    style: { font: 'small-caps 1rem Inter' },
    className: '[font:small-caps_1rem_Inter]'
  },
  {
    name: 'transition keeps a cubic-bezier timing function',
    style: { transition: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)' },
    className: 'transition-opacity duration-150 ease-[cubic-bezier(0.4,_0,_0.2,_1)]',
    declarations: [['transition-timing-function', 'cubic-bezier(.4,0,.2,1)']]
  },
  {
    name: 'several transitions stay one declaration',
    style: { transition: 'opacity 150ms, transform 300ms' },
    className: '[transition:opacity_150ms,_transform_300ms]'
  },
  {
    name: 'background image is not read as a color',
    style: { background: 'url(/a.png) no-repeat' },
    className: 'bg-[url(/a.png)] bg-no-repeat',
    declarations: [['background-image', 'url(/a.png)']]
  },
  {
    name: 'a filter inside calc() keeps its argument',
    style: { filter: 'blur(calc(4px * 2))' },
    className: 'blur-[calc(4px_*_2)]',
    contains: ['blur(calc(4px * 2))']
  },
  {
    name: 'a filter list with an unknown function stays whole',
    style: { filter: 'blur(8px) url(#noise)' },
    className: 'filter-[blur(8px)_url(#noise)]'
  },
  {
    name: 'transforms in Tailwind order convert',
    style: { transform: 'translateX(8px) rotate(45deg)' },
    className: 'translate-x-2 rotate-45'
  },
  {
    name: 'transforms out of Tailwind order stay whole',
    style: { transform: 'rotate(45deg) translateX(8px)' },
    className: '[transform:rotate(45deg)_translateX(8px)]'
  },
  {
    name: 'a transform list with an unknown function stays whole',
    style: { transform: 'rotate(45deg) matrix(1, 0, 0, 1, 0, 0)' },
    className: '[transform:rotate(45deg)_matrix(1,_0,_0,_1,_0,_0)]'
  },
  {
    name: 'a gradient stop with a position stays arbitrary',
    style: { backgroundImage: 'linear-gradient(to right, red 10%, blue)' },
    className: 'bg-[linear-gradient(to_right,_red_10%,_blue)]'
  },
  {
    name: 'a gradient stop in a color function is escaped',
    style: { backgroundImage: 'linear-gradient(to right, rgb(1 2 3), blue)' },
    className: 'bg-linear-to-r from-[rgb(1_2_3)] to-[blue]',
    declarations: [['--tw-gradient-from', '#010203']]
  },
  {
    name: 'unequal spans are not a col-span',
    style: { gridColumn: 'span 2 / span 3' },
    className: 'col-[span_2_/_span_3]'
  },
  {
    name: 'a range query keeps both bounds',
    style: { '@media (min-width: 640px) and (max-width: 1023px)': { display: 'flex' } },
    className: '[@media(min-width:_640px)_and_(max-width:_1023px)]:flex',
    contains: ['(min-width:640px) and (max-width:1023px)']
  },
  {
    name: 'features with variants stack',
    style: {
      '@media (min-width: 768px) and (prefers-reduced-motion: reduce)': { display: 'flex' }
    },
    className: 'md:motion-reduce:flex'
  },
  {
    name: 'a media type keeps the whole query',
    style: { '@media screen and (min-width: 640px)': { display: 'flex' } },
    className: '[@media_screen_and_(min-width:_640px)]:flex',
    contains: ['screen and (min-width:640px)']
  },
  {
    name: 'hover media is not the hover state',
    style: { '@media (hover: hover)': { display: 'flex' } },
    className: '[@media(hover:_hover)]:flex',
    contains: ['(hover:hover)']
  },
  {
    name: 'light scheme has no variant of its own',
    style: { '@media (prefers-color-scheme: light)': { display: 'flex' } },
    className: '[@media(prefers-color-scheme:_light)]:flex',
    contains: ['(prefers-color-scheme:light)']
  },
  {
    name: 'supports queries become arbitrary at-rule variants',
    style: { '@supports (display: grid)': { display: 'flex' } },
    className: '[@supports(display:_grid)]:flex',
    contains: ['@supports (display:grid)']
  },
  {
    name: 'a named container keeps its name',
    style: { '@container sidebar (min-width: 512px)': { display: 'flex' } },
    className: '@lg/sidebar:flex',
    contains: ['@container sidebar (min-width:32rem)']
  }
]

describe('value parsing', () => {
  test.each(cases)('$name', ({ style, className }) => {
    expect(twirl(style)).toBe(className)
  })

  test('the classes compile with Tailwind to what they were given', async () => {
    const css = await compileTailwindClasses(cases.flatMap(({ className }) => className.split(' ')))
    const flat = css.replaceAll(/\s+/g, '')
    for (const { className, declarations = [], contains = [] } of cases) {
      for (const [property, value] of declarations) {
        expect(cssContainsDeclaration(css, property, value), `${className}: ${property}`).toBe(true)
      }
      for (const text of contains) {
        expect(flat.includes(text.replaceAll(/\s+/g, '')), `${className}: ${text}\n${css}`).toBe(
          true
        )
      }
    }
  })
})
