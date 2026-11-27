/**
 * Shared writer: renders tools/client.template.js with one brand config and
 * writes the bundle's client.js.
 *
 * A client module receives no config from its cordis row, so the picture (or
 * the type settings) has to be compiled into client.js.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const pkgRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))))

/**
 * @param {object} config brand config compiled into `BRAND`
 * @param {string} source short provenance note shown in the generated header
 * @returns {string} the written client.js text
 */
export function writeClient(config, source) {
  const template = readFileSync(join(pkgRoot, 'tools', 'client.template.js'), 'utf8')
  if (!template.includes('__BRAND_CONFIG__')) throw new Error('client.template.js lost its __BRAND_CONFIG__ token')
  if (!template.includes('__PACKAGE_NAME__')) throw new Error('client.template.js lost its __PACKAGE_NAME__ token')
  const name = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8')).name
  const client = template
    .replace('__PACKAGE_NAME__', JSON.stringify(name))
    .replace('__BRAND_CONFIG__', JSON.stringify(config, null, 2).replace(/\n/g, '\n    '))
    .replaceAll('__LOGO_SOURCE__', source)
  writeFileSync(join(pkgRoot, 'client.js'), client)
  return client
}
