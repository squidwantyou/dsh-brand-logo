/**
 * Host half of the dsh-brand-logo bundle.
 *
 * Everything visible happens in the browser: the client half shadows the
 * `sidebar.brand.mark` and `sidebar.brand.name` slots at priority -10. This
 * module exists for one reason: to declare the configuration schema that the
 * Settings page edits. Every field is `volatile()`, which is what lets the
 * Settings document expose it and lets a write reach the running plugin
 * without remounting it.
 */

import z from '@deepseek-ai/schemastery'

/** Schema defaults consumed by the client half when a field is unset. */
export const DEFAULTS = {
  mark: 'official',
  markImage: '',
  name: 'text',
  text: 'DEEPSEEK HARNESS',
  size: 13,
  tracking: 0.12,
  nameImage: '',
  nameHeight: 22,
}

/** Settings schema for the `brand-logo` entry. */
export const Config = z.object({
  /** `official` keeps the shipped mark; `image` draws `markImage` instead. */
  mark: z.union(['official', 'image']).default(DEFAULTS.mark).volatile(),
  /** Data URL or https URL for the square mark. */
  markImage: z.string().default(DEFAULTS.markImage).volatile(),
  /** `text` typesets `text`; `image` draws `nameImage` instead. */
  name: z.union(['text', 'image']).default(DEFAULTS.name).volatile(),
  /** Wordmark text; words are split on whitespace. */
  text: z.string().default(DEFAULTS.text).volatile(),
  /** Wordmark font size in pixels. */
  size: z.number().min(8).max(20).step(1).default(DEFAULTS.size).volatile(),
  /** Wordmark letter spacing in em. */
  tracking: z.number().min(0).max(0.4).step(0.01).default(DEFAULTS.tracking).volatile(),
  /** Data URL or https URL for the wordmark image. */
  nameImage: z.string().default(DEFAULTS.nameImage).volatile(),
  /** Wordmark image height in pixels. */
  nameHeight: z.number().min(14).max(32).step(1).default(DEFAULTS.nameHeight).volatile(),
})

/**
 * No host-side behaviour is needed; the schema above is the only contract.
 */
export function apply() {}
