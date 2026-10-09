(() => {
  const button = document.querySelector('[data-reader-directory-toggle]');
  const directory = document.getElementById(button?.getAttribute('aria-controls'));
  const sheets = [...document.querySelectorAll('.art-sheet')];
  if (!button || !directory || !sheets.length) return;

  const label = button.querySelector('[data-reader-directory-label]');
  const directoryNav = directory.querySelector('nav');
  const body = document.body;
  // Match the existing reader's current-page threshold in portfolio.js.
  const readingLine = 180;
  let correctionFrame = 0;
  let directoryTop = directory.scrollTop;
  let directoryLeft = directoryNav?.scrollLeft || 0;

  function capturePosition() {
    if (window.scrollY <= 1) return { top: true };
    let sheet = sheets[0];
    for (const candidate of sheets) {
      if (candidate.getBoundingClientRect().top <= readingLine) sheet = candidate;
    }
    const rect = sheet.getBoundingClientRect();
    if (rect.bottom < readingLine) {
      return { sheet, after: readingLine - rect.bottom };
    }
    return { sheet, ratio: Math.max(0, (readingLine - rect.top) / Math.max(1, rect.height)) };
  }

  function restorePosition(position) {
    let top = 0;
    if (!position.top) {
      const rect = position.sheet.getBoundingClientRect();
      const point = position.after === undefined
        ? rect.top + position.ratio * rect.height
        : rect.bottom + position.after;
      top = window.scrollY + point - readingLine;
    }
    const limit = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({ left: window.scrollX, top: Math.max(0, Math.min(limit, top)), behavior: 'instant' });

    // Fractional pixel rounding must not switch the highlight to an adjacent page.
    if (!position.top) {
      const start = position.sheet.getBoundingClientRect().top - readingLine;
      const next = sheets[sheets.indexOf(position.sheet) + 1];
      const end = next ? next.getBoundingClientRect().top - readingLine : Infinity;
      const nudge = start > 0 && start <= 1 ? start + 1
        : end <= 0 && end >= -1 ? end - 1 : 0;
      if (nudge) {
        window.scrollTo({ left: window.scrollX, top: Math.max(0, Math.min(limit, window.scrollY + nudge)), behavior: 'instant' });
      }
    }
  }

  button.hidden = false;
  button.addEventListener('click', () => {
    if (correctionFrame) cancelAnimationFrame(correctionFrame);
    const position = capturePosition();
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    if (!expanded) {
      directoryTop = directory.scrollTop;
      directoryLeft = directoryNav?.scrollLeft || 0;
    }

    body.classList.add('reader-navigation-adjusting');
    body.classList.toggle('reader-directory-hidden', !expanded);
    directory.hidden = !expanded;
    button.setAttribute('aria-expanded', String(expanded));
    label.textContent = expanded ? '隐藏目录' : '显示目录';
    if (expanded) {
      directory.scrollTop = directoryTop;
      if (directoryNav) directoryNav.scrollLeft = directoryLeft;
    }
    restorePosition(position);

    correctionFrame = requestAnimationFrame(() => {
      correctionFrame = 0;
      restorePosition(position);
      body.classList.remove('reader-navigation-adjusting');
      // Reuse the existing current-page/progress updater rather than duplicating it.
      window.dispatchEvent(new Event('scroll'));
    });
  });
})();
