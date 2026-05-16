export type StylePrimitive = string | number | null | undefined

export interface StyleObject {
  [property: string]: StylePrimitive | StyleObject
}

export type StyleInput =
  | string
  | StyleObject
  | CSSStyleDeclaration
  | Iterable<[string, StylePrimitive]>

export type Theme = {
  spacing?: Record<string, string>
  colors?: Record<string, string>
}

export type Options = {
  theme?: Theme
  allowArbitraryValues?: boolean
  allowArbitraryProperties?: boolean
  compression?: 'none' | 'safe' | 'aggressive'
  sort?: 'input' | 'tailwind' | 'grouped'
  important?: boolean
  colorMatch?: 'exact' | 'nearest' | 'none'
  numericMultipliers?: 'all' | 'integer' | 'never'
}

export type Declaration = {
  property: string
  value: string
  important: boolean
  variants: string[]
}

export type ConvertedDeclaration = Declaration & {
  className: string
  kind: 'exact' | 'arbitrary'
}

export type Result = {
  className: string
  classes: string[]
  exact: ConvertedDeclaration[]
  arbitrary: ConvertedDeclaration[]
  unmatched: Declaration[]
}

export type ResolvedOptions = Required<Omit<Options, 'theme'>> & {
  theme: Required<Theme>
}
