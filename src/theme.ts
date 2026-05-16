import { tailwindColors } from './colors'
import type { Options, ResolvedOptions, Theme } from './types'

export const defaultTheme: Required<Theme> = {
  spacing: {},
  colors: tailwindColors
}

export function resolveOptions(options: Options = {}): ResolvedOptions {
  return {
    theme: {
      spacing: { ...defaultTheme.spacing, ...options.theme?.spacing },
      colors: { ...defaultTheme.colors, ...options.theme?.colors }
    },
    allowArbitraryValues: options.allowArbitraryValues ?? true,
    allowArbitraryProperties: options.allowArbitraryProperties ?? true,
    compression: options.compression ?? 'safe',
    sort: options.sort ?? 'grouped',
    important: options.important ?? false,
    colorMatch: options.colorMatch ?? 'exact',
    numericMultipliers: options.numericMultipliers ?? 'integer'
  }
}
