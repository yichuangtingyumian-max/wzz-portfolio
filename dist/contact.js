(() => {
  const section = document.getElementById('contact');
  if (!section) return;
  const feedback = section.querySelector('[data-contact-feedback]');
  const timers = new WeakMap();

  async function copyText(value) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      const previousFocus = document.activeElement;
      const selection = window.getSelection();
      const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index).cloneRange()) : [];
      const area = document.createElement('textarea');
      area.value = value;
      area.readOnly = true;
      area.style.cssText = 'position:fixed;inset:0 auto auto 0;width:1px;height:1px;opacity:0;pointer-events:none';
      document.body.append(area);
      area.focus({ preventScroll: true });
      area.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* Keep the visible value available for manual copying. */ }
      area.remove();
      previousFocus?.focus({ preventScroll: true });
      if (selection) { selection.removeAllRanges(); ranges.forEach(range => selection.addRange(range)); }
      return copied;
    }
  }

  section.querySelectorAll('[data-contact-copy]').forEach(button => {
    const label = button.querySelector('[data-copy-label]');
    const idleLabel = label.textContent;
    button.addEventListener('click', async () => {
      if (button.getAttribute('aria-busy') === 'true') return;
      button.setAttribute('aria-disabled', 'true');
      button.setAttribute('aria-busy', 'true');
      const copied = await copyText(button.dataset.contactCopy);
      button.removeAttribute('aria-disabled');
      button.removeAttribute('aria-busy');
      clearTimeout(timers.get(button));
      label.textContent = copied ? '已复制 ✓' : '未复制';
      timers.set(button, setTimeout(() => { label.textContent = idleLabel; }, 1800));
      feedback.dataset.copyFailed = String(!copied);
      feedback.textContent = copied ? button.dataset.copyName + '已复制。' : '无法自动复制，请选中联系方式手动复制。';
      if (!copied) {
        const value = button.closest('dd').querySelector('a');
        const range = document.createRange();
        range.selectNodeContents(value);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    });
  });
})();
