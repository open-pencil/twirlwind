import type { StyleObject } from '../../src'

export type ConversionCase = {
  name: string
  style: StyleObject
  className: string
  declarations?: Array<[property: string, value: string]>
}

export const conversionCases: ConversionCase[] = [
  {
    name: 'common object styles',
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      width: '37px',
      backgroundColor: 'oklch(62.3% 0.214 259.815)',
      color: 'white',
      WebkitLineClamp: 3
    },
    className: 'flex p-4 justify-center items-center w-[37px] text-white bg-blue-500 line-clamp-3',
    declarations: [
      ['display', 'flex'],
      ['padding', 'calc(var(--spacing)*4)'],
      ['justify-content', 'center'],
      ['align-items', 'center'],
      ['width', '37px'],
      ['color', 'var(--color-white)'],
      ['background-color', 'var(--color-blue-500)']
    ]
  },
  {
    name: 'box shorthand axis compression',
    style: { padding: '16px 8px', margin: '0 auto' },
    className: 'my-0 mx-auto py-4 px-2',
    declarations: [
      ['margin-inline', 'auto'],
      ['padding-inline', 'calc(var(--spacing)*2)']
    ]
  },
  {
    name: 'negative spacing',
    style: { marginTop: -16, left: '-8px' },
    className: '-left-2 -mt-4',
    declarations: [
      ['left', 'calc(var(--spacing)*-2)'],
      ['margin-top', 'calc(var(--spacing)*-4)']
    ]
  },
  {
    name: 'sizing aliases',
    style: { width: '100%', height: '100vh' },
    className: 'w-full h-screen',
    declarations: [
      ['width', '100%'],
      ['height', '100vh']
    ]
  },
  {
    name: 'arbitrary property fallback',
    style: { scrollTimelineName: '--x' },
    className: '[scroll-timeline-name:--x]',
    declarations: [['scroll-timeline-name', '--x']]
  },
  {
    name: 'simple transforms',
    style: { rotate: '45deg', scale: '1.05' },
    className: 'rotate-45 scale-105',
    declarations: [
      ['rotate', '45deg'],
      ['--tw-scale-x', '105%']
    ]
  }
]
