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
  /**
   * Custom properties declared in `@theme`, such as `--color-brand`. A whole `var()` value
   * naming one, on a property its namespace drives, becomes that utility: `bg-brand`.
   * Variables in `:root` generate no utilities, so leave them out.
   */
  variables?: readonly string[]
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
  theme: Required<Omit<Theme, 'variables'>> & { variables: ReadonlySet<string> }
}
