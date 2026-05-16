import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export async function compileTailwindClasses(classes: Iterable<string>): Promise<string> {
  const uniqueClasses = Array.from(new Set(classes)).filter(Boolean)
  const directory = await mkdtemp(join(process.cwd(), '.tailwind-test-'))
  const input = join(directory, 'input.css')
  const output = join(directory, 'output.css')

  try {
    await writeFile(
      input,
      `@import "tailwindcss";\n@source inline("${uniqueClasses.map(escapeSourceClass).join(' ')}");\n`
    )

    const tailwindProcess = Bun.spawn({
      cmd: ['bunx', '@tailwindcss/cli', '-i', input, '-o', output, '--minify'],
      cwd: process.cwd(),
      stdout: 'pipe',
      stderr: 'pipe'
    })

    const [exitCode, stderr] = await Promise.all([
      tailwindProcess.exited,
      new Response(tailwindProcess.stderr).text()
    ])

    if (exitCode !== 0) {
      throw new Error(`Tailwind failed with exit code ${exitCode}: ${stderr}`)
    }

    return await Bun.file(output).text()
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

export async function expectTailwindCompiles(classes: Iterable<string>): Promise<string> {
  const uniqueClasses = Array.from(new Set(classes)).filter(Boolean)
  const css = await compileTailwindClasses(uniqueClasses)

  if (!css.includes('@layer') && !css.includes('{')) {
    throw new Error(`Tailwind did not emit CSS for: ${uniqueClasses.join(', ')}`)
  }

  return css
}

export function cssContainsDeclaration(css: string, property: string, value: string): boolean {
  return normalizeCss(css).includes(`${property}:${normalizeCssValue(value)}`)
}

function escapeSourceClass(className: string): string {
  return className.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function normalizeCss(css: string): string {
  return css.replace(/\\"/g, '"').replace(/\s+/g, '').toLowerCase()
}

function normalizeCssValue(value: string): string {
  return value.replace(/\s+/g, '').toLowerCase()
}
