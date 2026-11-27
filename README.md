# dsh-brand-logo

Replace the brand row at the top of the DeepSeek Harness sidebar — the whale mark plus the
`DEEPSEEK HARNESS` wordmark — with your own image, or with a wordmark typeset from the font
the app already ships.

No core files are patched and the official brand plugin stays installed; the bundle shadows
the two brand slots and releases them again when you remove it.

![The sidebar after installing, showing the whale mark next to a DEEPSEEK HARNESS wordmark](assets/screenshot-sidebar.png)

## How it works

The side bar row is built from two client slots:

| Slot | What it holds | Owner props |
| --- | --- | --- |
| `sidebar.brand.mark` | the mark on the left (also the only slot rendered in the collapsed rail) | `{ size: number }`, 24 |
| `sidebar.brand.name` | the wordmark on the right | none |

Both are `single` slots, and `@deepseek-ai/dsh-client-ui-brand-official` registers both at the
default priority `0`. This bundle registers the same slots at `priority: -10`; the slot rules
render the lowest priority, so the bundle wins without the official plugin being disabled. The
slot the bundle does not register keeps its shipped content, which is why the two modes below
can leave the whale in place.

## Install

```sh
dsh plugin --profile web add github:squidwantyou/dsh-brand-logo
```

Then restart `dsh web` (a freshly started process reads the client bundle; an already running
one may keep serving the previous module set) and reload the page.

You can also install the checked-out directory through the host's plugin manager, pointing it
at this folder.

Tested with `dsh` 0.2.2-rc.5 (`web` profile). See [Compatibility](#compatibility).

## Use

Out of the box the bundle typesets a wordmark: `DEEPSEEK` at weight 500 and `HARNESS` at
weight 400 with 60% opacity, 13&nbsp;px on a 0.12&nbsp;em tracking, in `Montserrat` — the brand
font the app already loads. The whale mark stays as it is.

Two helpers rewrite the compiled bundle. Run them inside the package directory:

```sh
# retune the typeset wordmark (1–3 words; first word solid, later words lighter)
node tools/set-text.mjs DEEPSEEK HARNESS --size 13 --tracking .12em --weights 500,400 --opacity 1,.6

# or drop in an image instead
node tools/set-logo.mjs ./my-logo.png
```

`set-text.mjs` options: `--size` (px), `--tracking` (CSS length), `--gap` (space between
words), `--weights` and `--opacity` (comma-separated per word), `--case upper|none`.

`set-logo.mjs` accepts `svg`, `png`, `jpg`, `webp`, `gif` and `avif`. It reads the image's
aspect ratio and picks the slot to use:

- aspect ≥ 1.7 → treated as a wordmark and rendered in `sidebar.brand.name`, 24 px tall;
- otherwise → treated as a square mark and rendered in `sidebar.brand.mark` at 24×24.

Force either case with `--mode wide|icon`, change the height with `--height 22`, or skip the
detection with `--aspect`.

The image is copied into `assets/` and inlined into `client.js` as a data URL — a client module
receives no configuration from its cordis row, so the picture has to be compiled in. Prefer a
file that is already roughly the size the row needs (about 48 px tall for a 2× display, tight
cropping, transparent background): every byte ends up in the module the browser downloads.

After either helper, restart `dsh web` and reload. If you installed from a directory link,
reloading alone is usually enough once the file's mtime changes.

## What is in the box

```
index.js               empty host half (the bundle has no server-side behaviour)
client.js              the compiled browser module: config + slot registrations
cordis.patch.yml       inserts the bundle into the loader
tools/set-text.mjs     typeset wordmark builder
tools/set-logo.mjs     image builder (aspect detection, data URL inlining)
tools/lib/             shared writer, template resolution
tools/client.template.js  component source; edit for deeper changes, then re-run a helper
locale/en.json         plugin metadata (title, description, detail doc)
locale/zh.json
icon.svg               plugin row icon
assets/                screenshots, and any image you compile in
docs/DETAIL.md         the long-form plugin detail page
```

## Compatibility

Built and tested against `dsh` 0.2.2-rc.5. It depends on three things from the host, all of
them part of the client slot system: the two slot names above, `priority` shadowing for
`single` slots, and the `--dsw-font-family-brand` custom property used by the default
typesetting. If a future release renames the slots the bundle simply stops matching and the
shipped brand returns; nothing else breaks.

## Uninstall

Remove the bundle through the host's plugin manager (or `dsh plugin --profile web remove
dsh-brand-logo`) and restart. The official brand row comes back on its own.

## License

MIT
