#!/usr/bin/env node
// Anti-drift guard: every example must pull @rhinestone/sdk from the workspace
// catalog (the single pinned version in pnpm-workspace.yaml), never its own
// hardcoded version. Combined with the typecheck job, this guarantees all
// examples build against one SDK version and can't silently lag.
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ws = readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf8')

const catalogPin = ws.match(/['"]?@rhinestone\/sdk['"]?:\s*(\S+)/)?.[1]
if (!catalogPin) {
  console.error('Could not find @rhinestone/sdk in the pnpm-workspace.yaml catalog.')
  process.exit(1)
}

const packagesBlock = ws.split(/^catalog:/m)[0]
const dirs = [...packagesBlock.matchAll(/^\s*-\s*['"]?([^'"\n]+?)['"]?\s*$/gm)].map((m) => m[1])

const errors = []
for (const dir of dirs) {
  let pkg
  try {
    pkg = JSON.parse(readFileSync(join(root, dir, 'package.json'), 'utf8'))
  } catch {
    continue
  }
  const dep = pkg.dependencies?.['@rhinestone/sdk'] ?? pkg.devDependencies?.['@rhinestone/sdk']
  if (!dep) continue
  if (dep !== 'catalog:') {
    errors.push(`  ${dir}: @rhinestone/sdk is "${dep}" — must be "catalog:" (pinned to ${catalogPin})`)
  }
}

if (errors.length) {
  console.error('SDK version drift detected:\n' + errors.join('\n'))
  console.error('\nFix: set the dependency to "catalog:" and bump the catalog pin in pnpm-workspace.yaml.')
  process.exit(1)
}

console.log(`All examples pin @rhinestone/sdk via catalog (${catalogPin}).`)
