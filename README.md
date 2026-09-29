# 王增增 · 设计作品集

在线访问：https://yichuangtingyumian-max.github.io/wzz-portfolio/

首页包含个人与教育、核心能力文件夹、实习经历翻转卡、精选作品、生活相册和联系板块。三个项目页展示原作品，支持分段导航、放大阅读和项目切换。

## 本地浏览

运行 `node preview.cjs`，打开 http://127.0.0.1:4174/ 。无需安装依赖。也可以直接用浏览器打开 `index.html`。

## 构建

运行 `node build-site.cjs`，交付文件位于 `dist/`。GitHub Pages 从此目录发布。原稿和生活照片均存放在仓库，不依赖 Figma 在线访问。

## 内容维护

- 首页：`index.html`；基础样式：`home.css`；本轮新增样式与交互：`portfolio.css`、`portfolio.js`。
- 项目顺序、章节名和图片：`project-content.json`。修改后运行构建命令重新生成三个项目页。
- 长图使用无损 WebP 分片连续展示，原 PNG 用于放大查看。
- 微信目前使用 Figma 中的真实二维码；未将电话擅自当作微信号。
- 项目正文保持原设计，网站未添加原稿之外的效果数据或项目成果。

