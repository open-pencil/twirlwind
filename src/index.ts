import { compressConverted } from './compress'
import { convertDeclaration } from './convert'
import { normalizeInput } from './normalize'
import { expandShorthands } from './shorthands'
import { sortConverted } from './sort'
import { resolveOptions } from './theme'
import type { Options, Result, StyleInput } from './types'

export type {
  ConvertedDeclaration,
  Declaration,
  Options,
  Result,
  StyleInput,
  StyleObject,
  StylePrimitive,
  Theme
} from './types'

function convert(input: StyleInput, options?: Options): Result {
  const resolved = resolveOptions(options)
  const declarations = expandShorthands(normalizeInput(input))
  const pairs = declarations.map((declaration) => ({
    declaration,
    converted: convertDeclaration(declaration, resolved)
  }))
  const flat = pairs.flatMap(({ converted }) => {
    if (!converted) return []
    return Array.isArray(converted) ? converted : [converted]
  })
  const sorted = sortConverted(compressConverted(flat, resolved), resolved)

  return {
    className: sorted.map(({ className }) => className).join(' '),
    classes: sorted.map(({ className }) => className),
    exact: sorted.filter((c) => c.kind === 'exact'),
    arbitrary: sorted.filter((c) => c.kind === 'arbitrary'),
    unmatched: pairs.flatMap(({ declaration, converted }) => (converted ? [] : [declaration]))
  }
}

export function twirl(input: StyleInput, options?: Options): string {
  return convert(input, options).className
}

twirl.convert = convert
