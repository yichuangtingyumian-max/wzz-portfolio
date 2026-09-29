# 作品集版本档案

本目录整理可确认的历史版本，当前首页仍位于项目根目录。早期历史和当前完整快照也保存在仓库的 `archive-2026-09-28` Release 中。

| 标签 / 文件 | 内容 | 来源 |
| --- | --- | --- |
| `versions/homepage-initial/index.html` | 早期首页单文件审核版 | 从本地保留的审核 HTML 原样归档，文件保存时间为 2026-09-23；不是重新构造的 Git 历史 |
| 历史归档内 `66c8265` | 三个独立项目页、真实生活相册、联系方式区域 | 原有 Git 提交，保存在 Release 的 `portfolio-history.bundle` 中 |
| 历史归档内 `f588c62` | 增加微信二维码复制等完善；首个公开网站版本 | 原有 Git 提交，保存在 Release 的 `portfolio-history.bundle` 中 |
| GitHub `main` | 照片封面、固定侧边导航、About 卡片、能力文件夹、经历翻转、项目交互和折叠相册 | 最新版，已通过 GitHub Pages 发布 |

## 查看历史版本

Release 中的 `portfolio-history.bundle` 可以恢复原有 Git 提交历史；`portfolio-current.zip` 是当时的最新完整网站快照。当前 GitHub `main` 是已上线版本。在下载的目录运行 `node preview.cjs`，然后浏览 `http://127.0.0.1:4174/`。先停止其他占用该端口的预览。

早期单文件首页可以直接用浏览器打开 `versions/homepage-initial/index.html`。

## 范围说明

- 原始项目图片、生活照片、字体、页面代码和交互脚本随原有历史保留。
- 保留已有提交，不修改原有提交的时间或作者，也不将无法确认的中间状态伪造成历史版本。
- 临时发布凭证、发布压缩包、工具运行文件不纳入版本档案。
- 在线网站由 GitHub Actions 从当前仓库构建并部署。仓库中旧版本的原始提交记录仍可从 Release 的 Git bundle 恢复。

