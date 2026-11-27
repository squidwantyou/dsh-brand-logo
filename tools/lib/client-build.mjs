/**
 * Renderer: stamps the package name into tools/client.template.js and writes
 * the bundle's client.js.
 *
 * The brand values themselves are no longer compiled in — they live in the
 * Settings document, so `dsh plugin add` + a Settings edit is enough to
 * rebrand. The package name still has to be baked in because a client module
 * receives no config from its cordis row.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const pkgRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))))

/**
 * @returns {string} the written client.js text
 */
export function buildClient() {
  const template = readFileSync(join(pkgRoot, 'tools', 'client.template.js'), 'utf8')
  if (!template.includes('__PACKAGE_NAME__')) throw new Error('client.template.js lost its __PACKAGE_NAME__ token')
  const name = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8')).name
  const client = template.replaceAll('__PACKAGE_NAME__', JSON.stringify(name))
  writeFileSync(join(pkgRoot, 'client.js'), client)
  return client
}
