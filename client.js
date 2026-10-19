/**
 * Browser half of dsh-custom-brand-logo.
 *
 * Fills the three brand slots with user-provided branding:
 *   - `sidebar.brand.mark`  — the top-left mark (expanded brand row and rail);
 *   - `sidebar.brand.name`  — the name beside that mark ("DSH本地构建" + version
 *     by default), replaceable with a custom name and optional subtitle;
 *   - `conversation.hero.brand.mark` — the mark before the blank New Session
 *     headline (the orange fish fallback).
 *
 * A "Brand Logo" page in Settings provides one logo image for both marks, the
 * custom name copy, per-location visibility switches, and reset. Registration
 * of each occupant is conditional: with the feature disabled or a location
 * switched off, that slot is left alone so the shipped fallback keeps
 * rendering.
 *
 * The configuration is stored in this browser's localStorage (nothing leaves
 * the machine); a URL is loaded directly by the browser.
 */
window.__ModuleLoader__.load({
  id: 'dsh-custom-brand-logo',
  factory(require) {
    'use strict'

    const React = require('react')
    const h = React.createElement

    const NS = 'custom-brand-logo'
    const STORAGE_KEY = 'dsh.custom-brand-logo.v1'
    const MAX_UPLOAD_BYTES = 1024 * 1024
    const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']

    /** Dictionary for the settings page and the plugin-manager row. */
    const en = {
      'nav': 'Brand Logo',
      'page.title': 'Brand Logo',
      'page.description': 'Replace the brand logo in the top-left sidebar and on the blank New Session page, and give the sidebar name your own text.',
      'toggle.label': 'Enable custom branding',
      'toggle.onHint': 'Your custom logo and name are in use.',
      'toggle.offHint': 'The built-in branding is shown.',
      'source.title': 'Logo image',
      'source.url': 'Image address',
      'source.upload': 'Upload image',
      'field.url': 'Image address',
      'field.urlPlaceholder': 'https://example.com/logo.png',
      'field.urlHint': 'PNG, JPEG, WebP, GIF or SVG. Relative paths and data:image addresses also work.',
      'field.uploadHint': 'PNG, JPEG, WebP, GIF or SVG, up to 1 MB. The image stays in this browser.',
      'file.selected': 'Selected file',
      'drop.title': 'Drop an image here, or click to choose',
      'drop.hint': 'The image is stored locally; it is never uploaded to a server.',
      'action.apply': 'Apply',
      'action.choose': 'Choose image',
      'action.reset': 'Restore default',
      'preview.title': 'Preview',
      'preview.empty': 'No logo configured yet.',
      'preview.hint': 'Preview only; the sidebar mark itself is 24 px.',
      'preview.actual': 'Actual size',
      'scope.title': 'Where it appears',
      'scope.sidebar': 'Sidebar logo (top-left)',
      'scope.sidebarHint': 'Replace the brand icon in the sidebar brand row and the collapsed rail.',
      'scope.hero': 'New-session logo',
      'scope.heroHint': 'Show the same logo before the headline on the blank New Session page.',
      'name.title': 'Brand name',
      'name.label': 'Name',
      'name.placeholder': 'e.g. My Brand',
      'name.subtitleLabel': 'Subtitle (optional)',
      'name.subtitlePlaceholder': 'e.g. 0.2.1-rc.2',
      'name.hint': 'Leave the name empty to keep the built-in name. A subtitle is shown in a smaller line under the name.',
      'name.preview': 'Name preview',
      'name.previewEmpty': 'The name preview appears here.',
      'status.saved': 'Applied.',
      'status.pending': 'Unapplied changes.',
      'status.formHint': 'All changes take effect only after you press Apply.',
      'browser.hint': 'The browser tab title follows the custom name, and the tab icon follows the custom logo, while custom branding is on.',
      'hint.storage': 'The configuration is saved in this browser only.',
      'error.urlEmpty': 'Enter an image address first.',
      'error.urlInvalid': 'That image address is not a valid URL.',
      'error.urlScheme': 'Only http(s), relative, or data:image addresses are supported.',
      'error.urlData': 'The data address must contain an image.',
      'error.fileType': 'Choose a PNG, JPEG, WebP, GIF or SVG image.',
      'error.fileSize': 'The image is larger than 1 MB.',
      'error.read': 'The image could not be read.',
      'error.storage': 'The browser refused to save the configuration (storage is full or unavailable).',
      'error.enableNeedsBrand': 'Set a logo or a name before enabling.',
      'error.nameNeedsName': 'Enter a name before setting a subtitle.',
      'error.imageLoad': 'This image could not be loaded. Check the address or the file.',
    }

    /** Chinese dictionary for the same copy. */
    const zh = {
      'nav': '品牌 Logo',
      'page.title': '品牌 Logo',
      'page.description': '替换左上角侧边栏和新建会话页的品牌 Logo，并可以把侧边栏名称改成自己的文字。',
      'toggle.label': '启用自定义品牌',
      'toggle.onHint': '正在使用你的自定义 Logo 和名称。',
      'toggle.offHint': '当前显示内置品牌标识。',
      'source.title': 'Logo 图片',
      'source.url': '图片地址',
      'source.upload': '上传图片',
      'field.url': '图片地址',
      'field.urlPlaceholder': 'https://example.com/logo.png',
      'field.urlHint': '支持 PNG、JPEG、WebP、GIF 或 SVG；相对路径和 data:image 地址也可以。',
      'field.uploadHint': '支持 PNG、JPEG、WebP、GIF 或 SVG，不超过 1 MB。图片只保存在当前浏览器。',
      'file.selected': '已选择文件',
      'drop.title': '把图片拖到这里，或点击选择',
      'drop.hint': '图片只保存在本地，不会上传到服务器。',
      'action.apply': '应用',
      'action.choose': '选择图片',
      'action.reset': '恢复默认',
      'preview.title': '预览',
      'preview.empty': '尚未设置 Logo。',
      'preview.hint': '仅为预览；侧边栏中的实际尺寸是 24 px。',
      'preview.actual': '实际大小',
      'scope.title': '显示位置',
      'scope.sidebar': '侧边栏 Logo（左上角）',
      'scope.sidebarHint': '替换侧边栏品牌行和折叠栏中的品牌图标。',
      'scope.hero': '新建会话页 Logo',
      'scope.heroHint': '在空白新建会话页的标题前显示同一个 Logo。',
      'name.title': '品牌名称',
      'name.label': '名称',
      'name.placeholder': '例如：My Brand',
      'name.subtitleLabel': '副标题（可选）',
      'name.subtitlePlaceholder': '例如：0.2.1-rc.2',
      'name.hint': '名称留空时显示内置名称；副标题会以较小字号显示在名称下方。',
      'name.preview': '名称预览',
      'name.previewEmpty': '名称预览会显示在这里。',
      'status.saved': '已应用。',
      'status.pending': '有尚未应用的修改。',
      'status.formHint': '所有修改在点击“应用”后生效。',
      'browser.hint': '启用自定义品牌时，浏览器标签页标题会使用自定义名称，标签页图标会使用自定义 Logo。',
      'hint.storage': '配置只保存在当前浏览器。',
      'error.urlEmpty': '请先填写图片地址。',
      'error.urlInvalid': '图片地址不是有效的 URL。',
      'error.urlScheme': '只支持 http(s)、相对路径或 data:image 地址。',
      'error.urlData': 'data 地址必须是图片。',
      'error.fileType': '请选择 PNG、JPEG、WebP、GIF 或 SVG 图片。',
      'error.fileSize': '图片超过 1 MB。',
      'error.read': '图片读取失败。',
      'error.storage': '浏览器未能保存配置（存储空间不足或不可用）。',
      'error.enableNeedsBrand': '请先设置 Logo 或名称，再启用显示。',
      'error.nameNeedsName': '请先填写名称，再设置副标题。',
      'error.imageLoad': '图片加载失败，请检查地址或文件。',
    }

    // ---------------------------------------------------------------------
    // Persisted configuration
    // ---------------------------------------------------------------------

    const EMPTY_STATE = Object.freeze({
      enabled: false,
      mode: 'url',
      url: '',
      dataUrl: '',
      name: '',
      subtitle: '',
      showInSidebar: true,
      showInHero: true,
    })

    function cloneState(state) {
      return {
        enabled: state.enabled,
        mode: state.mode,
        url: state.url,
        dataUrl: state.dataUrl,
        name: state.name,
        subtitle: state.subtitle,
        showInSidebar: state.showInSidebar,
        showInHero: state.showInHero,
      }
    }

    /** Accept only known fields and values; anything else falls back safely. */
    function normalizeState(input) {
      if (input === null || typeof input !== 'object') return cloneState(EMPTY_STATE)
      return {
        enabled: input.enabled === true,
        mode: input.mode === 'upload' ? 'upload' : 'url',
        url: typeof input.url === 'string' ? input.url : '',
        dataUrl: typeof input.dataUrl === 'string' && input.dataUrl.indexOf('data:image/') === 0
          ? input.dataUrl
          : '',
        name: typeof input.name === 'string' ? input.name.slice(0, 120) : '',
        subtitle: typeof input.subtitle === 'string' ? input.subtitle.slice(0, 120) : '',
        showInSidebar: input.showInSidebar !== false,
        showInHero: input.showInHero !== false,
      }
    }

    function readStoredState() {
      try {
        if (typeof localStorage === 'undefined') return cloneState(EMPTY_STATE)
        const raw = localStorage.getItem(STORAGE_KEY)
        if (typeof raw !== 'string' || raw === '') return cloneState(EMPTY_STATE)
        return normalizeState(JSON.parse(raw))
      } catch {
        return cloneState(EMPTY_STATE)
      }
    }

    function persistState(state) {
      if (typeof localStorage === 'undefined') throw new Error('localStorage is unavailable')
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        v: 2,
        enabled: state.enabled,
        mode: state.mode,
        url: state.url,
        dataUrl: state.dataUrl,
        name: state.name,
        subtitle: state.subtitle,
        showInSidebar: state.showInSidebar,
        showInHero: state.showInHero,
      }))
    }

    let current = readStoredState()
    const listeners = new Set()

    function notify() {
      for (const listener of Array.from(listeners)) {
        try {
          listener()
        } catch (error) {
          console.error('[custom-brand-logo] store listener failed', error)
        }
      }
    }

    const store = {
      getSnapshot() {
        return current
      },
      getServerSnapshot() {
        return current
      },
      subscribe(listener) {
        listeners.add(listener)
        return () => {
          listeners.delete(listener)
        }
      },
      /** Persist a patch first; on storage failure nothing changes. */
      set(patch) {
        const next = normalizeState(Object.assign({}, current, patch))
        try {
          persistState(next)
        } catch {
          return 'storage'
        }
        current = next
        notify()
        return null
      },
    }

    /** The configured image address regardless of the enabled flag. */
    function configuredSource(state) {
      return state.mode === 'upload' ? state.dataUrl : state.url.trim()
    }

    /** The image for the sidebar brand slot ('' = leave the host fallback). */
    function sidebarSource(state) {
      return state.enabled && state.showInSidebar ? configuredSource(state) : ''
    }

    /** The image for the blank-session hero slot ('' = leave the host fallback). */
    function heroSource(state) {
      return state.enabled && state.showInHero ? configuredSource(state) : ''
    }

    function customName(state) {
      return state.enabled ? state.name.trim() : ''
    }

    function customSubtitle(state) {
      return state.enabled ? state.subtitle.trim() : ''
    }

    // ---------------------------------------------------------------------
    // Browser chrome
    //
    // The tab title and favicon are page metadata, not application UI: the
    // host owns `document.title` (session title plus product name) and the
    // icon links in its HTML head. While custom branding is active this keeps
    // both in sync with the configured name/logo and restores the host values
    // when it is disabled or unloaded.
    // ---------------------------------------------------------------------

    /** Image media type of a data URL or by file extension; '' = let the browser sniff. */
    function mediaTypeOf(src) {
      if (typeof src !== 'string' || src === '') return ''
      if (src.indexOf('data:') === 0) {
        const comma = src.indexOf(',')
        const meta = comma === -1 ? src.slice(5) : src.slice(5, comma)
        const semicolon = meta.indexOf(';')
        return semicolon === -1 ? meta : meta.slice(0, semicolon)
      }
      try {
        const base = typeof location === 'undefined' ? 'http://localhost/' : location.href
        const path = new URL(src, base).pathname.toLowerCase()
        const dot = path.lastIndexOf('.')
        const extension = dot === -1 ? '' : path.slice(dot)
        if (extension === '.svg') return 'image/svg+xml'
        if (extension === '.png') return 'image/png'
        if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg'
        if (extension === '.webp') return 'image/webp'
        if (extension === '.gif') return 'image/gif'
        if (extension === '.ico') return 'image/x-icon'
      } catch {
        /* A relative address still works as an icon even when it cannot be parsed here. */
      }
      return ''
    }

    /**
     * Mirror the brand configuration into the browser tab title and favicon.
     * @param store - configuration store.
     * @returns cleanup restoring the host title and icon links.
     */
    function startBrowserChrome(store) {
      if (typeof document === 'undefined' || typeof MutationObserver === 'undefined' || document.head === null) {
        return () => {}
      }

      const TITLE_SEPARATOR = ' — ' // Host format: `${sessionTitle} — ${productTitle}`.
      let hostTitle = document.title
      let appliedTitle = ''
      let activeName = ''
      let observer = null
      let savedIcons = null

      const writeTitle = (name) => {
        const index = hostTitle.lastIndexOf(TITLE_SEPARATOR)
        const next = index === -1 ? name : hostTitle.slice(0, index) + TITLE_SEPARATOR + name
        appliedTitle = next
        if (document.title !== next) document.title = next
      }

      const onHeadMutation = () => {
        if (activeName === '') return
        // Our own write lands here too; only host-owned title changes need work.
        if (document.title === appliedTitle) return
        hostTitle = document.title
        writeTitle(activeName)
      }

      const saveIcons = () => {
        if (savedIcons !== null && savedIcons.every(record => record.el.isConnected)) return
        savedIcons = null
        const links = Array.from(document.querySelectorAll('link[rel~="icon"]'))
        if (links.length === 0) {
          const created = document.createElement('link')
          created.setAttribute('rel', 'icon')
          document.head.appendChild(created)
          savedIcons = [{ el: created, href: null, type: null, created: true }]
          return
        }
        savedIcons = links.map(el => ({
          el,
          href: el.getAttribute('href'),
          type: el.getAttribute('type'),
          created: false,
        }))
      }

      const applyFavicon = (src) => {
        saveIcons()
        if (savedIcons === null) return
        const type = mediaTypeOf(src)
        for (const record of savedIcons) {
          if (record.el.getAttribute('href') !== src) record.el.setAttribute('href', src)
          if (type === '') {
            if (record.el.hasAttribute('type')) record.el.removeAttribute('type')
          } else if (record.el.getAttribute('type') !== type) {
            record.el.setAttribute('type', type)
          }
        }
      }

      const restoreFavicon = () => {
        if (savedIcons === null) return
        for (const record of savedIcons) {
          if (record.created) {
            record.el.remove()
            continue
          }
          if (record.href === null) record.el.removeAttribute('href')
          else record.el.setAttribute('href', record.href)
          if (record.type === null) record.el.removeAttribute('type')
          else record.el.setAttribute('type', record.type)
        }
        savedIcons = null
      }

      const sync = () => {
        const state = store.getSnapshot()
        const name = state.enabled ? state.name.trim() : ''
        const src = state.enabled ? configuredSource(state) : ''

        if (name === '') {
          if (activeName !== '') {
            activeName = ''
            if (document.title !== hostTitle) document.title = hostTitle
            appliedTitle = ''
          }
          if (observer !== null) {
            observer.disconnect()
            observer = null
          }
        } else {
          if (observer === null) {
            hostTitle = document.title
            observer = new MutationObserver(onHeadMutation)
            observer.observe(document.head, { childList: true, subtree: true, characterData: true })
          }
          activeName = name
          writeTitle(name)
        }

        if (src === '') restoreFavicon()
        else applyFavicon(src)
      }

      const unsubscribe = store.subscribe(sync)
      sync()
      return () => {
        unsubscribe()
        if (observer !== null) {
          observer.disconnect()
          observer = null
        }
        if (activeName !== '' && document.title !== hostTitle) document.title = hostTitle
        restoreFavicon()
      }
    }

    function isValidHttpUrl(value) {
      try {
        const parsed = new URL(value)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      } catch {
        return false
      }
    }

    /** @returns {string | null} an error dictionary key, or null when acceptable. */
    function validateUrl(raw) {
      const value = raw.trim()
      if (value === '') return 'urlEmpty'
      if (/^data:/i.test(value)) return /^data:image\//i.test(value) ? null : 'urlData'
      if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
        if (!/^https?:/i.test(value)) return 'urlScheme'
        return isValidHttpUrl(value) ? null : 'urlInvalid'
      }
      return null
    }

    /** @returns {string | null} an error dictionary key, or null when acceptable. */
    function validateFile(file) {
      if (!file || IMAGE_TYPES.indexOf(file.type) === -1) return 'fileType'
      if (typeof file.size === 'number' && file.size > MAX_UPLOAD_BYTES) return 'fileSize'
      return null
    }

    function readFileAsDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
        reader.onerror = () => reject(reader.error || new Error('read failed'))
        reader.readAsDataURL(file)
      })
    }

    // ---------------------------------------------------------------------
    // Artwork (original, uses theme tokens so it follows light/dark)
    // ---------------------------------------------------------------------

    function BrandGlyph(props) {
      const size = props.size
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 64 64',
        'aria-hidden': true,
        focusable: 'false',
        style: { display: 'block' },
      },
      h('rect', {
        x: 10, y: 10, width: 44, height: 44, rx: 12,
        fill: 'none', stroke: 'var(--dsw-alias-label-secondary)', strokeWidth: 3,
      }),
      h('circle', { cx: 24, cy: 26, r: 4, fill: 'var(--dsw-alias-label-secondary)' }),
      h('path', {
        d: 'M16 46l11-13 8 9 5-5 8 9',
        fill: 'none',
        stroke: 'var(--dsw-alias-label-secondary)',
        strokeWidth: 3,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }))
    }

    // ---------------------------------------------------------------------
    // Slot occupants: brand marks and the brand name
    // ---------------------------------------------------------------------

    /**
     * Shared mark occupant: renders the image picked for one slot, with a
     * geometry-preserving placeholder when the image cannot load.
     */
    function MarkOccupant(props) {
      const state = React.useSyncExternalStore(
        props.store.subscribe,
        props.store.getSnapshot,
        props.store.getServerSnapshot,
      )
      const src = props.pick(state)
      const [failed, setFailed] = React.useState(false)
      React.useEffect(() => {
        setFailed(false)
      }, [src])
      const size = typeof props.size === 'number' && props.size > 0 ? props.size : 24
      const className = typeof props.className === 'string' ? props.className : undefined
      if (src === '') return null
      if (failed) {
        // Never replace a broken image with nothing: show a quiet placeholder so
        // the row keeps its geometry while the user fixes the source.
        return h('span', {
          className,
          title: props.t('error.imageLoad'),
          style: { display: 'inline-flex', width: size + 'px', height: size + 'px' },
        }, h(BrandGlyph, { size }))
      }
      return h('img', {
        className,
        src,
        alt: '',
        width: size,
        height: size,
        draggable: false,
        onError: () => setFailed(true),
        style: {
          display: 'block',
          width: size + 'px',
          height: size + 'px',
          objectFit: 'contain',
          borderRadius: '6px',
          pointerEvents: 'none',
        },
      })
    }

    /** Top-left sidebar mark. */
    function SidebarMark(props) {
      return h(MarkOccupant, Object.assign({}, props, { pick: sidebarSource }))
    }

    /** Blank New Session hero mark; the host's `.fish` class carries its animation. */
    function HeroMark(props) {
      return h(MarkOccupant, Object.assign({}, props, { pick: heroSource }))
    }

    /** Name and optional subtitle, sized to sit in the host's 24 px brand row. */
    function BrandNameText(props) {
      const name = props.name
      const subtitle = props.subtitle
      if (subtitle === '') {
        return h('span', {
          title: name,
          style: {
            display: 'block',
            maxWidth: '176px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '24px',
            letterSpacing: '0.02em',
          },
        }, name)
      }
      return h('span', {
        style: {
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: '1px',
          height: '24px',
          minWidth: 0,
          maxWidth: '176px',
        },
      },
      h('span', {
        title: name,
        style: {
          display: 'block',
          maxWidth: '176px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '12px',
          fontWeight: 600,
          lineHeight: '13px',
          letterSpacing: 0,
        },
      }, name),
      h('span', {
        title: subtitle,
        style: {
          display: 'block',
          maxWidth: '176px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          padding: '0 3px',
          borderRadius: '3px',
          background: 'var(--dsw-alias-bg-layer-2)',
          color: 'var(--dsw-alias-label-secondary)',
          fontFamily: 'var(--ds-font-family-code)',
          fontSize: '9px',
          lineHeight: '10px',
          fontWeight: 500,
        },
      }, subtitle))
    }

    /** Sidebar name beside the mark. */
    function NameOccupant(props) {
      const state = React.useSyncExternalStore(
        props.store.subscribe,
        props.store.getSnapshot,
        props.store.getServerSnapshot,
      )
      const name = customName(state)
      if (name === '') return null
      return h(BrandNameText, { name, subtitle: customSubtitle(state) })
    }

    // ---------------------------------------------------------------------
    // Settings page
    // ---------------------------------------------------------------------

    const CSS = `
.cbl-root {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 720px;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  line-height: 1.6;
}
.cbl-head { display: flex; flex-direction: column; gap: 4px; }
.cbl-title { font-size: 15px; font-weight: 600; }
.cbl-desc { color: var(--dsw-alias-label-secondary); font-size: 12px; }
.cbl-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  background: var(--dsw-alias-bg-layer-1);
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 10px;
}
.cbl-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.cbl-rowText { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.cbl-cardTitle { font-size: 13px; font-weight: 600; }
.cbl-label { font-weight: 600; }
.cbl-hint { color: var(--dsw-alias-label-secondary); font-size: 12px; }
.cbl-namePreview {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 12px;
  border: 1px dashed var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2);
  overflow: hidden;
}
.cbl-namePreviewEmpty { color: var(--dsw-alias-label-secondary); font-size: 12px; }
.cbl-switch {
  position: relative;
  flex: none;
  width: 38px;
  height: 22px;
  padding: 0;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  background: var(--dsw-alias-bg-layer-2);
  cursor: pointer;
  transition: background-color 0.14s, border-color 0.14s;
}
.cbl-switch:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
.cbl-switchOn { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); }
.cbl-thumb {
  position: absolute;
  top: 50%;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--dsw-alias-bg-base);
  transform: translateY(-50%);
  transition: left 0.14s;
}
.cbl-switchOn .cbl-thumb { left: 18px; }
.cbl-tabs {
  display: inline-flex;
  align-self: flex-start;
  gap: 2px;
  padding: 2px;
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2);
}
.cbl-tab {
  padding: 3px 14px;
  border: 0;
  border-radius: 6px;
  background: none;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.cbl-tab:hover { color: var(--dsw-alias-label-primary); }
.cbl-tab:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: -1px; }
.cbl-tabActive { background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font-weight: 600; }
.cbl-field { display: flex; flex-direction: column; gap: 6px; }
.cbl-field > .cbl-input { flex: none; }
.cbl-inputRow { display: flex; align-items: center; gap: 8px; }
.cbl-input {
  flex: 1;
  min-width: 0;
  padding: 6px 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
}
.cbl-input:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: -1px; }
.cbl-button {
  flex: none;
  padding: 5px 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.cbl-button:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-2); }
.cbl-button:disabled { opacity: 0.5; cursor: default; }
.cbl-button:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
.cbl-buttonPrimary { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-brand-primary); }
.cbl-link {
  padding: 2px 4px;
  border: 0;
  border-radius: 6px;
  background: none;
  color: var(--dsw-alias-brand-primary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.cbl-link:hover { text-decoration: underline; }
.cbl-link:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
.cbl-drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 18px;
  border: 1px dashed var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-2);
  cursor: pointer;
  text-align: center;
}
.cbl-drop:hover, .cbl-dropOver { border-color: var(--dsw-alias-brand-primary); }
.cbl-drop:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
.cbl-preview {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--dsw-alias-border-l1);
}
.cbl-previewTile {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-2);
}
.cbl-previewImage { max-width: 80px; max-height: 80px; object-fit: contain; }
.cbl-previewMeta { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.cbl-actual { display: flex; align-items: center; gap: 8px; }
.cbl-actualBox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px dashed var(--dsw-alias-border-l2);
  border-radius: 8px;
}
.cbl-error { color: var(--dsw-alias-state-error-primary); font-size: 12px; }
.cbl-success { color: var(--dsw-alias-state-success-primary); font-size: 12px; }
.cbl-actionsRow { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.cbl-footer { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.cbl-muted { color: var(--dsw-alias-label-secondary); font-size: 12px; }
`

    const DRAFT_DEFAULTS = Object.freeze({
      enabled: false,
      mode: 'url',
      url: '',
      dataUrl: '',
      name: '',
      subtitle: '',
      showInSidebar: true,
      showInHero: true,
    })

    function draftFromState(state) {
      return {
        enabled: state.enabled,
        mode: state.mode,
        url: state.url,
        dataUrl: state.dataUrl,
        name: state.name,
        subtitle: state.subtitle,
        showInSidebar: state.showInSidebar,
        showInHero: state.showInHero,
      }
    }

    function sameDraft(left, right) {
      return left.enabled === right.enabled
        && left.mode === right.mode
        && left.url === right.url
        && left.dataUrl === right.dataUrl
        && left.name === right.name
        && left.subtitle === right.subtitle
        && left.showInSidebar === right.showInSidebar
        && left.showInHero === right.showInHero
    }

    function SettingsPage(props) {
      const store = props.store
      const t = props.t
      const state = React.useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
      // Every control edits this draft; the single Apply button commits it.
      const [draft, setDraftState] = React.useState(() => draftFromState(state))
      // The editing tab is component-local: switching it only changes which
      // editor is shown. `mode` follows the source that is actually edited.
      const [tab, setTab] = React.useState(state.mode)
      const [error, setError] = React.useState('')
      const [saved, setSaved] = React.useState(false)
      const [imageError, setImageError] = React.useState(false)
      const [dragging, setDragging] = React.useState(false)
      const [fileName, setFileName] = React.useState('')
      const fileRef = React.useRef(null)

      React.useEffect(() => {
        // The store is the single source of truth after Apply.
        setDraftState(draftFromState(state))
        setTab(state.mode)
      }, [state])

      const applied = draftFromState(state)
      const dirty = !sameDraft(draft, applied)
      const previewSrc = configuredSource(draft)
      const hasSource = previewSrc !== ''
      const hasName = draft.name.trim() !== ''
      const hasBrand = hasSource || hasName
      const masterActive = draft.enabled && hasBrand

      React.useEffect(() => {
        setImageError(false)
      }, [previewSrc])

      /** Stage one local change; nothing reaches the store before Apply. */
      function update(patch) {
        setDraftState(current => Object.assign({}, current, patch))
        setSaved(false)
        if (error) setError('')
      }

      function report(code) {
        setError(code ? t('error.' + code) : '')
      }

      function selectMode(mode) {
        if (tab === mode) return
        if (error) setError('')
        setTab(mode)
      }

      function toggleEnabled() {
        if (!masterActive) {
          if (!hasBrand) {
            report('enableNeedsBrand')
            return
          }
          update({ enabled: true })
          return
        }
        update({ enabled: false })
      }

      function toggleScope(key) {
        update({ [key]: !draft[key] })
      }

      function resetDraft() {
        setDraftState(Object.assign({}, DRAFT_DEFAULTS))
        setTab('url')
        setFileName('')
        setSaved(false)
        setImageError(false)
        if (error) setError('')
      }

      function applyDraft() {
        const name = draft.name.trim()
        const subtitle = draft.subtitle.trim()
        if (name === '' && subtitle !== '') {
          report('nameNeedsName')
          return
        }
        const next = Object.assign({}, draft, { name, subtitle })
        if (next.mode === 'url' && next.url.trim() !== '') {
          const code = validateUrl(next.url)
          if (code) {
            report(code)
            return
          }
          next.url = next.url.trim()
        }
        if (next.enabled && configuredSource(next) === '' && name === '') {
          report('enableNeedsBrand')
          return
        }
        const failure = store.set(next)
        if (failure) {
          report(failure)
          return
        }
        report(null)
        setSaved(true)
      }

      function acceptFile(file) {
        const code = validateFile(file)
        if (code) {
          report(code)
          return
        }
        readFileAsDataUrl(file).then((dataUrl) => {
          if (typeof dataUrl !== 'string' || dataUrl.indexOf('data:image/') !== 0) {
            report('read')
            return
          }
          update({ dataUrl, mode: 'upload', enabled: true })
          setFileName(file.name || '')
          setTab('upload')
        }).catch(() => report('read'))
      }

      function onFileChange(event) {
        const input = event.currentTarget
        const file = input.files && input.files[0]
        if (file) acceptFile(file)
        input.value = ''
      }

      function onDrop(event) {
        event.preventDefault()
        event.stopPropagation()
        setDragging(false)
        const files = event.dataTransfer && event.dataTransfer.files
        if (files && files[0]) acceptFile(files[0])
      }

      function tabButton(mode, label) {
        const selected = tab === mode
        return h('button', {
          type: 'button',
          'aria-pressed': selected,
          className: 'cbl-tab' + (selected ? ' cbl-tabActive' : ''),
          onClick: () => selectMode(mode),
        }, label)
      }

      function sourceField() {
        if (tab === 'url') {
          return h('div', { className: 'cbl-field' },
            h('label', { className: 'cbl-label', htmlFor: 'cbl-url' }, t('field.url')),
            h('input', {
              id: 'cbl-url',
              className: 'cbl-input',
              type: 'url',
              inputMode: 'url',
              spellCheck: false,
              placeholder: t('field.urlPlaceholder'),
              value: draft.url,
              onChange: (event) => {
                const value = event.currentTarget.value
                // Entering a source opts into custom branding; the switch can
                // still turn it off afterwards.
                update(value.trim() === '' ? { url: value, mode: 'url' } : { url: value, mode: 'url', enabled: true })
              },
              onKeyDown: (event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  applyDraft()
                }
              },
            }),
            h('div', { className: 'cbl-hint' }, t('field.urlHint')),
          )
        }
        return h('div', { className: 'cbl-field' },
          h('input', {
            ref: fileRef,
            type: 'file',
            accept: 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml',
            style: { display: 'none' },
            onChange: onFileChange,
          }),
          h('div', {
            className: 'cbl-drop' + (dragging ? ' cbl-dropOver' : ''),
            role: 'button',
            tabIndex: 0,
            onClick: () => {
              if (fileRef.current) fileRef.current.click()
            },
            onKeyDown: (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                if (fileRef.current) fileRef.current.click()
              }
            },
            onDragEnter: (event) => {
              event.preventDefault()
              event.stopPropagation()
              setDragging(true)
            },
            onDragOver: (event) => {
              event.preventDefault()
              event.stopPropagation()
              setDragging(true)
            },
            onDragLeave: (event) => {
              event.stopPropagation()
              setDragging(false)
            },
            onDrop: onDrop,
          },
          h(BrandGlyph, { size: 28 }),
          h('div', { className: 'cbl-label' }, t('drop.title')),
          h('div', { className: 'cbl-hint' }, t('field.uploadHint')),
          ),
          h('div', { className: 'cbl-hint' }, t('drop.hint')),
        )
      }

      function preview() {
        const broken = imageError
        return h('div', { className: 'cbl-preview' },
          h('div', { className: 'cbl-previewTile' },
            previewSrc === '' || broken
              ? h(BrandGlyph, { size: 40 })
              : h('img', {
                className: 'cbl-previewImage',
                src: previewSrc,
                alt: '',
                draggable: false,
                onError: () => setImageError(true),
              }),
          ),
          h('div', { className: 'cbl-previewMeta' },
            h('div', { className: 'cbl-label' }, t('preview.title')),
            h('div', { className: 'cbl-hint' },
              broken ? t('error.imageLoad') : (previewSrc === '' ? t('preview.empty') : t('preview.hint'))),
            draft.mode === 'upload' && fileName !== ''
              ? h('div', { className: 'cbl-hint' }, t('file.selected') + ': ' + fileName)
              : null,
            h('div', { className: 'cbl-actual' },
              h('span', { className: 'cbl-hint' }, t('preview.actual')),
              h('span', { className: 'cbl-actualBox' },
                previewSrc === '' || broken
                  ? h(BrandGlyph, { size: 20 })
                  : h('img', {
                    src: previewSrc,
                    alt: '',
                    draggable: false,
                    style: { width: '24px', height: '24px', objectFit: 'contain' },
                  }),
              ),
            ),
          ),
        )
      }

      function scopeRow(key, label, hint) {
        const on = draft[key] === true
        return h('div', { className: 'cbl-row' },
          h('div', { className: 'cbl-rowText' },
            h('div', { className: 'cbl-label' }, label),
            h('div', { className: 'cbl-hint' }, hint),
          ),
          h('button', {
            type: 'button',
            role: 'switch',
            'aria-checked': on,
            'aria-label': label,
            className: 'cbl-switch' + (on ? ' cbl-switchOn' : ''),
            onClick: () => toggleScope(key),
          }, h('span', { className: 'cbl-thumb' })),
        )
      }

      function scopeCard() {
        return h('div', { className: 'cbl-card' },
          h('div', { className: 'cbl-cardTitle' }, t('scope.title')),
          scopeRow('showInSidebar', t('scope.sidebar'), t('scope.sidebarHint')),
          scopeRow('showInHero', t('scope.hero'), t('scope.heroHint')),
        )
      }

      function namePreview() {
        const name = draft.name.trim()
        const subtitle = draft.subtitle.trim()
        return h('div', { className: 'cbl-namePreview' },
          h(BrandGlyph, { size: 20 }),
          name !== ''
            ? h(BrandNameText, { name, subtitle })
            : h('span', { className: 'cbl-namePreviewEmpty' }, t('name.previewEmpty')),
        )
      }

      function nameCard() {
        return h('div', { className: 'cbl-card' },
          h('div', { className: 'cbl-cardTitle' }, t('name.title')),
          h('div', { className: 'cbl-field' },
            h('label', { className: 'cbl-label', htmlFor: 'cbl-name' }, t('name.label')),
            h('input', {
              id: 'cbl-name',
              className: 'cbl-input',
              type: 'text',
              maxLength: 60,
              placeholder: t('name.placeholder'),
              value: draft.name,
              onChange: (event) => {
                const value = event.currentTarget.value
                update(value.trim() === '' ? { name: value } : { name: value, enabled: true })
              },
              onKeyDown: (event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  applyDraft()
                }
              },
            }),
          ),
          h('div', { className: 'cbl-field' },
            h('label', { className: 'cbl-label', htmlFor: 'cbl-name-subtitle' }, t('name.subtitleLabel')),
            h('input', {
              id: 'cbl-name-subtitle',
              className: 'cbl-input',
              type: 'text',
              maxLength: 60,
              placeholder: t('name.subtitlePlaceholder'),
              value: draft.subtitle,
              onChange: (event) => update({ subtitle: event.currentTarget.value }),
              onKeyDown: (event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  applyDraft()
                }
              },
            }),
          ),
          h('div', { className: 'cbl-label' }, t('name.preview')),
          namePreview(),
          h('div', { className: 'cbl-hint' }, t('name.hint')),
        )
      }

      return h('div', { className: 'cbl-root' },
        h('style', null, CSS),
        h('div', { className: 'cbl-head' },
          h('div', { className: 'cbl-title' }, t('page.title')),
          h('div', { className: 'cbl-desc' }, t('page.description')),
        ),
        h('div', { className: 'cbl-card' },
          h('div', { className: 'cbl-row' },
            h('div', { className: 'cbl-rowText' },
              h('div', { className: 'cbl-label' }, t('toggle.label')),
              h('div', { className: 'cbl-hint' }, masterActive ? t('toggle.onHint') : t('toggle.offHint')),
            ),
            h('button', {
              type: 'button',
              role: 'switch',
              'aria-checked': masterActive,
              'aria-label': t('toggle.label'),
              className: 'cbl-switch' + (masterActive ? ' cbl-switchOn' : ''),
              onClick: toggleEnabled,
            }, h('span', { className: 'cbl-thumb' })),
          ),
        ),
        h('div', { className: 'cbl-card' },
          h('div', { className: 'cbl-cardTitle' }, t('source.title')),
          h('div', { className: 'cbl-tabs', role: 'group', 'aria-label': t('source.title') },
            tabButton('url', t('source.url')),
            tabButton('upload', t('source.upload')),
          ),
          sourceField(),
          preview(),
        ),
        scopeCard(),
        nameCard(),
        h('div', { className: 'cbl-hint' }, t('browser.hint')),
        error !== '' ? h('div', { className: 'cbl-error', role: 'alert' }, error) : null,
        h('div', { className: 'cbl-card' },
          h('div', { className: 'cbl-actionsRow' },
            h('button', {
              type: 'button',
              className: 'cbl-button cbl-buttonPrimary',
              disabled: !dirty,
              onClick: applyDraft,
            }, t('action.apply')),
            (hasBrand || dirty)
              ? h('button', { type: 'button', className: 'cbl-link', onClick: resetDraft }, t('action.reset'))
              : null,
            dirty
              ? h('span', { className: 'cbl-hint' }, t('status.pending'))
              : (saved ? h('span', { className: 'cbl-success' }, t('status.saved')) : null),
          ),
          h('div', { className: 'cbl-hint' }, t('status.formHint')),
          h('div', { className: 'cbl-muted' }, t('hint.storage')),
        ),
      )
    }

    // ---------------------------------------------------------------------
    // Client plugin
    // ---------------------------------------------------------------------

    function apply(ctx) {
      const boundT = ctx.locale.bind(NS)

      ctx.effect(() => {
        try {
          return ctx.locale.register(NS, { zh, en })
        } catch (error) {
          console.error('[custom-brand-logo] locale registration failed', error)
          return () => {}
        }
      }, 'custom-brand-logo:dictionaries')

      // The settings page is always available, even while the logo is disabled,
      // so the feature can be configured before it is turned on.
      ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'custom-brand-logo',
        order: 100,
        label: () => boundT('nav'),
        locale: NS,
        inject: () => ({ store }),
      }, SettingsPage))

      // Keep the browser tab title and favicon consistent with the brand.
      ctx.effect(() => startBrowserChrome(store), 'custom-brand-logo:browser-chrome')

      // Each occupant exists only while its target has something to show;
      // otherwise that slot keeps rendering the shipped fallback.
      ctx.effect(() => {
        const owners = { sidebarMark: null, heroMark: null, name: null }
        const targets = [
          {
            key: 'sidebarMark',
            slot: 'sidebar.brand.mark',
            component: SidebarMark,
            active: state => sidebarSource(state) !== '',
          },
          {
            key: 'heroMark',
            slot: 'conversation.hero.brand.mark',
            component: HeroMark,
            active: state => heroSource(state) !== '',
          },
          {
            key: 'name',
            slot: 'sidebar.brand.name',
            component: NameOccupant,
            active: state => customName(state) !== '',
          },
        ]

        const syncOne = (target) => {
          const active = target.active(store.getSnapshot())
          if (active && owners[target.key] === null) {
            try {
              owners[target.key] = ctx.slots.inject(target.slot, () => ctx.slots.register({
                name: target.slot,
                // Beat a shipped brand occupant registered at the default rank;
                // a same-priority second registration would throw.
                priority: -10,
                locale: NS,
                inject: () => ({ store }),
              }, target.component))
            } catch (error) {
              console.error('[custom-brand-logo] ' + target.slot + ' registration failed', error)
            }
          } else if (!active && owners[target.key] !== null) {
            const dispose = owners[target.key]
            owners[target.key] = null
            dispose()
          }
        }

        const sync = () => {
          for (const target of targets) syncOne(target)
        }

        const unsubscribe = store.subscribe(sync)
        sync()
        return () => {
          unsubscribe()
          for (const target of targets) {
            if (owners[target.key] !== null) {
              const dispose = owners[target.key]
              owners[target.key] = null
              dispose()
            }
          }
        }
      }, 'custom-brand-logo:occupants')
    }

    return {
      inject: ['slots', 'locale'],
      apply,
    }
  },
})
