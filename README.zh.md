# dsh-custom-logo

仓库：<https://github.com/livencheng/dsh-custom-logo> · 包名：`dsh-custom-brand-logo` · 许可证：MIT

一个可分享的 DeepSeek Harness（DSH）Web UI 插件，通过本 GitHub 仓库以
`dsh-custom-brand-logo` bundle 的形式发布：把内置的品牌元素替换成你自己的：

- **左上角侧边栏**的品牌图标（展开的品牌行和折叠栏都会显示）；
- **侧边栏品牌名称**——默认显示“DSH本地构建”和构建版本；
- 空白**新建会话页**标题前的品牌图标（默认是那条动画鱼）；
- **浏览器标签页标题**（保留会话标题前缀）和**标签页图标**。

插件会在设置中增加 **品牌 Logo** 页面，用来配置 Logo 图片、名称、副标题，以及
各显示位置的开关。

## 功能

- 所有品牌图标共用一张自定义图片：
  - 上传 PNG / JPEG / WebP / GIF / SVG 图片（不超过 1 MB，支持拖拽或选择文件）；
  - 或使用图片地址（`https://…` 绝对地址、相对路径、`data:image/…` URL）。
- 自定义品牌名称，可再填一行较小的副标题，用于替换默认的本地构建名称/版本。
- 按位置开关：Logo 可显示在侧边栏、新建会话页，或两处都显示。
- `sidebar.brand.mark` / `sidebar.brand.name` / `conversation.hero.brand.mark`
  只在启用并有内容时占用；否则各槽位继续显示内置内容。
- **页面底部一个“应用”按钮**统一提交全部修改（图片、名称、副标题、显示开关）；
  编辑时只更新预览，不会立即生效。
- 启用 / 关闭开关，完整预览和实际 24 px 尺寸预览，以及 **恢复默认**。
- 中英文界面文案，跟随 Harness 当前语言。
- 无需构建、无 Host 逻辑、无第三方依赖：一个纯 JavaScript Client 包，外加静态
  locale / icon 导出。

## 安装

仓库名是 `dsh-custom-logo`，其中的 DSH bundle 包名是 `dsh-custom-brand-logo`。
插件是标准 DSH bundle（`dsh.bundle.patch` + `dsh.client`），安装到某个 profile
后按该 profile 的要求重启或刷新 Web UI。

### 从 GitHub 安装（本仓库）

```sh
dsh plugin --profile <profile> add github:livencheng/dsh-custom-logo
```

### 从本地 clone 安装

```sh
git clone https://github.com/livencheng/dsh-custom-logo.git
dsh plugin --profile <profile> add ./dsh-custom-logo
```

### 从打包好的 tarball 安装

```sh
pnpm pack                       # 生成 dsh-custom-brand-logo-0.4.0.tgz
dsh plugin --profile <profile> add ./dsh-custom-brand-logo-0.4.0.tgz
```

包内是纯 JavaScript，因此不需要 `prepare`/构建脚本，也不需要放开 pnpm 的
build-script 权限。

在 Web UI 中也可以通过插件管理页面从本地目录安装。

> **提示：** 安装修改的是 profile，不是当前源码目录。卸载命令：
> `dsh plugin --profile <profile> remove dsh-custom-brand-logo`。

## 使用

1. 打开 **设置**（侧边栏底部），选择 **品牌 Logo**。
2. 选择 **图片地址** 或 **上传图片**，填写名称和可选副标题，并选择显示位置。
   所有控件只修改本地草稿并即时预览，不会立即写入配置。
3. 点页面底部的 **应用** 按钮统一提交全部修改；上传图片也要点应用后才生效。
4. 可以用顶部开关临时切回内置品牌；**恢复默认** 同样需要点应用后生效。
5. 应用后，浏览器标签页标题和图标会跟随自定义名称/Logo。

## 配置保存在哪里

- 全部配置保存在浏览器的 `localStorage` 中，键名为 `dsh.custom-brand-logo.v1`，
  不会上传到服务器。
- 设置是 **按浏览器、按 origin** 保存的：其他浏览器或设备需要单独设置。
- 上传的图片会以内嵌 `data:image/…` URL 的形式保存，因此限制为 1 MB（较旧的
  浏览器可能更早达到 localStorage 配额，此时页面会提示保存失败）。
- 图片地址由浏览器直接加载；远程服务器只需允许图片正常显示（普通 `<img>`
  规则，不要求 CORS）。
- 启用自定义品牌时，浏览器标签页标题会跟随自定义名称、标签页图标会跟随自定义
  Logo，并保留 DSH 原有的会话标题前缀；关闭插件后会恢复原来的标题和图标。
- 关闭插件或恢复默认后，插件会移除自己的槽位占位组件，内置品牌图标和名称会
  重新显示；插件不会在应用界面组件之外写 DOM 或 CSS——唯一的页面级改动是
  浏览器标签页标题和图标链接，插件卸载时会恢复原值。

## 文件结构

这是单包 DSH bundle，与 DSH 文档《打包并安装插件》中的结构一致：

```
dsh-custom-logo/            # GitHub 仓库
├── .gitignore
├── package.json          # 包名 dsh-custom-brand-logo；dsh.bundle.patch + dsh.client（web）+ 展示资源导出
├── cordis.patch.yml      # 插入 `custom-brand-logo` 插件行
├── index.js              # Host 端（保持惰性，实际工作都在浏览器端）
├── client.js             # 浏览器端：槽位占位组件 + 设置页面
├── locale/
│   ├── en.json           # 插件管理中的英文标题/描述
│   └── zh.json           # 插件管理中的中文标题/描述
├── icon.svg              # 原创插件图标
├── README.md
├── README.zh.md
└── LICENSE
```

- `package.json` 的 `exports["./client"]` 和 `dsh.client` 让浏览器端进入 Web 启动图。
- `locale/*.json` 和 `icon.svg` 被导出，插件管理页面无需激活插件即可显示标题、
  描述和图标。

## 兼容性

- DSH `>= 0.2.1-rc.2`（在顶层 `engines.dsh` 中声明，DSH 兼容性检查会读取它），Web UI profile。
- 只使用公开扩展点：`settings.section` 列表槽位，以及 `sidebar.brand.mark`、
  `sidebar.brand.name`、`conversation.hero.brand.mark` 三个单槽位；样式全部使用
  `--dsw-alias-*` 主题 token。

## 开发

无需构建。浏览器端采用 DSH Client bundle 使用的
`window.__ModuleLoader__.load` 工厂格式。

```sh
node --check index.js
node --check client.js
```

安装后，设置中会出现 **品牌 Logo** 页面；每个槽位的占位组件只在其内容启用时注册。

## 仓库

- 源码与问题反馈：<https://github.com/livencheng/dsh-custom-logo>
- 英文说明：[README.md](./README.md)
- 插件通过 Git 分发（未发布到 npm），请使用上面的 `github:` 方式安装。

## 许可证

MIT，见 [LICENSE](./LICENSE)。
