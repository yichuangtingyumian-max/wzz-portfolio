# Contact 下载文件

正式简历与作品集是两个不同文件，按原始字节保存，不转换格式或修改内容。

固定发布文件名：

- `wang-zengzeng-resume.pdf`：1 页 PDF 简历，首页「下载简历」直接下载。
- `wang-zengzeng-portfolio.pdf`：38 页作品集，首页「查看作品集」进入 `/portfolio`，阅读页提供 PDF 下载。

两个文件均在构建发布清单中，下载链接使用 HTML download 属性，Netlify 和本地预览提供 attachment 下载响应头。更新简历时直接替换同名 PDF；更新作品集时按根目录 README 中的 PDF 更新流程同步阅读素材。
