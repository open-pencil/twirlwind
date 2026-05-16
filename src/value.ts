export function splitCssValueList(value: string): string[] {
  const parts: string[] = []
  let current = ''
  let depth = 0
  let quote: string | undefined

  for (const char of value.trim()) {
    if (quote) {
      current += char
      if (char === quote) quote = undefined
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      current += char
      continue
    }

    if (char === '(') depth += 1
    if (char === ')') depth = Math.max(0, depth - 1)

    if (/\s/.test(char) && depth === 0) {
      if (current) {
        parts.push(current)
        current = ''
      }
      continue
    }

    current += char
  }

  if (current) parts.push(current)
  return parts
}

export function splitCssCommaList(value: string): string[] {
  const parts: string[] = []
  let current = ''
  let depth = 0
  let quote: string | undefined

  for (const char of value.trim()) {
    if (quote) {
      current += char
      if (char === quote) quote = undefined
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      current += char
      continue
    }

    if (char === '(') depth += 1
    if (char === ')') depth = Math.max(0, depth - 1)

    if (char === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  if (current) parts.push(current.trim())
  return parts
}
