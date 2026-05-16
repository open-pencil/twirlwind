import type { StyleObject } from '../src'

export type PropertySample = {
  name: string
  style: StyleObject
  expectedKind: 'exact' | 'arbitrary-value' | 'arbitrary-property'
}

export const propertySamples: PropertySample[] = [
  { name: 'display flex', style: { display: 'flex' }, expectedKind: 'exact' },
  { name: 'display none', style: { display: 'none' }, expectedKind: 'exact' },
  { name: 'display flow root', style: { display: 'flow-root' }, expectedKind: 'exact' },
  { name: 'display table cell', style: { display: 'table-cell' }, expectedKind: 'exact' },
  { name: 'position absolute', style: { position: 'absolute' }, expectedKind: 'exact' },
  { name: 'visibility hidden', style: { visibility: 'hidden' }, expectedKind: 'exact' },
  { name: 'justify content center', style: { justifyContent: 'center' }, expectedKind: 'exact' },
  { name: 'justify content stretch', style: { justifyContent: 'stretch' }, expectedKind: 'exact' },
  { name: 'align items center', style: { alignItems: 'center' }, expectedKind: 'exact' },
  {
    name: 'align items last baseline',
    style: { alignItems: 'last baseline' },
    expectedKind: 'exact'
  },
  { name: 'flex direction column', style: { flexDirection: 'column' }, expectedKind: 'exact' },
  { name: 'flex shorthand one', style: { flex: '1 1 0%' }, expectedKind: 'exact' },
  { name: 'flex shorthand none', style: { flex: 'none' }, expectedKind: 'exact' },
  { name: 'flex wrap', style: { flexWrap: 'wrap' }, expectedKind: 'exact' },
  { name: 'align content baseline', style: { alignContent: 'baseline' }, expectedKind: 'exact' },
  { name: 'place content baseline', style: { placeContent: 'baseline' }, expectedKind: 'exact' },
  { name: 'place items center', style: { placeItems: 'center' }, expectedKind: 'exact' },
  { name: 'place items shorthand', style: { placeItems: 'center stretch' }, expectedKind: 'exact' },
  { name: 'justify items center', style: { justifyItems: 'center' }, expectedKind: 'exact' },
  { name: 'justify self end', style: { justifySelf: 'end' }, expectedKind: 'exact' },
  { name: 'grid auto flow dense', style: { gridAutoFlow: 'row dense' }, expectedKind: 'exact' },
  { name: 'grid auto columns fr', style: { gridAutoColumns: 'fr' }, expectedKind: 'exact' },
  { name: 'grid auto rows min', style: { gridAutoRows: 'min' }, expectedKind: 'exact' },
  {
    name: 'grid template columns three',
    style: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
    expectedKind: 'exact'
  },
  {
    name: 'grid template rows two',
    style: { gridTemplateRows: 'repeat(2, minmax(0, 1fr))' },
    expectedKind: 'exact'
  },
  { name: 'text align center', style: { textAlign: 'center' }, expectedKind: 'exact' },
  { name: 'font weight bold', style: { fontWeight: '700' }, expectedKind: 'exact' },
  { name: 'font family mono', style: { fontFamily: 'monospace' }, expectedKind: 'exact' },
  { name: 'font shorthand', style: { font: 'bold 16px/1.5 sans-serif' }, expectedKind: 'exact' },
  {
    name: 'font variant tabular',
    style: { fontVariantNumeric: 'tabular-nums' },
    expectedKind: 'exact'
  },
  {
    name: 'font smoothing antialiased',
    style: { WebkitFontSmoothing: 'antialiased' },
    expectedKind: 'exact'
  },
  {
    name: 'moz font smoothing antialiased',
    style: { MozOsxFontSmoothing: 'grayscale' },
    expectedKind: 'exact'
  },
  { name: 'font stretch condensed', style: { fontStretch: 'condensed' }, expectedKind: 'exact' },
  { name: 'font size base', style: { fontSize: '16px' }, expectedKind: 'exact' },
  { name: 'font size 4xl', style: { fontSize: '36px' }, expectedKind: 'exact' },
  { name: 'line height tight', style: { lineHeight: '1.25' }, expectedKind: 'exact' },
  { name: 'line height spacing', style: { lineHeight: '24px' }, expectedKind: 'exact' },
  { name: 'line clamp numeric', style: { lineClamp: 3 }, expectedKind: 'exact' },
  { name: 'line clamp none', style: { lineClamp: 'none' }, expectedKind: 'exact' },
  { name: 'letter spacing wide', style: { letterSpacing: '0.025em' }, expectedKind: 'exact' },
  { name: 'font style italic', style: { fontStyle: 'italic' }, expectedKind: 'exact' },
  {
    name: 'text transform uppercase',
    style: { textTransform: 'uppercase' },
    expectedKind: 'exact'
  },
  {
    name: 'text decoration underline',
    style: { textDecorationLine: 'underline' },
    expectedKind: 'exact'
  },
  {
    name: 'text decoration overline',
    style: { textDecorationLine: 'overline' },
    expectedKind: 'exact'
  },
  {
    name: 'text decoration shorthand',
    style: { textDecoration: 'underline wavy' },
    expectedKind: 'exact'
  },
  { name: 'size square', style: { size: '16px' }, expectedKind: 'exact' },
  { name: 'size different', style: { size: '16px 32px' }, expectedKind: 'exact' },
  { name: 'width full', style: { width: '100%' }, expectedKind: 'exact' },
  { name: 'width half', style: { width: '50%' }, expectedKind: 'exact' },
  { name: 'height screen', style: { height: '100vh' }, expectedKind: 'exact' },
  { name: 'height quarter', style: { height: '25%' }, expectedKind: 'exact' },
  { name: 'width dynamic viewport', style: { width: '100dvw' }, expectedKind: 'exact' },
  { name: 'height small viewport', style: { height: '100svh' }, expectedKind: 'exact' },
  { name: 'inline size spacing', style: { inlineSize: '16px' }, expectedKind: 'exact' },
  { name: 'block size spacing', style: { blockSize: '8px' }, expectedKind: 'exact' },
  { name: 'min inline size full', style: { minInlineSize: '100%' }, expectedKind: 'exact' },
  { name: 'max block size spacing', style: { maxBlockSize: '32px' }, expectedKind: 'exact' },
  { name: 'min height dynamic viewport', style: { minHeight: '100dvh' }, expectedKind: 'exact' },
  { name: 'min width half', style: { minWidth: '50%' }, expectedKind: 'exact' },
  { name: 'max width large viewport', style: { maxWidth: '100lvw' }, expectedKind: 'exact' },
  { name: 'max height half', style: { maxHeight: '50%' }, expectedKind: 'exact' },
  { name: 'padding spacing', style: { padding: '16px' }, expectedKind: 'exact' },
  { name: 'margin auto', style: { margin: 'auto' }, expectedKind: 'exact' },
  { name: 'margin inline start', style: { marginInlineStart: '16px' }, expectedKind: 'exact' },
  { name: 'margin inline pair', style: { marginInline: '8px 16px' }, expectedKind: 'exact' },
  { name: 'padding inline end', style: { paddingInlineEnd: '8px' }, expectedKind: 'exact' },
  { name: 'padding block pair', style: { paddingBlock: '4px 8px' }, expectedKind: 'exact' },
  { name: 'inset inline start', style: { insetInlineStart: '4px' }, expectedKind: 'exact' },
  { name: 'inset shorthand zero', style: { inset: '0' }, expectedKind: 'exact' },
  { name: 'inset shorthand axes', style: { inset: '0 8px' }, expectedKind: 'exact' },
  { name: 'inset block pair', style: { insetBlock: '4px 8px' }, expectedKind: 'exact' },
  { name: 'gap spacing', style: { gap: '8px' }, expectedKind: 'exact' },
  { name: 'gap shorthand', style: { gap: '8px 16px' }, expectedKind: 'exact' },
  { name: 'gap symmetric compressed', style: { gap: '12px 12px' }, expectedKind: 'exact' },
  { name: 'text indent spacing', style: { textIndent: '16px' }, expectedKind: 'exact' },
  { name: 'border spacing', style: { borderSpacing: '8px' }, expectedKind: 'exact' },
  { name: 'scroll margin top', style: { scrollMarginTop: '16px' }, expectedKind: 'exact' },
  {
    name: 'scroll margin inline start',
    style: { scrollMarginInlineStart: '8px' },
    expectedKind: 'exact'
  },
  {
    name: 'scroll margin inline pair',
    style: { scrollMarginInline: '4px 8px' },
    expectedKind: 'exact'
  },
  { name: 'scroll padding left', style: { scrollPaddingLeft: '8px' }, expectedKind: 'exact' },
  {
    name: 'scroll padding block pair',
    style: { scrollPaddingBlock: '4px 8px' },
    expectedKind: 'exact'
  },
  { name: 'z index', style: { zIndex: 10 }, expectedKind: 'exact' },
  {
    name: 'background color token',
    style: { backgroundColor: 'oklch(62.3% 0.214 259.815)' },
    expectedKind: 'exact'
  },
  { name: 'text color token', style: { color: 'white' }, expectedKind: 'exact' },
  {
    name: 'bg indigo 500',
    style: { backgroundColor: 'oklch(58.5% 0.233 277.117)' },
    expectedKind: 'exact'
  },
  { name: 'text hex red 500', style: { color: '#ef4444' }, expectedKind: 'exact' },
  { name: 'bg hex blue 500', style: { backgroundColor: '#3b82f6' }, expectedKind: 'exact' },
  { name: 'border hex slate 300', style: { borderColor: '#cbd5e1' }, expectedKind: 'exact' },
  { name: 'text rgb red 500', style: { color: 'rgb(239, 68, 68)' }, expectedKind: 'exact' },
  {
    name: 'bg rgb modern blue 500',
    style: { backgroundColor: 'rgb(59 130 246)' },
    expectedKind: 'exact'
  },
  { name: 'text rose 600', style: { color: 'oklch(58.6% 0.253 17.585)' }, expectedKind: 'exact' },
  {
    name: 'border teal 400',
    style: { borderColor: 'oklch(77.7% 0.152 181.912)' },
    expectedKind: 'exact'
  },
  {
    name: 'text blue 500 half opacity',
    style: { color: 'oklch(62.3% 0.214 259.815 / 50%)' },
    expectedKind: 'exact'
  },
  {
    name: 'bg black half opacity rgba',
    style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    expectedKind: 'exact'
  },
  { name: 'text color inherit', style: { color: 'inherit' }, expectedKind: 'exact' },
  { name: 'text color transparent', style: { color: 'transparent' }, expectedKind: 'exact' },
  { name: 'text color current', style: { color: 'currentColor' }, expectedKind: 'exact' },
  { name: 'bg inherit', style: { backgroundColor: 'inherit' }, expectedKind: 'exact' },
  {
    name: 'border color transparent',
    style: { borderColor: 'transparent' },
    expectedKind: 'exact'
  },
  { name: 'outline color current', style: { outlineColor: 'currentColor' }, expectedKind: 'exact' },
  { name: 'caret current', style: { caretColor: 'currentColor' }, expectedKind: 'exact' },
  { name: 'accent inherit', style: { accentColor: 'inherit' }, expectedKind: 'exact' },
  { name: 'accent auto', style: { accentColor: 'auto' }, expectedKind: 'exact' },
  { name: 'caret auto', style: { caretColor: 'auto' }, expectedKind: 'exact' },
  { name: 'rotate', style: { rotate: '45deg' }, expectedKind: 'exact' },
  { name: 'scale', style: { scale: '1.05' }, expectedKind: 'exact' },
  { name: 'scale x', style: { scaleX: '1.25' }, expectedKind: 'exact' },
  { name: 'scale z', style: { scaleZ: '0.5' }, expectedKind: 'exact' },
  { name: 'translate x', style: { translateX: '16px' }, expectedKind: 'exact' },
  { name: 'translate z', style: { translateZ: '16px' }, expectedKind: 'exact' },
  { name: 'translate same axes', style: { translate: '8px' }, expectedKind: 'exact' },
  {
    name: 'transform translate y',
    style: { transform: 'translateY(-8px)' },
    expectedKind: 'exact'
  },
  { name: 'transform skew x', style: { transform: 'skewX(12deg)' }, expectedKind: 'exact' },
  {
    name: 'transform multi value',
    style: { transform: 'translateX(8px) rotate(45deg)' },
    expectedKind: 'exact'
  },
  { name: 'transform rotate x', style: { transform: 'rotateX(45deg)' }, expectedKind: 'exact' },
  {
    name: 'transform rotate y negative',
    style: { transform: 'rotateY(-12deg)' },
    expectedKind: 'exact'
  },
  { name: 'transform rotate z', style: { transform: 'rotateZ(45deg)' }, expectedKind: 'exact' },
  {
    name: 'transform translate z',
    style: { transform: 'translateZ(-8px)' },
    expectedKind: 'exact'
  },
  { name: 'transform scale z', style: { transform: 'scaleZ(0.5)' }, expectedKind: 'exact' },
  {
    name: 'transform style preserve 3d',
    style: { transformStyle: 'preserve-3d' },
    expectedKind: 'exact'
  },
  {
    name: 'transform origin top right',
    style: { transformOrigin: 'top right' },
    expectedKind: 'exact'
  },
  {
    name: 'transform origin percent',
    style: { transformOrigin: '0% 100%' },
    expectedKind: 'exact'
  },
  { name: 'backface hidden', style: { backfaceVisibility: 'hidden' }, expectedKind: 'exact' },
  { name: 'perspective none', style: { perspective: 'none' }, expectedKind: 'exact' },
  { name: 'perspective normal', style: { perspective: '500px' }, expectedKind: 'exact' },
  { name: 'overflow hidden', style: { overflow: 'hidden' }, expectedKind: 'exact' },
  { name: 'overflow shorthand axes', style: { overflow: 'hidden auto' }, expectedKind: 'exact' },
  {
    name: 'container query variant',
    style: { '@container (min-width: 512px)': { display: 'flex' } },
    expectedKind: 'exact'
  },
  {
    name: 'prefers dark variant',
    style: { '@media (prefers-color-scheme: dark)': { color: 'white' } },
    expectedKind: 'exact'
  },
  {
    name: 'motion reduce variant',
    style: { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } },
    expectedKind: 'exact'
  },
  {
    name: 'print variant',
    style: { '@media print': { display: 'none' } },
    expectedKind: 'exact'
  },
  { name: 'cursor pointer', style: { cursor: 'pointer' }, expectedKind: 'exact' },
  { name: 'cursor grab', style: { cursor: 'grab' }, expectedKind: 'exact' },
  { name: 'cursor zoom in', style: { cursor: 'zoom-in' }, expectedKind: 'exact' },
  { name: 'pointer events none', style: { pointerEvents: 'none' }, expectedKind: 'exact' },
  { name: 'resize vertical', style: { resize: 'vertical' }, expectedKind: 'exact' },
  { name: 'user select none', style: { userSelect: 'none' }, expectedKind: 'exact' },
  { name: 'border combined', style: { border: '1px solid' }, expectedKind: 'exact' },
  { name: 'border top combined', style: { borderTop: '2px dashed white' }, expectedKind: 'exact' },
  { name: 'border block combined', style: { borderBlock: '1px solid' }, expectedKind: 'exact' },
  {
    name: 'border inline combined',
    style: { borderInline: '2px dashed white' },
    expectedKind: 'exact'
  },
  { name: 'border inline width', style: { borderInlineWidth: '1px' }, expectedKind: 'exact' },
  { name: 'border block color', style: { borderBlockColor: 'white' }, expectedKind: 'exact' },
  { name: 'border inline style', style: { borderInlineStyle: 'dashed' }, expectedKind: 'exact' },
  { name: 'border width', style: { borderWidth: '1px' }, expectedKind: 'exact' },
  { name: 'border width shorthand', style: { borderWidth: '1px 2px' }, expectedKind: 'exact' },
  {
    name: 'border width uniform compressed',
    style: { borderWidth: '2px 2px 2px 2px' },
    expectedKind: 'exact'
  },
  {
    name: 'border color uniform compressed',
    style: { borderColor: 'white white white white' },
    expectedKind: 'exact'
  },
  {
    name: 'scroll margin uniform compressed',
    style: { scrollMargin: '16px' },
    expectedKind: 'exact'
  },
  {
    name: 'scroll padding axis compressed',
    style: { scrollPadding: '8px 16px' },
    expectedKind: 'exact'
  },
  { name: 'border top width', style: { borderTopWidth: '1px' }, expectedKind: 'exact' },
  {
    name: 'border inline start width',
    style: { borderInlineStartWidth: '2px' },
    expectedKind: 'exact'
  },
  { name: 'border style dashed', style: { borderStyle: 'dashed' }, expectedKind: 'exact' },
  { name: 'border style shorthand', style: { borderStyle: 'solid dashed' }, expectedKind: 'exact' },
  { name: 'border top style dashed', style: { borderTopStyle: 'dashed' }, expectedKind: 'exact' },
  {
    name: 'border inline end style dashed',
    style: { borderInlineEndStyle: 'dashed' },
    expectedKind: 'exact'
  },
  { name: 'border radius full', style: { borderRadius: '9999px' }, expectedKind: 'exact' },
  { name: 'border radius large', style: { borderRadius: '8px' }, expectedKind: 'exact' },
  { name: 'border radius shorthand', style: { borderRadius: '4px 8px' }, expectedKind: 'exact' },
  {
    name: 'border radius uniform compressed',
    style: { borderRadius: '4px 4px 4px 4px' },
    expectedKind: 'exact'
  },
  {
    name: 'border radius left right compressed',
    style: { borderRadius: '8px 4px 4px 8px' },
    expectedKind: 'exact'
  },
  {
    name: 'border top right radius full',
    style: { borderTopRightRadius: '9999px' },
    expectedKind: 'exact'
  },
  {
    name: 'border top right radius large',
    style: { borderTopRightRadius: '8px' },
    expectedKind: 'exact'
  },
  {
    name: 'border top left radius small',
    style: { borderTopLeftRadius: '4px' },
    expectedKind: 'exact'
  },
  {
    name: 'border bottom right radius large',
    style: { borderBottomRightRadius: '8px' },
    expectedKind: 'exact'
  },
  {
    name: 'border bottom left radius small',
    style: { borderBottomLeftRadius: '4px' },
    expectedKind: 'exact'
  },
  {
    name: 'border start start radius large',
    style: { borderStartStartRadius: '8px' },
    expectedKind: 'exact'
  },
  {
    name: 'border end end radius full',
    style: { borderEndEndRadius: '9999px' },
    expectedKind: 'exact'
  },
  { name: 'border color token', style: { borderColor: 'white' }, expectedKind: 'exact' },
  { name: 'border color shorthand', style: { borderColor: 'white black' }, expectedKind: 'exact' },
  { name: 'border top color token', style: { borderTopColor: 'white' }, expectedKind: 'exact' },
  {
    name: 'border inline start color token',
    style: { borderInlineStartColor: 'white' },
    expectedKind: 'exact'
  },
  { name: 'outline style none', style: { outlineStyle: 'none' }, expectedKind: 'exact' },
  { name: 'outline width 2', style: { outlineWidth: '2px' }, expectedKind: 'exact' },
  { name: 'outline offset 4', style: { outlineOffset: '4px' }, expectedKind: 'exact' },
  { name: 'outline color token', style: { outlineColor: 'white' }, expectedKind: 'exact' },
  { name: 'opacity half', style: { opacity: 0.5 }, expectedKind: 'exact' },
  { name: 'object fit cover', style: { objectFit: 'cover' }, expectedKind: 'exact' },
  {
    name: 'background repeat none',
    style: { backgroundRepeat: 'no-repeat' },
    expectedKind: 'exact'
  },
  { name: 'background size cover', style: { backgroundSize: 'cover' }, expectedKind: 'exact' },
  {
    name: 'background shorthand color',
    style: { background: 'white center no-repeat' },
    expectedKind: 'exact'
  },
  {
    name: 'background position center',
    style: { backgroundPosition: 'center' },
    expectedKind: 'exact'
  },
  {
    name: 'background position center top',
    style: { backgroundPosition: 'center top' },
    expectedKind: 'exact'
  },
  { name: 'caret color token', style: { caretColor: 'white' }, expectedKind: 'exact' },
  { name: 'accent color token', style: { accentColor: 'white' }, expectedKind: 'exact' },
  {
    name: 'decoration color token',
    style: { textDecorationColor: 'white' },
    expectedKind: 'exact'
  },
  { name: 'vertical align middle', style: { verticalAlign: 'middle' }, expectedKind: 'exact' },
  { name: 'white space nowrap', style: { whiteSpace: 'nowrap' }, expectedKind: 'exact' },
  { name: 'word break all', style: { wordBreak: 'break-all' }, expectedKind: 'exact' },
  { name: 'overflow wrap anywhere', style: { overflowWrap: 'anywhere' }, expectedKind: 'exact' },
  { name: 'text overflow ellipsis', style: { textOverflow: 'ellipsis' }, expectedKind: 'exact' },
  {
    name: 'list style position inside',
    style: { listStylePosition: 'inside' },
    expectedKind: 'exact'
  },
  { name: 'list style type disc', style: { listStyleType: 'disc' }, expectedKind: 'exact' },
  { name: 'list style shorthand', style: { listStyle: 'inside disc' }, expectedKind: 'exact' },
  { name: 'table layout fixed', style: { tableLayout: 'fixed' }, expectedKind: 'exact' },
  { name: 'caption bottom', style: { captionSide: 'bottom' }, expectedKind: 'exact' },
  {
    name: 'border collapse collapse',
    style: { borderCollapse: 'collapse' },
    expectedKind: 'exact'
  },
  { name: 'box sizing border box', style: { boxSizing: 'border-box' }, expectedKind: 'exact' },
  { name: 'isolation isolate', style: { isolation: 'isolate' }, expectedKind: 'exact' },
  { name: 'float left', style: { float: 'left' }, expectedKind: 'exact' },
  { name: 'clear both', style: { clear: 'both' }, expectedKind: 'exact' },
  { name: 'appearance none', style: { appearance: 'none' }, expectedKind: 'exact' },
  { name: 'color scheme dark', style: { colorScheme: 'dark' }, expectedKind: 'exact' },
  { name: 'mix blend multiply', style: { mixBlendMode: 'multiply' }, expectedKind: 'exact' },
  {
    name: 'background blend overlay',
    style: { backgroundBlendMode: 'overlay' },
    expectedKind: 'exact'
  },
  {
    name: 'overscroll behavior contain',
    style: { overscrollBehavior: 'contain' },
    expectedKind: 'exact'
  },
  { name: 'overscroll x none', style: { overscrollBehaviorX: 'none' }, expectedKind: 'exact' },
  {
    name: 'overscroll shorthand',
    style: { overscrollBehavior: 'contain auto' },
    expectedKind: 'exact'
  },
  { name: 'scroll behavior smooth', style: { scrollBehavior: 'smooth' }, expectedKind: 'exact' },
  {
    name: 'touch action manipulation',
    style: { touchAction: 'manipulation' },
    expectedKind: 'exact'
  },
  { name: 'will change transform', style: { willChange: 'transform' }, expectedKind: 'exact' },
  { name: 'scrollbar thin', style: { scrollbarWidth: 'thin' }, expectedKind: 'exact' },
  { name: 'scrollbar none', style: { scrollbarWidth: 'none' }, expectedKind: 'exact' },
  {
    name: 'scrollbar gutter stable',
    style: { scrollbarGutter: 'stable' },
    expectedKind: 'exact'
  },
  { name: 'mask type alpha', style: { maskType: 'alpha' }, expectedKind: 'exact' },
  { name: 'mask composite add', style: { maskComposite: 'add' }, expectedKind: 'exact' },
  {
    name: 'perspective origin top right',
    style: { perspectiveOrigin: 'top right' },
    expectedKind: 'exact'
  },
  { name: 'skew property', style: { skew: '6deg' }, expectedKind: 'exact' },
  { name: 'contain content', style: { contain: 'content' }, expectedKind: 'exact' },
  { name: 'contain layout', style: { contain: 'layout' }, expectedKind: 'exact' },
  { name: 'contain inline size', style: { contain: 'inline-size' }, expectedKind: 'exact' },
  { name: 'forced color adjust none', style: { forcedColorAdjust: 'none' }, expectedKind: 'exact' },
  { name: 'tab size 4', style: { tabSize: 4 }, expectedKind: 'exact' },
  { name: 'zoom 125', style: { zoom: 1.25 }, expectedKind: 'exact' },
  { name: 'scroll snap align start', style: { scrollSnapAlign: 'start' }, expectedKind: 'exact' },
  { name: 'scroll snap type none', style: { scrollSnapType: 'none' }, expectedKind: 'exact' },
  {
    name: 'scroll snap type x mandatory',
    style: { scrollSnapType: 'x mandatory' },
    expectedKind: 'exact'
  },
  {
    name: 'scroll snap type both proximity',
    style: { scrollSnapType: 'both proximity' },
    expectedKind: 'exact'
  },
  { name: 'scroll snap stop always', style: { scrollSnapStop: 'always' }, expectedKind: 'exact' },
  {
    name: 'transition shorthand',
    style: { transition: 'all 200ms ease-in' },
    expectedKind: 'exact'
  },
  { name: 'transition duration', style: { transitionDuration: '200ms' }, expectedKind: 'exact' },
  { name: 'transition delay', style: { transitionDelay: '150ms' }, expectedKind: 'exact' },
  {
    name: 'transition property opacity',
    style: { transitionProperty: 'opacity' },
    expectedKind: 'exact'
  },
  {
    name: 'transition behavior discrete',
    style: { transitionBehavior: 'allow-discrete' },
    expectedKind: 'exact'
  },
  {
    name: 'transition timing arbitrary',
    style: { transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    expectedKind: 'arbitrary-value'
  },
  { name: 'animation none', style: { animation: 'none' }, expectedKind: 'exact' },
  {
    name: 'animation arbitrary',
    style: { animation: 'spin 1s linear infinite' },
    expectedKind: 'arbitrary-value'
  },
  { name: 'animation name none', style: { animationName: 'none' }, expectedKind: 'exact' },
  { name: 'background image none', style: { backgroundImage: 'none' }, expectedKind: 'exact' },
  { name: 'content none', style: { content: 'none' }, expectedKind: 'exact' },
  { name: 'content string', style: { content: '"hello"' }, expectedKind: 'exact' },
  { name: 'list image none', style: { listStyleImage: 'none' }, expectedKind: 'exact' },
  {
    name: 'transition timing linear',
    style: { transitionTimingFunction: 'linear' },
    expectedKind: 'exact'
  },
  { name: 'filter none', style: { filter: 'none' }, expectedKind: 'exact' },
  { name: 'filter blur', style: { filter: 'blur(8px)' }, expectedKind: 'exact' },
  { name: 'filter brightness', style: { filter: 'brightness(0.5)' }, expectedKind: 'exact' },
  { name: 'filter contrast', style: { filter: 'contrast(1.25)' }, expectedKind: 'exact' },
  { name: 'filter grayscale', style: { filter: 'grayscale(100%)' }, expectedKind: 'exact' },
  { name: 'filter hue rotate', style: { filter: 'hue-rotate(30deg)' }, expectedKind: 'exact' },
  {
    name: 'filter multi value',
    style: { filter: 'blur(8px) brightness(0.5)' },
    expectedKind: 'exact'
  },
  {
    name: 'filter drop shadow small',
    style: { filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.15))' },
    expectedKind: 'exact'
  },
  {
    name: 'filter drop shadow xl',
    style: { filter: 'drop-shadow(0 9px 7px rgb(0 0 0 / 0.1))' },
    expectedKind: 'exact'
  },
  {
    name: 'filter drop shadow xs',
    style: { filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.05))' },
    expectedKind: 'exact'
  },
  { name: 'backdrop filter blur', style: { backdropFilter: 'blur(8px)' }, expectedKind: 'exact' },
  { name: 'backdrop opacity', style: { backdropFilter: 'opacity(50%)' }, expectedKind: 'exact' },
  { name: 'backdrop filter none', style: { backdropFilter: 'none' }, expectedKind: 'exact' },
  { name: 'box shadow none', style: { boxShadow: 'none' }, expectedKind: 'exact' },
  { name: 'text shadow none', style: { textShadow: 'none' }, expectedKind: 'exact' },
  { name: 'fill color token', style: { fill: 'white' }, expectedKind: 'exact' },
  { name: 'fill none', style: { fill: 'none' }, expectedKind: 'exact' },
  { name: 'stroke color token', style: { stroke: 'white' }, expectedKind: 'exact' },
  { name: 'stroke current', style: { stroke: 'currentColor' }, expectedKind: 'exact' },
  { name: 'stroke width', style: { strokeWidth: 2 }, expectedKind: 'exact' },
  { name: 'object position center', style: { objectPosition: 'center' }, expectedKind: 'exact' },
  {
    name: 'object position center center',
    style: { objectPosition: 'center center' },
    expectedKind: 'exact'
  },
  {
    name: 'background attachment fixed',
    style: { backgroundAttachment: 'fixed' },
    expectedKind: 'exact'
  },
  {
    name: 'background clip content',
    style: { backgroundClip: 'content-box' },
    expectedKind: 'exact'
  },
  {
    name: 'background origin padding',
    style: { backgroundOrigin: 'padding-box' },
    expectedKind: 'exact'
  },
  { name: 'mask image none', style: { maskImage: 'none' }, expectedKind: 'exact' },
  { name: 'mask mode alpha', style: { maskMode: 'alpha' }, expectedKind: 'exact' },
  { name: 'mask size cover', style: { maskSize: 'cover' }, expectedKind: 'exact' },
  { name: 'mask repeat none', style: { maskRepeat: 'no-repeat' }, expectedKind: 'exact' },
  { name: 'mask origin border', style: { maskOrigin: 'border-box' }, expectedKind: 'exact' },
  { name: 'mask clip content', style: { maskClip: 'content-box' }, expectedKind: 'exact' },
  { name: 'decoration style wavy', style: { textDecorationStyle: 'wavy' }, expectedKind: 'exact' },
  {
    name: 'decoration thickness 2',
    style: { textDecorationThickness: '2px' },
    expectedKind: 'exact'
  },
  { name: 'underline offset 4', style: { textUnderlineOffset: '4px' }, expectedKind: 'exact' },
  { name: 'column count 3', style: { columnCount: 3 }, expectedKind: 'exact' },
  { name: 'columns auto', style: { columns: 'auto' }, expectedKind: 'exact' },
  { name: 'columns count shorthand', style: { columns: 3 }, expectedKind: 'exact' },
  { name: 'aspect ratio square', style: { aspectRatio: '1 / 1' }, expectedKind: 'exact' },
  { name: 'aspect ratio four thirds', style: { aspectRatio: '4 / 3' }, expectedKind: 'exact' },
  { name: 'field sizing content', style: { fieldSizing: 'content' }, expectedKind: 'exact' },
  { name: 'text wrap balance', style: { textWrap: 'balance' }, expectedKind: 'exact' },
  { name: 'flex basis full', style: { flexBasis: '100%' }, expectedKind: 'exact' },
  { name: 'flex basis fifth', style: { flexBasis: '20%' }, expectedKind: 'exact' },
  { name: 'grid column span', style: { gridColumn: 'span 2 / span 2' }, expectedKind: 'exact' },
  { name: 'grid row span', style: { gridRow: 'span 3 / span 3' }, expectedKind: 'exact' },
  { name: 'grid template none', style: { gridTemplateColumns: 'none' }, expectedKind: 'exact' },
  { name: 'grid template subgrid', style: { gridTemplateRows: 'subgrid' }, expectedKind: 'exact' },
  {
    name: 'grid template arbitrary',
    style: { gridTemplateColumns: '200px 1fr 200px' },
    expectedKind: 'arbitrary-value'
  },
  { name: 'grid column full', style: { gridColumn: '1 / -1' }, expectedKind: 'exact' },
  { name: 'grid column start', style: { gridColumnStart: 2 }, expectedKind: 'exact' },
  { name: 'grid row end', style: { gridRowEnd: 4 }, expectedKind: 'exact' },
  { name: 'box decoration clone', style: { boxDecorationBreak: 'clone' }, expectedKind: 'exact' },
  {
    name: 'webkit box decoration slice',
    style: { WebkitBoxDecorationBreak: 'slice' },
    expectedKind: 'exact'
  },
  { name: 'clip path none', style: { clipPath: 'none' }, expectedKind: 'exact' },
  { name: 'hyphens auto', style: { hyphens: 'auto' }, expectedKind: 'exact' },
  { name: 'break before page', style: { breakBefore: 'page' }, expectedKind: 'exact' },
  { name: 'break after avoid', style: { breakAfter: 'avoid' }, expectedKind: 'exact' },
  {
    name: 'break inside avoid column',
    style: { breakInside: 'avoid-column' },
    expectedKind: 'exact'
  },
  { name: 'order numeric', style: { order: 2 }, expectedKind: 'exact' },
  { name: 'flex grow', style: { flexGrow: 1 }, expectedKind: 'exact' },
  { name: 'flex shrink zero', style: { flexShrink: 0 }, expectedKind: 'exact' },
  { name: 'var reference color', style: { color: 'var(--brand)' }, expectedKind: 'exact' },
  { name: 'var reference padding', style: { padding: 'var(--gutter)' }, expectedKind: 'exact' },
  { name: 'calc width', style: { width: 'calc(100% - 2rem)' }, expectedKind: 'arbitrary-value' },
  {
    name: 'shadow sm scale',
    style: { boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' },
    expectedKind: 'exact'
  },
  {
    name: 'shadow inner',
    style: { boxShadow: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)' },
    expectedKind: 'exact'
  },
  {
    name: 'gradient to right',
    style: { backgroundImage: 'linear-gradient(to right, #ef4444, #3b82f6)' },
    expectedKind: 'exact'
  },
  {
    name: 'gradient three stops',
    style: { backgroundImage: 'linear-gradient(to bottom, #ef4444, #22c55e, #3b82f6)' },
    expectedKind: 'exact'
  },
  { name: 'arbitrary width', style: { width: '37px' }, expectedKind: 'arbitrary-value' },
  {
    name: 'arbitrary background image',
    style: { backgroundImage: 'url("https://example.com/a%20b.png")' },
    expectedKind: 'arbitrary-value'
  },
  {
    name: 'arbitrary grid template',
    style: { gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))' },
    expectedKind: 'arbitrary-value'
  },
  {
    name: 'arbitrary scroll timeline',
    style: { scrollTimelineName: '--x' },
    expectedKind: 'arbitrary-property'
  }
]
