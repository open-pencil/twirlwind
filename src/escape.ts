export function escapeArbitraryValue(value: string): string {
  return value
    .trim()
    .replace(/\\/g, '\\\\')
    .replace(/_/g, '\\_')
    .replace(/\s+/g, '_')
    .replace(/]/g, '\\]')
}

export function arbitraryValue(prefix: string, value: string): string {
  return `${prefix}-[${escapeArbitraryValue(value)}]`
}

export function arbitraryProperty(property: string, value: string): string {
  return `[${property}:${escapeArbitraryValue(value)}]`
}
