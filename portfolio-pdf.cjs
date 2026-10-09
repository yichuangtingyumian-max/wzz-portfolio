const fs = require('node:fs');
const path = require('node:path');
const { readerHeaderActions } = require('./reader-navigation.cjs');

const escape = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

// Reuse the existing project reader without changing its three-project flow.
function writePortfolioDocument(lightbox, outputFile = path.join(__dirname, 'portfolio.html')) {
  const pages = JSON.parse(fs.readFileSync(path.join(__dirname, 'portfolio-pdf-content.json'), 'utf8'));
  if (!pages.length) throw new Error('The portfolio reader needs at least one page.');
  const publicBase = process.env.WZZ_PUBLIC_BASE || '/';
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(publicBase)) throw new Error('WZZ_PUBLIC_BASE must be an absolute directory path with a trailing slash.');
  let html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>完整作品集 · 王增增</title>
  <meta name="description" content="王增增的完整作品集，在线连续阅读与放大查看。">
  <link rel="icon" href="favicon.svg">
  <link rel="stylesheet" href="design-tokens.css">
  <link rel="stylesheet" href="home.css">
  <link rel="stylesheet" href="portfolio.css">
  <link rel="stylesheet" href="portfolio-document.css">
  <link rel="stylesheet" href="reader-navigation.css">
  <script src="portfolio.js" defer></script>
  <script src="reader-navigation.js" defer></script>
</head>
<body class="reader-page refreshed-home portfolio-document">
  <a class="skip" href="#artwork">跳到作品正文</a>
  <header class="reader-header">
    <a href="index.html#contact" class="back-link" aria-label="返回首页">← <span class="portfolio-home-label">返回首页</span></a>
    <h1>完整作品集</h1>
    ${readerHeaderActions({ pdfDownload: true })}
  </header>
  <div class="reader-layout">
    <aside class="reader-sidebar" id="reader-directory">
      <p class="eyebrow">CONTENTS / 作品集目录</p>
      <nav aria-label="作品集页码导航">${pages.map((page, i) => `
        <a href="#sheet-${i + 1}"${i === 0 ? ' aria-current="location"' : ''}><span>${String(i + 1).padStart(2, '0')}</span>${escape(page.title)}</a>`).join('')}
      </nav>
      <p class="reader-tip">共 ${pages.length} 页 · 连续滚动阅读<br>点击作品可放大查看</p>
      <a class="reader-home" href="index.html#contact">返回联系页面</a>
    </aside>
    <main class="artwork" id="artwork" aria-label="王增增的完整作品集原稿">${pages.map((page, i) => `
      <section class="art-sheet" id="sheet-${i + 1}" aria-label="${escape(page.title)}">
        <button type="button" class="art-button" data-image="${escape(page.original)}" data-document="true" data-caption="作品集 · ${String(i + 1).padStart(2, '0')}" aria-label="放大：${escape(page.title)}">${page.strips.map((strip, j) => `
          <img src="${escape(strip.src)}" alt="${escape(page.title)}${j ? ' · 续' : ''}" width="${strip.width}" height="${strip.height}"${i || j ? ' loading="lazy"' : ' fetchpriority="high"'} decoding="async">`).join('')}
          <span class="enlarge-label">放大查看 ↗</span>
        </button>
      </section>`).join('')}
      <footer class="reader-footer">
        <a href="index.html#contact">返回首页</a>
        <a href="#artwork">回到开篇 ↑</a>
        <span>© 2026 王增增</span>
      </footer>
    </main>
  </div>
  <div class="reading-progress" aria-hidden="true"></div>
  ${lightbox}
</body>
</html>`;
  // Stable URLs work at /portfolio and /portfolio/, with no base tag affecting page anchors.
  html = html.replace(/\b(src|href|data-image)="((?:assets\/|[a-z0-9-]+\.(?:html|css|js|svg))[^"<>]*)"/g,
    (_, attribute, url) => `${attribute}="${publicBase}${url}"`);
  fs.writeFileSync(outputFile, html);
}

module.exports = { writePortfolioDocument };
