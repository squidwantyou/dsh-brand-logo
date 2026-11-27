#!/usr/bin/env node
/**
 * Build client.js from tools/client.template.js.
 *
 * The template is plain DOM-free JavaScript (React.createElement only), so no
 * bundler is involved: this script only stamps the package name in.
 */
import { buildClient, pkgRoot } from './lib/client-build.mjs'
import { join } from 'node:path'

const text = buildClient()
console.log(`wrote ${join(pkgRoot, 'client.js')} (${String(text.length)} bytes)`)
