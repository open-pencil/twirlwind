# Changelog

## Unreleased

### New features

- **Theme variables**: `theme.variables` lists the custom properties declared in `@theme`; a `var()` naming one on a property its namespace drives becomes that utility: `background-color: var(--color-brand)` → `bg-brand`, `padding: var(--spacing-gutter)` → `p-gutter`. Other variables stay `bg-(--color-brand)`.
- **`themeNamespaces` and `parseThemeVariable`**: the Tailwind v4 theme namespaces, and a parser that splits `--font-weight-bold` into namespace and key by longest prefix.

### Fixes

- **CSS values are parsed, not pattern-matched**, with `postcss-value-parser` (new dependency). Semicolons in strings and `url()` no longer split a declaration string, `!important` inside a string stays in the value, and functions nested in arguments (`blur(calc(4px * 2))`) keep their arguments.
- **Shorthands expand only when every part is understood.** `font` keeps its whole family list and reads a bare number as a weight, `transition` keeps `cubic-bezier()` and leaves lists of transitions whole, and `background: url(…)` is an image rather than a color. Anything else stays one arbitrary declaration instead of losing parts.
- **Filter and transform lists convert all or nothing.** A list with an unknown function stays arbitrary, and a transform converts only when its functions follow Tailwind's own order (translate, rotate, scale), since other orders produce a different matrix.
- **Media queries map to variants only when exact.** `(min-width: 640px) and (max-width: 1023px)` no longer becomes `sm:`; features joined by `and` stack (`md:motion-reduce:`); queries with a media type, `(hover: hover)` (not the `hover:` state) or `prefers-color-scheme: light` become arbitrary at-rule variants such as `[@media(hover:_hover)]:`. `@supports` and unmatched `@container` queries use the same form, which Tailwind generates, instead of `supports-[…]` with unescaped spaces and `@container-[…]`, which it ignored. Named containers keep their name (`@lg/sidebar`).
- **Smaller fixes:** gradient stops with positions stay arbitrary instead of dropping the position; arbitrary gradient colors are escaped; `span 2 / span 3` is no longer `col-span-2`; `rgb()` alpha in percent and `opacity`, `zoom` and `scale` in percent convert.

## 0.3.0

### New features

- **`var()` references** → Tailwind v4 variable syntax: `color: var(--brand)` → `text-(--brand)`
- **Box shadow scale matching**: `box-shadow: 0 1px 3px ...` → `shadow-sm` (xs through 2xl + inner)
- **Linear gradient parsing**: `linear-gradient(to right, #ef4444, #3b82f6)` → `bg-linear-to-r from-red-500 to-blue-500`
- **Scrollbar utilities**: `scrollbar-width`, `scrollbar-gutter`, `scrollbar-color`
- **Mask utilities**: `mask-type`, `mask-composite` exact mappings
- **Perspective origin**: keyword and percentage positions
- **Skew property**: individual `skew`/`skew-x`/`skew-y` CSS properties
- **Font feature settings**: arbitrary prefix

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
