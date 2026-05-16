import { expect, test } from 'bun:test'

import { twirl } from '../src'
import { expectTailwindCompiles } from './helpers/tailwind'

test('empty and null inputs produce no output', () => {
  expect(twirl({})).toBe('')
  expect(twirl('')).toBe('')
  expect(twirl.convert({}).classes).toEqual([])
  expect(twirl.convert({ color: null }).classes).toEqual([])
  expect(twirl.convert({ color: undefined }).classes).toEqual([])
  expect(twirl.convert({ color: '' }).classes).toEqual([])
})

test('numeric zero values are handled correctly', () => {
  expect(twirl({ margin: 0 })).toBe('m-0')
  expect(twirl({ padding: 0 })).toBe('p-0')
  expect(twirl({ top: 0 })).toBe('top-0')
  expect(twirl({ opacity: 0 })).toBe('opacity-0')
  expect(twirl({ zIndex: 0 })).toBe('z-0')
  expect(twirl({ borderWidth: 0 })).toBe('border-0')
})

test('negative values produce negative classes', () => {
  expect(twirl({ marginTop: '-8px' })).toBe('-mt-2')
  expect(twirl({ zIndex: -10 })).toBe('-z-10')
  expect(twirl({ rotate: '-45deg' })).toBe('-rotate-45')
  expect(twirl({ translateX: '-16px' })).toBe('-translate-x-4')
})

test('!important modifier is preserved', () => {
  expect(twirl({ display: 'flex !important' })).toBe('!flex')
  expect(twirl({ color: 'white !important' })).toBe('!text-white')
})

test('vendor-prefixed properties are normalized', () => {
  expect(twirl({ WebkitLineClamp: 3 })).toBe('line-clamp-3')
  expect(twirl({ WebkitFontSmoothing: 'antialiased' })).toBe('antialiased')
  expect(twirl({ MozOsxFontSmoothing: 'grayscale' })).toBe('antialiased')
})

test('camelCase to kebab-case normalization', () => {
  expect(twirl({ backgroundColor: 'white' })).toBe('bg-white')
  expect(twirl({ borderTopLeftRadius: '9999px' })).toBe('rounded-tl-full')
  expect(twirl({ textDecorationLine: 'underline' })).toBe('underline')
  expect(twirl({ gridTemplateColumns: 'none' })).toBe('grid-cols-none')
})

test('CSS string input parsing', () => {
  const r1 = twirl.convert('display: flex; padding: 16px').classes
  expect(r1).toContain('flex')
  expect(r1).toContain('p-4')

  const r2 = twirl.convert('color: white; font-weight: 700').classes
  expect(r2).toContain('text-white')
  expect(r2).toContain('font-bold')

  const r3 = twirl.convert('margin: 0 auto').classes
  expect(r3).toContain('my-0')
  expect(r3).toContain('mx-auto')
})

test('nested pseudo/media variants', () => {
  expect(twirl({ ':hover': { color: 'white' } })).toBe('hover:text-white')
  expect(twirl({ '&:focus': { opacity: 0.5 } })).toBe('focus:opacity-50')
  expect(twirl({ '@media (min-width: 768px)': { display: 'flex' } })).toBe('md:flex')
  expect(twirl({ '@media (prefers-color-scheme: dark)': { color: 'white' } })).toBe(
    'dark:text-white'
  )
  expect(twirl({ '@container (min-width: 512px)': { display: 'flex' } })).toBe('@lg:flex')
})

test('multi-value transform produces multiple classes', () => {
  const result = twirl.convert({ transform: 'translateX(8px) rotate(45deg)' })
  expect(result.classes).toContain('translate-x-2')
  expect(result.classes).toContain('rotate-45')
  expect(result.exact.length).toBe(2)
})

test('multi-value filter produces multiple classes', () => {
  const result = twirl.convert({ filter: 'blur(8px) brightness(0.5)' })
  expect(result.classes).toContain('blur')
  expect(result.classes).toContain('brightness-50')
  expect(result.exact.length).toBe(2)
})

