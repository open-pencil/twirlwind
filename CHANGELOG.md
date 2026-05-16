# Changelog

## 0.2.0

### Breaking changes

- **New API**: `twirl()` returns a class string, `twirl.convert()` returns the full result object
- Removed `styleToTailwind`, `styleToClassName`, `styleToClasses`, `cssTextToTailwind`
- Renamed types: `CssDeclaration` → `Declaration`, `StyleToTailwindOptions` → `Options`, `StyleToTailwindResult` → `Result`, `TwirlwindTheme` → `Theme`
- Removed unused options: `mode`, `tailwindVersion`, `preferThemeTokens`
- Removed `warnings` field from result (redundant with `unmatched`)

## 0.1.0

Initial release.

### Conversion

- 200+ exact CSS property → Tailwind utility mappings
- Layout: `display` (22 values), `position`, `visibility`, `flex`, `grid`, `columns`, `aspect-ratio`
- Typography: `font-size`/`weight`/`family`/`style`/`stretch`/`variant-numeric`, `line-height`, `letter-spacing`, `text-wrap`, `hyphens`, `line-clamp`
- Borders: all sides + logical (`inline-start`/`end`, `block`), radius scale + corners, width scale
- Transforms: `rotate`/`scale`/`translate` all axes + 3D, `perspective`, `transform-origin`, `backface-visibility`
- Filters: `blur`/`brightness`/`contrast`/`grayscale`/`invert`/`saturate`/`sepia`/`hue-rotate`, `drop-shadow` scale, `backdrop-filter`
- Interactivity: `cursor` (18 values), `pointer-events`, `resize`, `user-select`, `touch-action`, `overscroll`, `scroll-snap`, `scroll-behavior`
- Visual: `mix-blend-mode`, `background-blend-mode`, `opacity`, `box-shadow`, `text-shadow`, `mask` (image/mode/size/repeat/origin/clip)
- Sizing: width/height fractions, viewport units (`dvh`/`svh`/`lvh`), logical sizing (`inline-size`/`block-size`)
- Spacing: all logical properties (`margin`/`padding`/`scroll-margin`/`scroll-padding` inline/block)

### Color matching

- Full Tailwind v4 OKLCH palette (242 colors)
- Tailwind v3 hex palette (242 colors)
- `rgb()` function normalization (comma and space syntax)
- Color keywords: `inherit`, `transparent`, `currentColor`
- Opacity modifiers: `oklch(... / 50%)` → `token/50`, `rgba(..., 0.5)` → `token/50`

### Shorthand expansion

16 CSS shorthands: `margin`, `padding`, `inset`, `border` (combined + sides), `border-width`/`color`/`style`/`radius`, `font`, `background`, `transition`, `outline`, `text-decoration`, `list-style`, `overflow`, `gap`, `place-*`, `size`, `column-rule`, `scroll-margin`, `scroll-padding`, `overscroll-behavior`

### Multi-class emission

- `transform: translateX(8px) rotate(45deg)` → `translate-x-2 rotate-45`
- `filter: blur(8px) brightness(0.5)` → `blur brightness-50`
- `scroll-snap-type: x mandatory` → `snap-x snap-mandatory`

### Compression

- Margin/padding/inset/border/scroll-margin/scroll-padding axis compression
- Border-radius side compression (top/bottom/left/right, uniform)
- Gap symmetric compression

### Variants

- Pseudo-classes: `:hover`, `:focus`, `:first-child`, etc.
- Responsive: `sm`/`md`/`lg`/`xl`/`2xl`
- Media queries: `dark`, `light`, `motion-reduce`, `motion-safe`, `contrast-more`, `contrast-less`, `print`, `portrait`, `landscape`, `pointer-fine`, `pointer-coarse`
- Container queries: `@xs` through `@7xl`

### Fallback

Every CSS property produces valid Tailwind output via the three-tier fallback: exact utility → arbitrary value (`w-[37px]`) → arbitrary property (`[scroll-timeline-name:--x]`).
