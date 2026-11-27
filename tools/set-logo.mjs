#!/usr/bin/env node
/**
 * Bake a logo image into the bundle's client half.
 *
 * The browser cannot be handed a file path: a client module gets no config from
 * its cordis row, so the picture has to be part of client.js. This script
 * base64-embeds the image, decides which brand slot it belongs in from its
 * aspect ratio, and regenerates client.js from tools/client.template.js.
 *
 *   node tools/set-logo.mjs <image> [--mode wide|icon] [--height 24] [--aspect 4.2]
 *
 * wide  → wordmark: the name seat shows the image, the mark seat keeps the shipped icon
 * icon  → square:   the mark seat shows the image at 24px, the name seat keeps the shipped wordmark
 *
 * Without --mode the image shape decides: aspect >= 1.7 is a wordmark, anything
 * narrower is a square mark.
 */
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { pkgRoot, writeClient } from './lib/client-build.mjs'
const MIME = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
}

function usage(message) {
  if (message) console.error(`set-logo: ${message}`)
  console.error('usage: node tools/set-logo.mjs <image> [--mode wide|icon] [--height 24] [--aspect 4.2]')
  process.exit(message ? 2 : 0)
}

function parseArgs(argv) {
  const out = { image: undefined, mode: undefined, height: undefined, aspect: undefined }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--mode') out.mode = argv[++i]
    else if (arg === '--height') out.height = Number(argv[++i])
    else if (arg === '--aspect') out.aspect = Number(argv[++i])
    else if (arg === '--verbose') out.verbose = true
    else if (arg.startsWith('-')) usage(`unknown option ${arg}`)
    else if (out.image === undefined) out.image = arg
    else usage(`unexpected argument ${arg}`)
  }
  return out
}

/** Pixel aspect (width / height) of the image, or undefined when unreadable. */
function detectAspect(buffer, ext, absolutePath) {
  if (ext === '.svg') {
    const text = buffer.toString('utf8')
    const viewBox = /viewBox\s*=\s*"([^"]+)"/i.exec(text)
    if (viewBox) {
      const parts = viewBox[1].trim().split(/[\s,]+/).map(Number)
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) return parts[2] / parts[3]
    }
    const width = /(?:^|\s)width\s*=\s*"([\d.]+)/i.exec(text)
    const height = /(?:^|\s)height\s*=\s*"([\d.]+)/i.exec(text)
    if (width && height && Number(height[1]) > 0) return Number(width[1]) / Number(height[1])
    return undefined
  }
  if (ext === '.png' && buffer.length > 24 && buffer.toString('latin1', 12, 16) === 'IHDR') {
    return buffer.readUInt32BE(16) / buffer.readUInt32BE(20)
  }
  if ((ext === '.jpg' || ext === '.jpeg') && buffer.length > 4) {
    let offset = 2
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) { offset += 1; continue }
      const marker = buffer[offset + 1]
      const length = buffer.readUInt16BE(offset + 2)
      const isSof = marker >= 0xc0 && marker <= 0xcf
        && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
      if (isSof) return buffer.readUInt16BE(offset + 7) / buffer.readUInt16BE(offset + 5)
      offset += 2 + length
    }
    return undefined
  }
  if (ext === '.gif' && buffer.length > 10) {
    return buffer.readUInt16LE(6) / buffer.readUInt16LE(8)
  }
  if (ext === '.webp' && buffer.length > 30) {
    const chunk = buffer.toString('latin1', 12, 16)
    if (chunk === 'VP8X') return (buffer.readUIntLE(24, 3) + 1) / (buffer.readUIntLE(27, 3) + 1)
    if (chunk === 'VP8 ') return (buffer.readUInt16LE(26) & 0x3fff) / (buffer.readUInt16LE(28) & 0x3fff)
    if (chunk === 'VP8L') {
      const bits = buffer.readUInt32LE(21)
      return ((bits & 0x3fff) + 1) / (((bits >> 14) & 0x3fff) + 1)
    }
    return undefined
  }
  return undefined
}

const args = parseArgs(process.argv.slice(2))
if (!args.image) usage('missing image path')

const absoluteImage = resolve(args.image)
const ext = extname(absoluteImage).toLowerCase()
const mime = MIME[ext]
if (!mime) usage(`unsupported image type "${ext}" (use svg, png, jpg, webp, gif or avif)`)

const bytes = readFileSync(absoluteImage)
if (bytes.length === 0) usage(`${absoluteImage} is empty`)

const detected = detectAspect(bytes, ext, absoluteImage)
const aspect = args.aspect ?? detected
const mode = args.mode ?? (aspect === undefined ? undefined : aspect >= 1.7 ? 'wide' : 'icon')
if (mode === undefined) {
  usage(`could not read the aspect ratio of ${absoluteImage}; pass --mode wide|icon`)
}
if (mode !== 'wide' && mode !== 'icon') usage(`--mode must be wide or icon, got "${mode}"`)
const height = args.height ?? 24
if (!Number.isFinite(height) || height <= 0) usage('--height must be a positive number')

mkdirSync(join(pkgRoot, 'assets'), { recursive: true })
const assetName = `logo${ext}`
copyFileSync(absoluteImage, join(pkgRoot, 'assets', assetName))

const dataUrl = `data:${mime};base64,${bytes.toString('base64')}`
const relative = absoluteImage.startsWith(pkgRoot)
  ? absoluteImage.slice(pkgRoot.length + 1)
  : absoluteImage
const client = writeClient(
  { mode, url: dataUrl, height: mode === 'wide' ? height : 24 },
  `${relative} (${bytes.length} bytes)`,
)

console.log([
  `image    ${relative}`,
  `type     ${mime}, ${bytes.length} bytes`,
  `aspect   ${aspect === undefined ? 'unknown' : aspect.toFixed(3)}${detected === undefined ? ' (passed by hand)' : ''}`,
  `mode     ${mode}${args.mode ? '' : ' (auto)'}`,
  `height   ${mode === 'wide' ? `${height}px` : '24px (mark size)'}`,
  `client   client.js, ${(client.length / 1024).toFixed(1)} KiB`,
  `asset    assets/${assetName}`,
].join('\n'))
