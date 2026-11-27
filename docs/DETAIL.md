# Brand logo

Replace the brand row at the top of the DeepSeek Harness sidebar — the whale mark and the
`DEEPSEEK HARNESS` wordmark — with an image of your own, or with a wordmark typeset in the
font the app already ships.

![The brand row after installing: whale mark, then DEEPSEEK HARNESS](preview.png)

## What it touches

Nothing in the core. The row is assembled from two client slots, and the bundle claims the
same slots the official brand plugin claims, one priority step lower:

| Slot | Rendered in | Registered by this bundle |
| --- | --- | --- |
| `sidebar.brand.mark` | the 24 px square on the left, also the only slot drawn when the sidebar is collapsed to a rail | only in `icon` mode |
| `sidebar.brand.name` | the wordmark on the right | only in `wide` and `text` modes |

The official plugin registers both at priority `0`. A `single` slot renders the lowest
priority entry, so registering at `-10` shadows it without disabling it. The slot that the
bundle does not claim keeps the shipped content — that is how the default typeset keeps the
whale.

Because the claim is a slot registration rather than a file patch, removing the bundle hands
the row straight back to the official plugin.

## The default: a typeset wordmark

`DEEPSEEK` sits at weight 500, `HARNESS` at weight 400 with 60% opacity, 13 px on a 0.12 em
tracking, in `Montserrat` — the brand font the theme already loads, referenced through
`var(--dsw-font-family-brand)` so it follows the app's typography. The whale is untouched.

## Customising

Both helpers compile a new `client.js`; run them from the package directory and restart
`dsh web` afterwards.

```sh
node tools/set-text.mjs BARE NAME --size 13 --tracking .12em --weights 500,300 --opacity 1,.55
node tools/set-logo.mjs ./logo.png --mode wide --height 24
```

`set-logo.mjs` reads the image's aspect ratio when `--mode` is omitted: `≥ 1.7` is treated as
a wordmark for the name slot, anything else as a square mark for the mark slot. The image is
copied into `assets/` and inlined into the module as a data URL, since client modules receive
no configuration from their cordis row. Pass a file close to the size the row actually uses —
about 48 px tall for a 2× display, tight crop, transparent background.

## Troubleshooting

- **Row still shows the old brand.** Restart the `dsh web` process and reload; a running
  server may keep serving the module set it started with.
- **`single slot "sidebar.brand.name" already has a registration`.** Two copies of this
  bundle are enabled at the same priority. Keep one.
- **Row shows the wordmark but no whale, or the reverse.** That is the mode doing its job:
  `icon` registers only the mark, `wide`/`text` only the name. Unregistered slots fall back
  to the official content.
- **Text is clipped on a narrow window.** The row has roughly 180 px for the wordmark next
  to the collapse button; shorten the text or drop to 12 px.
