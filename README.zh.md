# dsh-brand-logo

把 DeepSeek Harness 侧栏顶部的品牌行 —— 鲸鱼图标加 `DEEPSEEK HARNESS` 文字 —— 换成你自己的图片，
或者用应用自带字体排一段字标。

不改官方任何文件，也不禁用官方品牌插件：插件以更低的 priority 占用品牌槽位，卸载后官方内容自动回来。

![安装后侧栏顶部：鲸鱼图标 + DEEPSEEK HARNESS 字标](assets/screenshot-sidebar.png)

## 原理

侧栏这一行由两个客户端槽位（slot）拼成：

| 槽位 | 内容 | owner props |
| --- | --- | --- |
| `sidebar.brand.mark` | 左侧图标（侧栏折叠成 rail 时只渲染这个槽位） | `{ size: number }`，24 |
| `sidebar.brand.name` | 右侧文字 | 无 |

两个都是 `single` 槽位，官方 `@deepseek-ai/dsh-client-ui-brand-official` 以默认 priority `0`
占着它们。本插件用 `priority: -10` 注册同名槽位，槽位规则取最小 priority，因此不需要停用官方插件。
插件没有注册的那个槽位保持官方内容 —— 所以下面两种模式下都能把鲸鱼图标留着。

## 安装

```sh
dsh plugin --profile web add github:squidwantyou/dsh-brand-logo
```

装完**重启 `dsh web`**（新进程才会读到新的客户端 bundle；老进程可能还在发旧的模块集），然后刷新页面。

也可以用宿主自带的插件管理器，指向这个目录以 bundle 方式安装。

已在 `dsh` 0.2.2-rc.5（`web` profile）上验证。见[兼容性](#兼容性)。

## 使用

默认就是排版字标：`DEEPSEEK` 权重 500、`HARNESS` 权重 400 且 60% 不透明度，13px、
字距 0.12em、字体 `Montserrat`（应用本来就加载的品牌字体）。鲸鱼图标保持不变。

两个脚本用来重写编译后的 bundle，在包目录里运行：

```sh
# 重排字标（1–3 个词；第一个词实心，后面的词更淡）
node tools/set-text.mjs DEEPSEEK HARNESS --size 13 --tracking .12em --weights 500,400 --opacity 1,.6

# 或者换成图片
node tools/set-logo.mjs ./my-logo.png
```

`set-text.mjs` 参数：`--size`（px）、`--tracking`（CSS 长度）、`--gap`（词间距）、
`--weights` / `--opacity`（按词逗号分隔）、`--case upper|none`。

`set-logo.mjs` 支持 `svg`、`png`、`jpg`、`webp`、`gif`、`avif`，按图片宽高比自动选槽位：

- 宽高比 ≥ 1.7 → 当作文字标，渲染在 `sidebar.brand.name`，高 24px；
- 否则 → 当作方形图标，渲染在 `sidebar.brand.mark`，24×24。

可以 `--mode wide|icon` 强制指定，`--height 22` 改高度，`--aspect` 跳过检测。

图片会复制进 `assets/` 并以 data URL 内联进 `client.js` —— 客户端模块拿不到 cordis 行里的配置，
图片必须在构建时编进模块。建议直接用品牌行需要的尺寸（2× 屏约 48px 高、裁边紧、透明背景），
每多一字节都会进到浏览器下载的模块里。

改完同样重启 `dsh web` 再刷新。如果是以目录链接方式安装的，文件 mtime 变了之后刷新一般也能生效。

## 目录结构

```
index.js              宿主侧是空的（插件没有服务端行为）
client.js             编译后的浏览器模块：配置 + 槽位注册
cordis.patch.yml      把 bundle 插进 loader
tools/set-text.mjs    排版字标构建脚本
tools/set-logo.mjs    图片构建脚本（宽高比检测、data URL 内联）
tools/lib/            共享写入逻辑与模板定位
tools/client.template.js  组件源码，想改渲染方式就改这里再跑构建脚本
locale/en.json        插件元信息（标题、描述、详情文档）
locale/zh.json
icon.svg              插件行图标
assets/               截图，以及你内联进来的图片
docs/DETAIL.md        插件详情页长文
```

## 兼容性

针对 `dsh` 0.2.2-rc.5 构建并验证。依赖宿主三件东西，都属于客户端槽位体系：上面两个槽位名、
`single` 槽位的 priority 遮蔽规则、以及默认排版用的 `--dsw-font-family-brand` 变量。
如果未来版本改了槽位名，插件只是不再命中、官方品牌自动恢复，不会有别的影响。

## 卸载

用宿主插件管理器移除（或 `dsh plugin --profile web remove dsh-brand-logo`），重启即可。
官方品牌行会自动回来。

## 许可

MIT
