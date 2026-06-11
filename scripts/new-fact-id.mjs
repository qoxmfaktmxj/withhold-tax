#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_WIDTH = 4

export function normalizeFactIdPrefix(value) {
  const raw = String(value ?? '').trim()
  if (!raw) throw new Error('fact id prefix is required')
  const normalized = raw.startsWith('f_') ? raw : `f_${raw}`
  if (!/^f_[a-z0-9_]+$/.test(normalized)) {
    throw new Error(`invalid fact id prefix: ${raw}`)
  }
  return normalized
}

export function nextFactId(facts, prefixInput) {
  const prefix = normalizeFactIdPrefix(prefixInput)
  const pattern = new RegExp(`^${escapeRegExp(prefix)}(\\d+)$`)
  let max = 0
  let width = 0

  for (const fact of facts) {
    const match = pattern.exec(String(fact.id ?? ''))
    if (!match) continue
    max = Math.max(max, Number(match[1]))
    width = Math.max(width, match[1].length)
  }

  return `${prefix}${String(max + 1).padStart(width || DEFAULT_WIDTH, '0')}`
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function usage() {
  return [
    'Usage: node scripts/new-fact-id.mjs <prefix> [--json] [--facts <path>]',
    '',
    'Examples:',
    '  node scripts/new-fact-id.mjs ca',
    '  node scripts/new-fact-id.mjs f_yas --json',
  ].join('\n')
}

function parseArgs(argv) {
  const args = [...argv]
  const parsed = {
    prefix: '',
    json: false,
    factsPath: path.join(process.cwd(), 'content', 'facts.json'),
  }

  while (args.length) {
    const arg = args.shift()
    if (arg === '--json') {
      parsed.json = true
    } else if (arg === '--facts') {
      parsed.factsPath = args.shift() ?? ''
    } else if (!parsed.prefix) {
      parsed.prefix = arg
    } else {
      throw new Error(`unexpected argument: ${arg}`)
    }
  }

  if (!parsed.prefix) throw new Error('missing prefix')
  if (!parsed.factsPath) throw new Error('missing --facts path')
  return parsed
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2))
    const facts = JSON.parse(fs.readFileSync(options.factsPath, 'utf8'))
    const prefix = normalizeFactIdPrefix(options.prefix)
    const id = nextFactId(facts, prefix)
    const existingCount = facts.filter((fact) => String(fact.id ?? '').startsWith(prefix)).length

    if (options.json) {
      process.stdout.write(`${JSON.stringify({ prefix, nextId: id, existingCount })}\n`)
    } else {
      process.stdout.write(`${id}\n`)
    }
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n\n${usage()}\n`)
    process.exitCode = 1
  }
}

const isDirect = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
if (isDirect) {
  main()
}
