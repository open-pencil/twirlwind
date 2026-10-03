import { describe, expect, test } from 'bun:test'

import { parseThemeVariable, twirl } from '../src'
import { compileTailwindClasses, cssContainsDeclaration } from './helpers/tailwind'

const THEME = `@theme {
  --color-brand: #ff6600;
  --color-gray-50: #f9fafb;
  --spacing-gutter: 1.5rem;
  --radius-card: 12px;
  --text-heading: 2rem;
  --font-display: "Inter", sans-serif;
  --font-weight-heavy: 850;
  --tracking-loose: 0.05em;
  --leading-snug: 1.3;
  --shadow-card: 0 1px 2px rgb(0 0 0 / 0.1);
}`

const variables = [...THEME.matchAll(/(--[\w-]+):/g)].map((match) => match[1] ?? '')

const cases: Array<[property: string, variable: string, className: string]> = [
  ['background-color', '--color-brand', 'bg-brand'],
  ['color', '--color-gray-50', 'text-gray-50'],
  ['border-color', '--color-brand', 'border-brand'],
  ['padding', '--spacing-gutter', 'p-gutter'],
  ['gap', '--spacing-gutter', 'gap-gutter'],
  ['width', '--spacing-gutter', 'w-gutter'],
  ['border-radius', '--radius-card', 'rounded-card'],
  ['border-top-left-radius', '--radius-card', 'rounded-tl-card'],
  ['font-size', '--text-heading', 'text-heading'],
  ['font-family', '--font-display', 'font-display'],
  ['font-weight', '--font-weight-heavy', 'font-heavy'],
  ['letter-spacing', '--tracking-loose', 'tracking-loose'],
  ['line-height', '--leading-snug', 'leading-snug']
]

describe('theme variables', () => {
  test('parse a namespace by its longest prefix', () => {
    expect(parseThemeVariable('--font-weight-bold')).toEqual({
      namespace: 'font-weight',
      key: 'bold'
    })
    expect(parseThemeVariable('font-sans')).toEqual({ namespace: 'font', key: 'sans' })
    expect(parseThemeVariable('--inset-shadow-xs')).toEqual({
      namespace: 'inset-shadow',
      key: 'xs'
    })
    expect(parseThemeVariable('--spacing-1.5')).toEqual({ namespace: 'spacing', key: '1.5' })
  })

  test('reject sub-variables, unknown namespaces, and keys a class cannot name', () => {
    expect(parseThemeVariable('--text-xl--line-height')).toBeUndefined()
    expect(parseThemeVariable('--opacity-50')).toBeUndefined()
    expect(parseThemeVariable('--color-')).toBeUndefined()
    expect(parseThemeVariable('--color-цвет')).toBeUndefined()
  })

  test.each(cases)('%s: var(%s) → %s', (property, variable, className) => {
    expect(twirl({ [property]: `var(${variable})` }, { theme: { variables } })).toBe(className)
  })

  test('map shadows, which Tailwind inlines so they compose with rings', async () => {
    expect(twirl({ boxShadow: 'var(--shadow-card)' }, { theme: { variables } })).toBe('shadow-card')
    const css = await compileTailwindClasses(['shadow-card'], THEME)
    expect(
      cssContainsDeclaration(css, '--tw-shadow', '0 1px 2px var(--tw-shadow-color,#0000001a)')
    ).toBe(true)
  })

  test('keep a reference for variables outside @theme or outside the namespace', () => {
    expect(twirl({ backgroundColor: 'var(--color-brand)' })).toBe('bg-(--color-brand)')
    expect(twirl({ padding: 'var(--color-brand)' }, { theme: { variables } })).toBe(
      'p-(--color-brand)'
    )
    expect(
      twirl({ backgroundColor: 'var(--color-brand, red)' }, { theme: { variables } })
    ).not.toBe('bg-brand')
  })

  test('compress longhands that share a theme key', () => {
    expect(
      twirl(
        {
          paddingTop: 'var(--spacing-gutter)',
          paddingRight: 'var(--spacing-gutter)',
          paddingBottom: 'var(--spacing-gutter)',
          paddingLeft: 'var(--spacing-gutter)'
        },
        { theme: { variables } }
      )
    ).toBe('p-gutter')
  })

  test('compile with Tailwind to the variable they name', async () => {
    const css = await compileTailwindClasses(
      cases.map(([, , className]) => className),
      THEME
    )
    for (const [property, variable, className] of cases) {
      expect(
        cssContainsDeclaration(css, property, `var(${variable})`),
        `${className} should set ${property}: var(${variable})\n${css}`
      ).toBe(true)
    }
  })
})
