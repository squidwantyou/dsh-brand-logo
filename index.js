/**
 * Host half of the dsh-brand-logo bundle.
 *
 * The bundle has no host-side behaviour: everything it does happens in the
 * browser, where the client half shadows the `sidebar.brand.mark` and
 * `sidebar.brand.name` slots at priority -10. This module stays empty on
 * purpose so the bundle is a plain decoration bundle.
 */
export function apply() {}
