const fs = require('node:fs');
const path = require('node:path');
const { readerHeaderActions } = require('./reader-navigation.cjs');
const { projectSwitch } = require('./project-navigation.cjs');

const title = '缤客住宿 · Vibe Coding 协同设计';
const pages = [
  { title: '项目背景与 AI 协同路径', src: 'assets/images/vibe-coding-01.png', width: 1920, height: 3810 },
  { title: '产品方案、视觉精修与迭代验证', src: 'assets/images/vibe-coding-02.png', width: 1920, height: 5612 },
  { title: '项目部署、交付与复盘', src: 'assets/images/vibe-coding-03.png', width: 1920, height: 1701 },
];

const escape = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

// This project shares the existing reader controls without changing older readers.
function writeVibeCodingDocument(lightbox, outputFile = path.join(__dirname, 'vibe-coding.html')) {
  if (typeof lightbox !== 'string' || !lightbox.includes('class="lightbox"')) {
    throw new Error('Vibe Coding requires the shared project-reader lightbox.');
  }
  for (const page of pages) {
    if (!fs.statSync(path.join(__dirname, page.src), { throwIfNoEntry: false })?.isFile()) {
      throw new Error('Missing Vibe Coding artwork: ' + page.src);
    }
  }
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escape(title)} · 王增增作品集</title>
  <meta name="description" content="住宿预订体验改版，探索 AI 辅助设计与前端 Demo 构建的协同工作流。">
  <link rel="icon" href="favicon.svg">
  <link rel="stylesheet" href="design-tokens.css">
  <link rel="stylesheet" href="home.css">
  <link rel="stylesheet" href="portfolio.css">
  <link rel="stylesheet" href="reader-navigation.css">
  <link rel="stylesheet" href="vibe-coding-reader.css">
  <script src="portfolio.js" defer></script>
  <script src="reader-navigation.js" defer></script>
</head>
<body class="reader-page refreshed-home vibe-coding-reader">
  <a class="skip" href="#artwork">跳到作品正文</a>
  <header class="reader-header">
    <a href="index.html#work" class="back-link">← 作品目录</a>
    <h1 title="${escape(title)}">${escape(title)}</h1>
    ${readerHeaderActions()}
  </header>
  <div class="reader-layout">
    <aside class="reader-sidebar" id="reader-directory">
      <p class="eyebrow">CONTENTS / 作品目录</p>
      <nav aria-label="作品分段导航">${pages.map((page, i) => `
        <a href="#sheet-${i + 1}"${i === 0 ? ' aria-current="location"' : ''}><span>${String(i + 1).padStart(2, '0')}</span>${escape(page.title)}</a>`).join('')}
      </nav>
      <p class="reader-tip">共 ${pages.length} 张作品 · 连续滚动阅读<br>点击作品可放大查看</p>
      <a class="reader-home" href="index.html#work">返回全部作品</a>
    </aside>
    <main class="artwork" id="artwork" aria-label="${escape(title)}原稿">${pages.map((page, i) => `
      <section class="art-sheet" id="sheet-${i + 1}" aria-label="${escape(page.title)}">
        <button type="button" class="art-button" data-image="${escape(page.src)}" data-document="true" data-caption="${escape(title)} · ${escape(page.title)}" aria-label="放大：${escape(page.title)}">
          <img src="${escape(page.src)}" alt="${escape(page.title)}" width="${page.width}" height="${page.height}"${i ? ' loading="lazy"' : ' fetchpriority="high"'} decoding="async">
          <span class="enlarge-label">放大查看 ↗</span>
        </button>
      </section>`).join('')}
      ${projectSwitch('vibe-coding')}
      <footer class="reader-footer">
        <a href="index.html#work">全部作品</a>
        <a href="#artwork">回到开篇 ↑</a>
        <span>© 2026 王增增</span>
      </footer>
    </main>
  </div>
  <div class="reading-progress" aria-hidden="true"></div>
  ${lightbox}
</body>
</html>`;
  fs.writeFileSync(outputFile, html);
}

module.exports = { writeVibeCodingDocument };
