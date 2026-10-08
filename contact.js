(() => {
  const section = document.getElementById('contact');
  if (!section) return;
  const feedback = section.querySelector('[data-contact-feedback]');
  const timers = new WeakMap();
  let feedbackTimer;

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
      label.textContent = copied ? '已复制' : '未复制';
      button.dataset.copySuccess = String(copied);
      timers.set(button, setTimeout(() => { label.textContent = idleLabel; button.removeAttribute('data-copy-success'); }, 1800));
      clearTimeout(feedbackTimer);
      feedback.dataset.copyFailed = String(!copied);
      feedback.textContent = copied ? button.dataset.copyName + '已复制。' : '自动复制失败，内容已选中，请手动复制。';
      if (copied) feedbackTimer = setTimeout(() => { feedback.textContent = ''; }, 2600);
      if (!copied) {
        const value = button.querySelector('[data-contact-value]');
        const range = document.createRange();
        range.selectNodeContents(value);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    });
  });

  const qrObject = section.querySelector('.contact-qr-object');
  const qrCard = qrObject?.querySelector('.contact-qr-card');
  if (qrCard) {
    let layerTimer;
    const lowerQr = () => {
      if (!qrObject.matches(':hover')) qrObject.classList.remove('is-contact-qr-raised');
    };
    qrObject.addEventListener('pointerenter', () => {
      if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      clearTimeout(layerTimer);
      qrObject.classList.add('is-contact-qr-raised');
    });
    qrObject.addEventListener('pointerleave', () => {
      clearTimeout(layerTimer);
      // Keep the heart and sticker behind the code throughout its smooth return.
      const duration = parseFloat(getComputedStyle(qrCard).transitionDuration) * 1000;
      layerTimer = setTimeout(lowerQr, duration + 50);
    });
    qrCard.addEventListener('transitionend', event => {
      if (event.target === qrCard && event.propertyName === 'transform') lowerQr();
    });
  }

  const seal = document.querySelector('[data-contact-seal]');
  if (!seal) return;
  const imprint = seal.querySelector('.contact-seal-imprint');
  const base = seal.querySelector('.contact-seal-disc');
  const formation = seal.querySelector('.contact-seal-formation');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  let finishTimer;
  let played = false;

  function settle() {
    played = true;
    clearTimeout(finishTimer);
    observer?.disconnect();
    seal.dataset.sealState = 'settled';
    formation.removeEventListener('animationend', onFormationEnd);
  }

  function onFormationEnd(event) {
    if (event.target === formation && event.animationName === 'contact-seal-press') settle();
  }

  function reveal() {
    if (played) return;
    played = true;
    observer.disconnect();
    if (reducedMotion.matches) { settle(); return; }
    seal.dataset.sealState = 'forming';
    formation.addEventListener('animationend', onFormationEnd);
    // A missing/cancelled animation must still leave the real badge visible.
    const duration = parseFloat(getComputedStyle(formation).animationDuration) * 1000;
    finishTimer = setTimeout(settle, Number.isFinite(duration) ? duration + 100 : 2800);
  }

  function prepareReveal() {
    if (played) return;
    if (reducedMotion.matches || !('IntersectionObserver' in window)) { settle(); return; }
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) reveal();
    }, { threshold: .25, rootMargin: '0px 0px -24px 0px' });
    // Show a metal disc only once the final image is ready. No-JS stays a complete PNG.
    seal.dataset.sealState = 'pending';
    observer.observe(seal);
  }

  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) settle(); });
  function waitForImage(image) {
    if (image.complete) return image.naturalWidth ? Promise.resolve() : Promise.reject(new Error('Badge image unavailable'));
    return new Promise((resolve, reject) => {
      const loaded = () => { image.removeEventListener('error', failed); resolve(); };
      const failed = () => { image.removeEventListener('load', loaded); reject(new Error('Badge image unavailable')); };
      image.addEventListener('load', loaded, { once: true });
      image.addEventListener('error', failed, { once: true });
    });
  }
  if (reducedMotion.matches || !('IntersectionObserver' in window)) settle();
  else if ([imprint, base].every(image => image.complete && image.naturalWidth)) prepareReveal();
  else Promise.all([imprint, base].map(waitForImage)).then(prepareReveal).catch(settle);
})();
