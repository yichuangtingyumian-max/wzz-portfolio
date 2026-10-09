// One control shared by the three project readers and the full portfolio reader.
function readerHeaderActions({ pdfDownload = false } = {}) {
  const download = pdfDownload ? '<a class="portfolio-pdf-download" href="assets/documents/wang-zengzeng-portfolio.pdf" download="wang-zengzeng-portfolio.pdf">下载 PDF</a>' : '';
  return `<div class="reader-header-actions"><button type="button" class="reader-directory-toggle" data-reader-directory-toggle aria-controls="reader-directory" aria-expanded="true" hidden><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="3.5" width="15" height="13" rx="2"/><path d="M7.5 3.5v13M10.5 7h4M10.5 10h4M10.5 13h4"/></svg><span data-reader-directory-label>隐藏目录</span></button>${download}<a href="index.html#contact">联系我 ↗</a></div>`;
}

module.exports = { readerHeaderActions };