test('scroll-snap-type decomposes to axis + strictness', () => {
  const result = twirl.convert({ scrollSnapType: 'x mandatory' })
  expect(result.classes).toContain('snap-x')
  expect(result.classes).toContain('snap-mandatory')
})

test('color matching across formats', () => {
  expect(twirl({ color: 'white' })).toBe('text-white')
  expect(twirl({ color: '#ef4444' })).toBe('text-red-500')
  expect(twirl({ color: 'rgb(239, 68, 68)' })).toBe('text-red-500')
  expect(twirl({ color: 'rgb(59 130 246)' })).toBe('text-blue-500')
  expect(twirl({ color: 'oklch(62.3% 0.214 259.815)' })).toBe('text-blue-500')
  expect(twirl({ color: 'currentColor' })).toBe('text-current')
  expect(twirl({ color: 'inherit' })).toBe('text-inherit')
  expect(twirl({ color: 'transparent' })).toBe('text-transparent')
})

test('color opacity modifiers', () => {
  expect(twirl({ color: 'oklch(62.3% 0.214 259.815 / 50%)' })).toBe('text-blue-500/50')
  expect(twirl({ backgroundColor: 'rgba(0, 0, 0, 0.5)' })).toBe('bg-black/50')
})

test('shorthand expansion produces correct output', () => {
  expect(twirl({ border: '1px solid' })).toBe('border border-solid')
  expect(twirl({ font: 'bold 16px sans-serif' })).toContain('font-bold')
  expect(twirl({ background: 'white center no-repeat' })).toContain('bg-white')
  expect(twirl({ overflow: 'hidden auto' })).toBe('overflow-x-hidden overflow-y-auto')
  expect(twirl({ size: '16px' })).toBe('w-4 h-4')
  expect(twirl({ listStyle: 'inside disc' })).toContain('list-inside')
})

test('compression produces clean output', () => {
  expect(twirl({ inset: '0' })).toBe('inset-0')
  expect(twirl({ margin: '8px' })).toBe('m-2')
  expect(twirl({ padding: '8px 16px' })).toBe('py-2 px-4')
  const r = twirl.convert({ borderRadius: '4px 4px 4px 4px' }).classes
  expect(r).toContain('rounded-sm')
  const r2 = twirl.convert({ borderRadius: '8px 4px 4px 8px' }).classes
  expect(r2).toContain('rounded-l-lg')
  expect(r2).toContain('rounded-r-sm')
  expect(twirl({ gap: '8px 8px' })).toBe('gap-2')
})

test('arbitrary property fallback for unknown CSS', () => {
  const result = twirl.convert({ scrollTimelineName: '--x' })
  expect(result.classes).toEqual(['[scroll-timeline-name:--x]'])
  expect(result.arbitrary.length).toBe(1)
})

test('arbitrary value fallback for known namespace', () => {
  const result = twirl.convert({ width: '37px' })
  expect(result.classes).toEqual(['w-[37px]'])
  expect(result.arbitrary.length).toBe(1)
})

test('edge case class output compiles with Tailwind', async () => {
  const inputs = [
    { display: 'flex' },
    { transform: 'translateX(8px) rotate(45deg)' },
    { filter: 'blur(8px) brightness(0.5)' },
    { border: '2px solid white' },
    { scrollSnapType: 'x mandatory' },
    { inset: '0' },
    { borderRadius: '8px 4px' },
    { color: '#ef4444' },
    { backgroundColor: 'oklch(62.3% 0.214 259.815 / 50%)' },
    { width: '37px' },
    { scrollTimelineName: '--x' },
    { gap: '8px 16px' },
    { size: '16px 32px' },
    { overflow: 'hidden auto' },
    { ':hover': { color: 'white' } }
  ]

  const classes = inputs.map((input) => twirl.convert(input).className)
  const css = await expectTailwindCompiles(classes)
  expect(css.length).toBeGreaterThan(100)
})
