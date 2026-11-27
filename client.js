/**
 * Browser half of dsh-brand-logo.
 *
 * Two jobs:
 *  1. shadow `sidebar.brand.mark` / `sidebar.brand.name` at priority -10 and
 *     render whatever the Settings page currently holds;
 *  2. contribute the "Brand" page to `settings.section`, where that config is
 *     edited through `ctx.configForms`.
 *
 * The brand row is single-slot: a registration at the same priority as the
 * shipped one throws, so both seats register one rank lower and win. When the
 * mark is left on `official`, the component draws the shipped registration's
 * own component (found through `slots.entries`), so no upstream artwork is
 * copied into this bundle.
 */
window.__ModuleLoader__.load({
  id: "dsh-brand-logo",
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useState, useRef, useEffect, useCallback, useSyncExternalStore } = React

    /** Settings namespace of this bundle: the entry id in cordis.patch.yml. */
    const NS = 'brand-logo'
    /** Priority below the shipped brand (0) so the single slots accept us. */
    const SHADOW = -10

    const DEFAULTS = {
      mark: 'official',
      markImage: '',
      name: 'text',
      text: 'DEEPSEEK HARNESS',
      size: 13,
      tracking: 0.12,
      nameImage: '',
      nameHeight: 22,
    }

    const UNREADY = { status: 'unavailable', value: undefined, base: undefined, user: undefined, revision: undefined, writable: false }

    const FONT = 'var(--dsw-font-family-brand)'

    /** Read the Host config form for this bundle, if the service is there. */
    function resolveForm(ctx) {
      try {
        const forms = ctx.configForms
        if (!forms || typeof forms.get !== 'function') return null
        return forms.get(NS)
      } catch {
        return null
      }
    }

    /** Coerce a raw config section into the values the row renders. */
    function readValue(raw) {
      if (!raw || typeof raw !== 'object') return DEFAULTS
      const value = { ...DEFAULTS }
      if (raw.mark === 'image') value.mark = 'image'
      if (raw.name === 'image') value.name = 'image'
      if (typeof raw.markImage === 'string') value.markImage = raw.markImage
      if (typeof raw.nameImage === 'string') value.nameImage = raw.nameImage
      if (typeof raw.text === 'string' && raw.text.trim()) value.text = raw.text
      if (typeof raw.size === 'number' && raw.size >= 8 && raw.size <= 20) value.size = Math.round(raw.size)
      if (typeof raw.tracking === 'number' && raw.tracking >= 0 && raw.tracking <= 0.4) value.tracking = raw.tracking
      if (typeof raw.nameHeight === 'number' && raw.nameHeight >= 14 && raw.nameHeight <= 32) value.nameHeight = Math.round(raw.nameHeight)
      return value
    }

    /** Words of the wordmark, first one heavier and fully opaque. */
    function words(text) {
      return String(text || '').trim().split(/\s+/).filter(Boolean)
    }

    /** A wordmark drawn with the app's own brand font. */
    function Wordmark({ value }) {
      const parts = words(value.text)
      if (parts.length === 0) return null
      return h(
        'span',
        {
          'aria-label': parts.join(' '),
          style: {
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: '0.32em',
            color: 'inherit',
            fontFamily: FONT,
            fontSize: `${value.size}px`,
            fontWeight: 400,
            letterSpacing: `${value.tracking}em`,
            lineHeight: 1,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          },
        },
        parts.map((word, index) =>
          h('span', {
            key: `${String(index)}-${word}`,
            style: { fontWeight: index === 0 ? 500 : 400, opacity: index === 0 ? 1 : 0.6 },
          }, word),
        ),
      )
    }

    /** One hairline button used by the segmented controls. */
    function Segment({ active, disabled, children, onClick }) {
      return h(
        'button',
        {
          type: 'button',
          disabled,
          onClick,
          'aria-pressed': active,
          style: {
            appearance: 'none',
            border: '1px solid ' + (active ? 'color-mix(in srgb, currentColor 38%, transparent)' : 'color-mix(in srgb, currentColor 16%, transparent)'),
            background: active ? 'color-mix(in srgb, currentColor 9%, transparent)' : 'transparent',
            color: 'inherit',
            borderRadius: '8px',
            padding: '5px 12px',
            font: 'inherit',
            fontSize: '12px',
            cursor: disabled ? 'default' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          },
        },
        children,
      )
    }

    /** A labeled block in the settings page. */
    function Group({ title, hint, children }) {
      return h(
        'section',
        {
          style: {
            border: '1px solid color-mix(in srgb, currentColor 12%, transparent)',
            borderRadius: '12px',
            padding: '14px 16px 16px',
            display: 'grid',
            gap: '10px',
          },
        },
        h('div', { style: { display: 'grid', gap: '2px' } },
          h('div', { style: { fontSize: '13px', fontWeight: 600 } }, title),
          hint ? h('div', { style: { fontSize: '12px', opacity: 0.6, lineHeight: 1.5 } }, hint) : null,
        ),
        children,
      )
    }

    /** Debounced single-line text input. */
    function TextInput({ value, placeholder, onCommit }) {
      const [draft, setDraft] = useState(value)
      const editing = useRef(false)
      const timer = useRef(null)

      useEffect(() => {
        if (!editing.current) setDraft(value)
      }, [value])

      useEffect(() => () => clearTimeout(timer.current), [])

      const push = (next) => {
        clearTimeout(timer.current)
        if (next !== value) onCommit(next)
      }

      return h('input', {
        type: 'text',
        value: draft,
        placeholder,
        spellCheck: false,
        onFocus: () => { editing.current = true },
        onChange: (event) => {
          const next = event.target.value
          setDraft(next)
          clearTimeout(timer.current)
          timer.current = setTimeout(() => push(next), 500)
        },
        onBlur: () => { editing.current = false; push(draft) },
        onKeyDown: (event) => {
          if (event.key === 'Enter') { event.preventDefault(); push(draft) }
        },
        style: {
          width: '100%',
          boxSizing: 'border-box',
          font: 'inherit',
          fontSize: '13px',
          color: 'inherit',
          background: 'color-mix(in srgb, currentColor 4%, transparent)',
          border: '1px solid color-mix(in srgb, currentColor 16%, transparent)',
          borderRadius: '8px',
          padding: '7px 10px',
          outline: 'none',
        },
      })
    }

    /** Range input with a numeric readout. */
    function Slider({ label, value, min, max, step, format, onCommit }) {
      return h('label', { style: { display: 'grid', gap: '4px' } },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', opacity: 0.75 } },
          h('span', null, label),
          h('span', null, format(value)),
        ),
        h('input', {
          type: 'range',
          min,
          max,
          step,
          value,
          onChange: (event) => onCommit(Number(event.target.value)),
          style: { width: '100%', accentColor: 'currentColor', cursor: 'pointer' },
        }),
      )
    }

    /**
     * Downscale a picked image to a data URL no wider/taller than `edge`.
     * Logos are line art, so PNG keeps them crisp; oversized results are
     * reported instead of silently bloating the profile patch file.
     */
    function toDataUrl(file, edge) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = () => reject(new Error('read failed'))
        reader.onload = () => {
          const image = new Image()
          image.onerror = () => reject(new Error('decode failed'))
          image.onload = () => {
            const scale = Math.min(1, edge / Math.max(image.width, image.height))
            const width = Math.max(1, Math.round(image.width * scale))
            const height = Math.max(1, Math.round(image.height * scale))
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const context = canvas.getContext('2d')
            if (!context) { reject(new Error('canvas unavailable')); return }
            context.drawImage(image, 0, 0, width, height)
            resolve(canvas.toDataURL('image/png'))
          }
          image.src = String(reader.result)
        }
        reader.readAsDataURL(file)
      })
    }

    /** Upload / URL picker with a preview and a clear button. */
    function ImagePicker({ value, edge, disabled, onPick }) {
      const input = useRef(null)
      const [note, setNote] = useState('')
      const [busy, setBusy] = useState(false)

      const take = async (file) => {
        if (!file) return
        setBusy(true)
        setNote('')
        try {
          const dataUrl = await toDataUrl(file, edge)
          if (dataUrl.length > 200000) setNote('图片太大，请换一张更小的图。')
          else onPick(dataUrl)
        } catch {
          setNote('无法读取这张图片。')
        } finally {
          setBusy(false)
        }
      }

      return h('div', { style: { display: 'grid', gap: '8px' } },
        value
          ? h('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '44px',
              padding: '6px',
              borderRadius: '8px',
              background: 'color-mix(in srgb, currentColor 5%, transparent)',
            },
          }, h('img', { src: value, alt: '', style: { maxWidth: '100%', maxHeight: '44px', objectFit: 'contain' } }))
          : null,
        h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
          h(Segment, { disabled: disabled || busy, onClick: () => input.current && input.current.click() }, busy ? '处理中…' : '上传图片'),
          value ? h(Segment, { disabled, onClick: () => onPick('') }, '清除') : null,
        ),
        h('input', {
          ref: input,
          type: 'file',
          accept: 'image/png,image/jpeg,image/webp,image/svg+xml,image/gif',
          style: { display: 'none' },
          onChange: (event) => {
            const file = event.target.files && event.target.files[0]
            event.target.value = ''
            take(file)
          },
        }),
        note ? h('div', { style: { fontSize: '12px', color: 'var(--dsw-alias-state-danger, #d04545)' } }, note) : null,
      )
    }

    /** The preview strip that mirrors the sidebar brand row. */
    function Preview({ value }) {
      const mark = value.mark === 'image' && value.markImage
        ? h('img', { src: value.markImage, alt: '', style: { width: '24px', height: '24px', objectFit: 'contain', display: 'block' } })
        : h('span', {
          style: {
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: '1.5px dashed color-mix(in srgb, currentColor 30%, transparent)',
            display: 'block',
          },
        })
      const name = value.name === 'image' && value.nameImage
        ? h('img', { src: value.nameImage, alt: '', style: { height: `${value.nameHeight}px`, maxWidth: '180px', objectFit: 'contain', display: 'block' } })
        : h(Wordmark, { value })
      return h('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          height: '44px',
          padding: '0 12px',
          borderRadius: '8px',
          background: 'color-mix(in srgb, currentColor 5%, transparent)',
          overflow: 'hidden',
        },
      }, mark, name)
    }

    return {
      inject: ['slots', 'configForms'],
      apply(ctx) {
        const form = resolveForm(ctx)

        /** Live config values, shared by the row and the settings page. */
        function useBrand() {
          const snapshot = useSyncExternalStore(
            useCallback((onChange) => (form ? form.subscribe(onChange) : () => {}), []),
            useCallback(() => (form ? form.getSnapshot() : UNREADY), []),
          )
          const ready = snapshot.status === 'ready'
          return {
            snapshot,
            form,
            value: ready ? readValue(snapshot.value) : DEFAULTS,
          }
        }

        /** Write one field; a refused write is surfaced by the form's own state. */
        const write = (field, next) => {
          if (!form) return
          Promise.resolve(form.set(field, next)).catch(() => {})
        }

        /** First entry that outranks our shadow registration, if any. */
        const shipped = (slot) => {
          try {
            const entries = ctx.slots.entries(slot) || []
            let best = null
            for (const entry of entries) {
              const priority = (entry.options && entry.options.priority) || 0
              if (priority > SHADOW && (best === null || priority < best.priority)) best = { priority, entry }
            }
            return best ? best.entry : null
          } catch {
            return null
          }
        }

        /** Square mark seat: custom image, or the shipped registration. */
        function BrandMark(props) {
          const { value } = useBrand()
          const size = props && typeof props.size === 'number' ? props.size : 24
          if (value.mark === 'image' && value.markImage) {
            return h('img', {
              src: value.markImage,
              alt: '',
              style: { width: `${String(size)}px`, height: `${String(size)}px`, objectFit: 'contain', display: 'block' },
            })
          }
          const entry = shipped('sidebar.brand.mark')
          return entry && entry.component ? h(entry.component, { size }) : null
        }

        /** Wordmark seat: typeset words or a custom image. */
        function BrandName() {
          const { value } = useBrand()
          if (value.name === 'image' && value.nameImage) {
            return h('img', {
              src: value.nameImage,
              alt: '',
              style: { height: `${String(value.nameHeight)}px`, maxWidth: '180px', objectFit: 'contain', display: 'block' },
            })
          }
          return h(Wordmark, { value })
        }

        /** The Settings → Brand page. */
        function BrandSettings() {
          const { value, snapshot } = useBrand()
          const writable = snapshot.writable !== false
          const disabled = !form || !writable

          return h('div', {
            style: {
              display: 'grid',
              gap: '16px',
              padding: '4px 2px 24px',
              fontSize: '13px',
              color: 'var(--dsw-alias-text-primary, inherit)',
            },
          },
            h('div', { style: { display: 'grid', gap: '6px' } },
              h('div', { style: { fontSize: '15px', fontWeight: 600 } }, '品牌'),
              h('div', { style: { fontSize: '12px', opacity: 0.6, lineHeight: 1.6 } },
                '改侧栏左上角的图标和文字标。改完立刻生效，保存在本机 profile 的配置里。'),
            ),
            h(Preview, { value }),

            h(Group, { title: '图标', hint: '默认保留 DeepSeek Harness 自带的图标。' },
              h('div', { style: { display: 'flex', gap: '8px' } },
                h(Segment, { active: value.mark !== 'image', disabled, onClick: () => write('mark', 'official') }, '自带图标'),
                h(Segment, { active: value.mark === 'image', disabled, onClick: () => write('mark', 'image') }, '我的图片'),
              ),
              value.mark === 'image'
                ? h(ImagePicker, {
                  value: value.markImage,
                  edge: 96,
                  disabled,
                  onPick: (next) => write('markImage', next),
                })
                : null,
            ),
            h(Group, { title: '文字标', hint: '排字用应用自带的品牌字体（Montserrat）；也可以直接换成一整张图片。' },
              h('div', { style: { display: 'flex', gap: '8px' } },
                h(Segment, { active: value.name !== 'image', disabled, onClick: () => write('name', 'text') }, '排字'),
                h(Segment, { active: value.name === 'image', disabled, onClick: () => write('name', 'image') }, '图片'),
              ),
              value.name === 'image'
                ? h('div', { style: { display: 'grid', gap: '10px' } },
                  h(ImagePicker, {
                    value: value.nameImage,
                    edge: 520,
                    disabled,
                    onPick: (next) => write('nameImage', next),
                  }),
                  h(Slider, {
                    label: '图片高度',
                    value: value.nameHeight,
                    min: 14,
                    max: 32,
                    step: 1,
                    format: (next) => `${String(next)} px`,
                    onCommit: (next) => write('nameHeight', next),
                  }),
                )
                : h('div', { style: { display: 'grid', gap: '12px' } },
                  h('label', { style: { display: 'grid', gap: '5px' } },
                    h('span', { style: { fontSize: '12px', opacity: 0.75 } }, '文字（空格分词，第一个词更重）'),
                    h(TextInput, {
                      value: value.text,
                      placeholder: 'DEEPSEEK HARNESS',
                      onCommit: (next) => write('text', next.trim()),
                    }),
                  ),
                  h(Slider, {
                    label: '字号',
                    value: value.size,
                    min: 8,
                    max: 20,
                    step: 1,
                    format: (next) => `${String(next)} px`,
                    onCommit: (next) => write('size', next),
                  }),
                  h(Slider, {
                    label: '字距',
                    value: value.tracking,
                    min: 0,
                    max: 0.4,
                    step: 0.01,
                    format: (next) => `${next.toFixed(2)} em`,
                    onCommit: (next) => write('tracking', next),
                  }),
                ),
            ),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
              h(Segment, {
                disabled,
                onClick: () => {
                  if (!form) return
                  for (const field of Object.keys(DEFAULTS)) {
                    Promise.resolve(form.unset(field)).catch(() => {})
                  }
                },
              }, '恢复默认'),
              disabled
                ? h('span', { style: { fontSize: '12px', opacity: 0.55 } }, '当前不可写。')
                : null,
            ),
          )
        }

        ctx.slots.inject('sidebar.brand.mark', () => ctx.slots.register({
          name: 'sidebar.brand.mark',
          id: 'brand-logo-mark',
          priority: SHADOW,
        }, BrandMark))

        ctx.slots.inject('sidebar.brand.name', () => ctx.slots.register({
          name: 'sidebar.brand.name',
          id: 'brand-logo-name',
          priority: SHADOW,
        }, BrandName))

        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: 'brand',
          order: 60,
          label: () => '品牌',
        }, BrandSettings))
      },
    }
  },
})
