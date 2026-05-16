# Twirlwind

Tailwind v4-first CSS-to-utility-class serializer for JavaScript/TypeScript.

Converts style objects, CSS declaration strings, and `CSSStyleDeclaration` values into clean Tailwind utility classes. Prefers canonical utilities, falls back to arbitrary values, then arbitrary properties — every CSS property produces valid output.

## Install

```sh
npm install twirlwind
```

## Usage

```ts
import { twirl } from 'twirlwind'

twirl({ display: 'flex', padding: '16px 8px', color: '#ef4444' })
// → "flex py-4 px-2 text-red-500"
```

### Inputs

`twirl()` accepts any of these and returns a class string:

```ts
// Style object
twirl({ backgroundColor: 'white', fontSize: '16px' })

// CSS string
twirl('display: flex; padding: 16px')

// CSSStyleDeclaration (browser)
twirl(element.style)

// Computed styles
twirl(getComputedStyle(element))
```

### Detailed result

Use `twirl.convert()` when you need metadata:

```ts
const result = twirl.convert({ display: 'flex', width: '37px' })

result.className // "flex w-[37px]"
result.classes // ["flex", "w-[37px]"]
result.exact // exact utility matches
result.arbitrary // arbitrary value/property fallbacks
result.unmatched // declarations that couldn't be converted
```

## Features

### Color matching

Matches across formats — OKLCH, hex, `rgb()`, keywords, opacity modifiers.

```ts
twirl({ color: '#ef4444' }) // "text-red-500"
twirl({ color: 'rgb(59 130 246)' }) // "text-blue-500"
twirl({ color: 'oklch(62.3% 0.214 259.815 / 50%)' }) // "text-blue-500/50"
twirl({ color: 'currentColor' }) // "text-current"
```

### Shorthand expansion

CSS shorthands decompose into Tailwind longhands.

```ts
twirl({ border: '2px solid #ef4444' }) // "border-2 border-red-500 border-solid"
twirl({ font: 'bold 16px/1.5 sans-serif' }) // "font-bold text-base leading-normal font-sans"
twirl({ background: 'white center no-repeat' }) // "bg-white bg-center bg-no-repeat"
```

### Multi-value parsing

Compound `transform` and `filter` declarations decompose into individual classes.

```ts
twirl({ transform: 'translateX(8px) rotate(45deg)' }) // "rotate-45 translate-x-2"
twirl({ filter: 'blur(8px) brightness(0.75)' }) // "blur brightness-75"
twirl({ scrollSnapType: 'x mandatory' }) // "snap-x snap-mandatory"
```

### Compression

Expanded longhands compress to shorthand utilities.

```ts
twirl({ margin: '8px' }) // "m-2"
twirl({ inset: '0' }) // "inset-0"
twirl({ padding: '8px 16px' }) // "py-2 px-4"
twirl({ borderRadius: '8px' }) // "rounded-lg"
twirl({ gap: '12px 12px' }) // "gap-3"
```

### Variants

Nested objects map to Tailwind variants.

```ts
twirl({
  color: 'white',
  ':hover': { color: '#3b82f6' },
  '@media (min-width: 768px)': { display: 'grid' },
  '@media (prefers-color-scheme: dark)': { backgroundColor: 'black' },
  '@container (min-width: 512px)': { display: 'flex' }
})
// → "text-white hover:text-blue-500 md:grid dark:bg-black @lg:flex"
```

### Arbitrary fallback

Every CSS property produces valid output.

```ts
twirl({ scrollTimelineName: '--main' }) // "[scroll-timeline-name:--main]"
twirl({ width: '37px' }) // "w-[37px]"
```

## Options

```ts
twirl(input, {
  allowArbitraryValues: true, // default: true
  allowArbitraryProperties: true, // default: true
  compression: 'safe', // "none" | "safe" | "aggressive"
  sort: 'grouped', // "input" | "tailwind" | "grouped"
  colorMatch: 'exact', // "exact" | "nearest" | "none"
  numericMultipliers: 'integer', // "all" | "integer" | "never"
  theme: {
    colors: { brand: '#ff6600' },
    spacing: { '18': '4.5rem' }
  }
})
```

## How it works

1. **Normalize** — camelCase → kebab-case, numeric → px, vendor prefixes, `!important`
2. **Expand** — `margin`, `border`, `font`, `background`, `transition`, `overflow`, `gap`, etc.
3. **Convert** — exact utility → value alias → spacing token → color match → arbitrary value → arbitrary property
4. **Compress** — merge longhands back to shorthand utilities
5. **Sort** — deterministic output ordering

## License

MIT
