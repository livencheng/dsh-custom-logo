# dsh-custom-logo

Repository: <https://github.com/livencheng/dsh-custom-logo> · Package: `dsh-custom-brand-logo` · License: MIT

A shareable DeepSeek Harness (DSH) Web UI plugin, distributed from this GitHub
repository as the `dsh-custom-brand-logo` bundle, that replaces the built-in
brand surfaces with your own:

- the brand mark in the **top-left sidebar** (expanded brand row and collapsed rail);
- the **sidebar brand name** — by default "DSH本地构建" plus the build version;
- the brand mark on the blank **New Session** page (the animated fish before the headline);
- the **browser tab title** (the session title prefix is preserved) and the **tab icon**.

The plugin adds a **Brand Logo** page to Settings where the logo image, the name,
the subtitle and each location's visibility are configured.

## Features

- One custom logo image for all marks:
  - upload a PNG / JPEG / WebP / GIF / SVG file (up to 1 MB, drag & drop or file picker);
  - or use an image address (absolute `https://…`, a relative path, or a `data:image/…` URL).
- Custom brand name with an optional smaller subtitle line, replacing the default
  local-build name/version pair.
- Per-location switches: show the logo in the sidebar, on the New Session page, or both.
- `sidebar.brand.mark` / `sidebar.brand.name` / `conversation.hero.brand.mark` are
  only occupied while their content is enabled; otherwise each slot keeps rendering
  the shipped fallback.
- **A single Apply button** commits every change on the page (logo source, name,
  subtitle, switches); edits are previewed before they take effect.
- Enable / disable switch, live preview at both full size and the real 24 px size,
  and **Restore default**.
- Chinese and English UI copy, following the Harness locale.
- No build step, no Host code, no external dependencies: one plain-JavaScript
  Client bundle plus a static locale/icon export.

## Install

The repository is named `dsh-custom-logo`; the DSH bundle package inside it is
`dsh-custom-brand-logo`. The plugin is a standard DSH bundle
(`dsh.bundle.patch` + `dsh.client`). Install it into a profile, then restart or
refresh the Web UI as your profile requires.

### From GitHub (this repository)

```sh
dsh plugin --profile <profile> add github:livencheng/dsh-custom-logo
```

### From a local clone

```sh
git clone https://github.com/livencheng/dsh-custom-logo.git
dsh plugin --profile <profile> add ./dsh-custom-logo
```

### From a packed tarball

```sh
pnpm pack                       # produces dsh-custom-brand-logo-0.4.0.tgz
dsh plugin --profile <profile> add ./dsh-custom-brand-logo-0.4.0.tgz
```

The package ships plain JavaScript, so no `prepare`/build script (and therefore
no pnpm build-script allowance) is needed.

In the Web UI you can also install a local folder through the Plugin Manager.

> **Note:** installing changes the profile, not this checkout. Remove it with
> `dsh plugin --profile <profile> remove dsh-custom-brand-logo`.

## Use

1. Open **Settings** (sidebar foot) and choose **Brand Logo**.
2. Pick **Image address** or **Upload image**, enter a name and optional
   subtitle, and choose the display locations. Every control edits a local draft
   and previews immediately; nothing is stored yet.
3. Press the single **Apply** button at the bottom to commit all changes.
   Uploading does not take effect until Apply.
4. Use the top switch to temporarily show the built-in branding again, or
   **Restore default** (also committed with Apply) to remove everything.
5. Once applied, the browser tab title and icon follow the custom name and logo.

## Where the configuration is stored

- Everything is saved in the browser's `localStorage` under the key
  `dsh.custom-brand-logo.v1`. Nothing is uploaded to a server.
- The setting is **per browser and per origin**: another browser or device keeps
  its own branding.
- An uploaded file is embedded as a `data:image/…` URL, which is why uploads are
  limited to 1 MB (older browsers can hit the localStorage quota earlier; the
  page then reports that saving failed).
- An image address is loaded directly by the browser; the remote server must
  allow the image to be displayed (normal `<img>` rules, no CORS requirement).
- While custom branding is on, the browser tab title follows the custom name and
  the tab icon follows the custom logo; the host's session-title prefix is
  preserved. Disabling the plugin restores the original title and icons.
- Disabling the plugin or restoring the default removes the plugin's slot
  occupants, so the built-in mark and name keep rendering. The plugin never
  writes application DOM or CSS outside its own components; its only page-level
  changes are the browser-chrome values (document title and icon links), which
  are restored on unload.

## File structure

This is a single-package DSH bundle — the structure described in the DSH
"Package and install a plugin" guide:

```
dsh-custom-logo/            # GitHub repository
├── .gitignore
├── package.json          # package: dsh-custom-brand-logo; dsh.bundle.patch + dsh.client (web) + display exports
├── cordis.patch.yml      # inserts the `custom-brand-logo` plugin row
├── index.js              # Host half (inert; the browser half does the work)
├── client.js             # browser half: slot occupants + settings page
├── locale/
│   ├── en.json           # plugin-manager title/description (English)
│   └── zh.json           # plugin-manager title/description (Chinese)
├── icon.svg              # original plugin icon
├── README.md
├── README.zh.md
└── LICENSE
```

- `package.json` `exports["./client"]` and `dsh.client` make the browser half part
  of the Web boot graph.
- `locale/*.json` and `icon.svg` are exported so the Plugin Manager can show the
  plugin's title, description, and artwork without activating it.

## Compatibility

- DSH `>= 0.2.1-rc.2` (declared as the top-level `engines.dsh` range the DSH compatibility check reads), Web UI profile.
- Uses only public extension points: the `settings.section` list slot and the
  `sidebar.brand.mark`, `sidebar.brand.name`, `conversation.hero.brand.mark`
  single slots; styles use `--dsw-alias-*` theme tokens.

## Development

There is no build step. The browser half is the `window.__ModuleLoader__.load`
factory format used by DSH Client bundles.

```sh
node --check index.js
node --check client.js
```

After installing, the Settings page appears at **Settings → Brand Logo**, and
each slot occupant is registered only while its content is enabled.

## Repository

- Source and issues: <https://github.com/livencheng/dsh-custom-logo>
- Chinese documentation: [README.zh.md](./README.zh.md)
- The plugin is distributed from Git (it is not published to npm), so install it
  with the `github:` spec shown above.

## License

MIT. See [LICENSE](./LICENSE).
