(() => {
  const cards = [...document.querySelectorAll('#about .about-cards, #contact .contact-profile-card')];
  if (!cards.length) return;
  const mouseMode = matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)');
  const hint = document.createElement('span');
  hint.className = 'contact-hover-hint';
  hint.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.textContent = '联系我';
  const arrow = document.createElement('span');
  arrow.textContent = '↗';
  hint.append(label, arrow);
  document.body.append(hint);

  let activeCard = null, pointer = null, frame = 0;
  function hide() {
    cancelAnimationFrame(frame);
    frame = 0;
    activeCard?.classList.remove('is-contact-cursor-visible');
    activeCard = null;
    pointer = null;
    hint.classList.remove('is-visible');
  }
  function tokenPixels(styles, name) {
    const value = styles.getPropertyValue(name).trim();
    const unit = value.endsWith('rem') ? parseFloat(getComputedStyle(document.documentElement).fontSize)
      : value.endsWith('em') ? parseFloat(styles.fontSize) : 1;
    return parseFloat(value) * unit;
  }
  function position() {
    frame = 0;
    if (!activeCard || !pointer || !mouseMode.matches) return;
    const bounds = activeCard.getBoundingClientRect();
    const { x, y } = pointer;
    if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) { hide(); return; }
    const styles = getComputedStyle(hint);
    const inset = tokenPixels(styles, '--wzz-space-3');
    const gap = tokenPixels(styles, '--wzz-space-4');
    const left = Math.max(inset, bounds.left + inset);
    const top = Math.max(inset, bounds.top + inset);
    const right = Math.min(document.documentElement.clientWidth, bounds.right) - hint.offsetWidth - inset;
    const bottom = Math.min(document.documentElement.clientHeight, bounds.bottom) - hint.offsetHeight - inset;
    if (right < left || bottom < top) { hide(); return; }
    hint.style.setProperty('--contact-cursor-x', `${Math.max(left, Math.min(x + gap, right))}px`);
    hint.style.setProperty('--contact-cursor-y', `${Math.max(top, Math.min(y + gap, bottom))}px`);
    hint.classList.add('is-visible');
    activeCard.classList.add('is-contact-cursor-visible');
  }
  function track(card, event) {
    if (!mouseMode.matches || event.pointerType !== 'mouse') return;
    // Native copy, download and form controls keep their own feedback unobstructed.
    if (event.target.closest('a, button, input, textarea, select, [contenteditable="true"]')) { hide(); return; }
    if (activeCard !== card) activeCard?.classList.remove('is-contact-cursor-visible');
    activeCard = card;
    pointer = { x: event.clientX, y: event.clientY };
    if (!frame) frame = requestAnimationFrame(position);
  }
  cards.forEach(card => {
    card.addEventListener('pointerenter', event => track(card, event));
    card.addEventListener('pointermove', event => track(card, event));
    card.addEventListener('pointerleave', () => { if (activeCard === card) hide(); });
    card.addEventListener('pointercancel', hide);
  });
  mouseMode.addEventListener('change', hide);
  addEventListener('blur', hide);
  addEventListener('resize', hide);
  addEventListener('scroll', hide, { passive: true, capture: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
})();
