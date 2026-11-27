#!/usr/bin/env node
/**
 * Typeset the sidebar brand name instead of using an image.
 *
 * The name seat is 24px tall inside a ~180px branded row, so this renders real
 * DOM text in the app's brand face (Montserrat, shipped with ui-theme) rather
 * than baking an image: the lockup stays crisp at every DPI, follows the theme's
 * ink colour, and needs no font embedding.
 *
 *   node tools/set-text.mjs [WORD ...] [--size 12] [--tracking 0.15em] [--gap 6]
 *                           [--weights 500,300] [--opacity 1,0.55] [--case upper|none]
 *
 * Every WORD becomes one span; the first word carries the heavier weight, so
 * `DEEPSEEK HARNESS` reads as one lockup with a secondary second word. The mark
 * seat keeps the shipped whale icon.
 */
import { pkgRoot, writeClient } from './lib/client-build.mjs'

function usage(message) {
  if (message) console.error(`set-text: ${message}`)
  console.error('usage: node tools/set-text.mjs [WORD ...] [--size 12] [--tracking 0.15em] [--gap 6] [--weights 500,300] [--opacity 1,0.55] [--case upper|none]')
  process.exit(message ? 2 : 0)
}

const numbers = (value, count, fallback) => {
  const parts = value.split(',').map(Number)
  if (parts.length !== count || parts.some((n) => !Number.isFinite(n))) usage(`expected ${count} comma-separated numbers, got "${value}"`)
  return parts
}

const options = {
  size: 12,
  tracking: '0.15em',
  gap: 6,
  font: 'var(--dsw-font-family-brand)',
  weights: undefined,
  opacity: undefined,
  transform: 'uppercase',
}
const words = []
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i]
  if (arg === '--size') options.size = Number(process.argv[++i])
  else if (arg === '--tracking') options.tracking = process.argv[++i]
  else if (arg === '--gap') options.gap = Number(process.argv[++i])
  else if (arg === '--font') options.font = process.argv[++i]
  else if (arg === '--weights') options.weights = process.argv[++i]
  else if (arg === '--opacity') options.opacity = process.argv[++i]
  else if (arg === '--case') options.transform = process.argv[++i] === 'none' ? 'none' : 'uppercase'
  else if (arg.startsWith('-')) usage(`unknown option ${arg}`)
  else words.push(arg)
}

if (words.length === 0) words.push('DEEPSEEK', 'HARNESS')
if (words.length > 3) usage('at most three words fit the 24px name seat')
if (!Number.isFinite(options.size) || options.size < 8 || options.size > 20) usage('--size must be between 8 and 20')
if (!Number.isFinite(options.gap) || options.gap < 0) usage('--gap must be a non-negative number')

const weights = options.weights === undefined
  ? words.map((_, index) => (index === 0 ? 500 : 300))
  : numbers(options.weights, words.length, 400)
const opacities = options.opacity === undefined
  ? words.map((_, index) => (index === 0 ? 1 : 0.55))
  : numbers(options.opacity, words.length, 1)

const config = {
  mode: 'text',
  parts: words.map((text, index) => ({ text, weight: weights[index], opacity: opacities[index] })),
  font: options.font,
  size: options.size,
  tracking: options.tracking,
  gap: options.gap,
  transform: options.transform,
}
const client = writeClient(config, `typeset: ${words.join(' + ')}`)

// Rough advance width, only to catch a lockup that overflows the row.
const trackingEm = Number.parseFloat(options.tracking) || 0
const width = words.reduce((sum, word) => sum + word.length * (options.size * 0.66 + trackingEm * options.size), 0)
  + options.gap * (words.length - 1)

console.log([
  `words    ${words.join(' + ')}`,
  `weights  ${weights.join(', ')} / opacity ${opacities.join(', ')}`,
  `type     ${options.size}px, tracking ${options.tracking}, gap ${options.gap}px, ${options.transform}`,
  `font     ${options.font}`,
  `width    ~${Math.round(width)}px (brand row offers ~180px)`,
  `client   client.js, ${(client.length / 1024).toFixed(1)} KiB`,
].join('\n'))
