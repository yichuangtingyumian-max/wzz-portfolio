# 王增增 · 作品集版本档案

本仓库用于保存个人作品集网站的历史版本和最新可运行快照。

## 版本

- `66c8265`：独立项目页、生活相册和联系方式区域。
- `f588c62`：微信二维码复制等完善，首个线上版本。
- 2026-09-28 工作区快照：侧边导航、照片封面、能力文件夹、经历翻转卡和折叠相册。
- 早期单文件首页：快照内的 `versions/homepage-initial/index.html`。

## 备份形式

完整归档将保存在本仓库的 Releases 中：`portfolio-history.bundle` 保留已提交的 Git 历史；`portfolio-current.zip` 保存当前可运行的网站代码及原始素材。当前快照不伪造为旧的 Git 提交。

解压当前快照，运行 `node preview.cjs` 后访问 `http://127.0.0.1:4174/`。构建命令为 `node build-site.cjs`。

恢复已提交历史：`git clone portfolio-history.bundle portfolio-history`。

GitHub 备份与网站线上发布独立。此仓库为私有仓库。
