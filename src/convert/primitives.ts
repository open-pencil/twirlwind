import { dimension } from '../css'
import type { ResolvedOptions } from '../types'

/** A length as a multiple of Tailwind's `--spacing` (0.25rem): `16px` and `1rem` are `4`. */
export function spacingToken(value: string, options: ResolvedOptions): string | undefined {
  const length = dimension(value)
  if (!length) return undefined
  const negative = length.number < 0
  const absolute = Math.abs(length.number)

  if (absolute === 0 && (length.unit === '' || length.unit === 'px' || length.unit === 'rem'))
    return '0'
  if (absolute === 1 && length.unit === 'px') return negative ? '-px' : 'px'

  const rem = length.unit === 'rem' ? absolute : length.unit === 'px' ? absolute / 16 : undefined
  if (rem === undefined) return undefined

  const token = rem / 0.25
  if (!Number.isFinite(token)) return undefined

  const integerToken = Math.round(token)
  if (Math.abs(token - integerToken) < 0.000001) {
    return negative ? `-${integerToken}` : String(integerToken)
  }

  if (options.numericMultipliers !== 'all') return undefined
  const quarter = Math.round(token * 4) / 4
  if (Math.abs(token - quarter) > 0.000001) return undefined

  return negative ? `-${quarter}` : String(quarter)
}
