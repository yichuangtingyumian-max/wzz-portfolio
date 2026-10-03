# 王增增 · 设计作品集

在线访问：https://yichuangtingyumian-max.github.io/wzz-portfolio/

首页包含个人与教育、核心能力文件夹、实习经历翻转卡、精选作品、生活相册和联系板块。三个项目页展示原作品，支持分段导航、放大阅读和项目切换。

## 本地浏览

先运行 `pnpm install`，再运行 `pnpm start`，打开 http://127.0.0.1:4174/ 。本地预览通过独立 React Island 加载官方 Agentation 3.1.2，包含标注、Layout Mode、动画暂停、Markdown 复制及官方设置；不配置 MCP。

首次挂载工具前，同源浏览器中的新旧标注与工具设置会原样备份到 `.local-backups/annotation-storage/`。旧版使用的 `wzz-portfolio-annotations` 不会被转换或覆盖；官方数据使用独立存储。不同浏览器、`localhost` / `127.0.0.1` 和端口的存储彼此独立，请保持原预览地址。官方默认只显示最近 7 天的标注，历史快照仍保留在本地备份中。

旧版插件和升级前文件保存在 `.local-backups/agentation-*/`，旧版依赖继续保留。回滚工具（PowerShell）：`$env:WZZ_ANNOTATION_TOOL='legacy'` 后运行 `pnpm start`。关闭全部标注工具：设置 `WZZ_ANNOTATION_TOOL='off'`。恢复官方版：移除该环境变量或设置为 `official`，再重启预览。每次只挂载一种工具，不会新旧叠加。

直接打开 `index.html` 不加载任何标注工具。`NODE_ENV=production` 强制关闭工具及所有 `/__dev/` 路由。预览只监听 `127.0.0.1`；React / Agentation 在内存中打包，不写入网站源码或 `dist/`。

## 构建

运行 `node build-site.cjs`，交付文件位于 `dist/`。GitHub Pages 从此目录发布。原稿和生活照片均存放在仓库，不依赖 Figma 在线访问。

构建完成后会检查发布目录，若包含标注工具、React 或开发文件则构建失败。也可运行 `pnpm check:release` 单独复核。正式构建无需安装开发依赖。

## 内容维护

- 视觉规范：`VISUAL_SYSTEM.md`；字体、颜色、间距、圆角和阴影统一在 `design-tokens.css` 管理。
- 首页样式继续在 `home-refresh.css` 和 `hero-intro.css` 中维护，优先引用语义 Tokens；专项物件构图与项目原稿保留。

- 首页：`index.html`；共用基础样式：`home.css`、`portfolio.css`；首页模块样式：`home-refresh.css`、`hero-intro.css`；交互：`portfolio.js`、`hero-intro.js`。
- 项目顺序、章节名和图片：`project-content.json`。修改后运行构建命令重新生成三个项目页。
- 长图使用无损 WebP 分片连续展示，原 PNG 用于放大查看。
- 微信目前使用 Figma 中的真实二维码；未将电话擅自当作微信号。
- 项目正文保持原设计，网站未添加原稿之外的效果数据或项目成果。
