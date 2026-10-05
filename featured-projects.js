(() => {
  const cards = [...document.querySelectorAll('#work .featured-project')];
  if (!cards.length) return;
  const mouseMode = matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)');
  let activeCard = null, lastPointer = null, frame = 0;
  function spacingPixels(styles, token) {
    const value = styles.getPropertyValue(token).trim();
    const unit = value.endsWith('rem') ? parseFloat(getComputedStyle(document.documentElement).fontSize)
      : value.endsWith('em') ? parseFloat(styles.fontSize) : 1;
    return parseFloat(value) * unit;
  }
  function hideCursor() {
    cancelAnimationFrame(frame);
    frame = 0;
    activeCard?.classList.remove('is-pointer-inside');
    activeCard = null;
    lastPointer = null;
  }
  function positionCursor() {
    frame = 0;
    if (!activeCard || !lastPointer || !mouseMode.matches) return;
    const bounds = activeCard.getBoundingClientRect();
    const { clientX, clientY } = lastPointer;
    if (clientX < bounds.left || clientX > bounds.right || clientY < bounds.top || clientY > bounds.bottom) { hideCursor(); return; }
    const cursor = activeCard.querySelector('.featured-project-cursor');
    // Read resolved token spacing in pixels, including rem-based tokens.
    const styles = getComputedStyle(activeCard);
    const inset = spacingPixels(styles, '--wzz-space-3');
    const gap = spacingPixels(styles, '--wzz-space-4');
    const x = Math.max(inset, Math.min(clientX - bounds.left + gap, bounds.width - cursor.offsetWidth - inset));
    const y = Math.max(inset, Math.min(clientY - bounds.top + gap, bounds.height - cursor.offsetHeight - inset));
    cursor.style.setProperty('--cursor-x', `${x}px`);
    cursor.style.setProperty('--cursor-y', `${y}px`);
    activeCard.classList.add('is-pointer-inside');
  }
  cards.forEach(card => {
    card.addEventListener('pointerenter', event => {
      if (!mouseMode.matches || event.pointerType !== 'mouse') return;
      hideCursor(); activeCard = card;
      lastPointer = { clientX: event.clientX, clientY: event.clientY };
      positionCursor();
    });
    card.addEventListener('pointermove', event => {
      if (!mouseMode.matches || event.pointerType !== 'mouse') return;
      if (activeCard && activeCard !== card) hideCursor();
      activeCard = card;
      lastPointer = { clientX: event.clientX, clientY: event.clientY };
      if (!frame) frame = requestAnimationFrame(positionCursor);
    });
    card.addEventListener('pointerleave', () => { if (activeCard === card) hideCursor(); });
    card.addEventListener('pointercancel', hideCursor);
  });
  mouseMode.addEventListener('change', hideCursor);
  addEventListener('blur', hideCursor);
  addEventListener('scroll', () => { if (activeCard && !frame) frame = requestAnimationFrame(positionCursor); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) hideCursor(); });
})();
