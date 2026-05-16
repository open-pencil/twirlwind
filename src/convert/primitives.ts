import type { ResolvedOptions } from '../types'

export function spacingToken(value: string, options: ResolvedOptions): string | undefined {
  const normalized = value.trim().toLowerCase()
  const negative = normalized.startsWith('-')
  const absolute = negative ? normalized.slice(1) : normalized
  if (absolute === '0' || absolute === '0px' || absolute === '0rem') return '0'
  if (absolute === '1px') return negative ? '-px' : 'px'

  const rem = parseRem(absolute) ?? parsePxAsRem(absolute)
  if (rem === undefined) return undefined

  const token = rem / 0.25
  if (!Number.isFinite(token)) return undefined

  const integerToken = Math.round(token)
  if (Math.abs(token - integerToken) < 0.000001) {
    return negative ? `-${integerToken}` : String(integerToken)
  }

  if (options.numericMultipliers !== 'all') return undefined
  if (Math.abs(token - Math.round(token * 4) / 4) > 0.000001) return undefined

  const tokenName = String(token).replace(/\.([0-9]*?)0+$/, '.$1')
  return negative ? `-${tokenName}` : tokenName
}

function parseRem(value: string): number | undefined {
  if (!value.endsWith('rem')) return undefined
  const parsed = Number(value.slice(0, -3))
  return Number.isFinite(parsed) ? parsed : undefined
}

function parsePxAsRem(value: string): number | undefined {
  if (!value.endsWith('px')) return undefined
  const parsed = Number(value.slice(0, -2))
  return Number.isFinite(parsed) ? parsed / 16 : undefined
}
