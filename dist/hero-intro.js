(() => {
  const computer = document.querySelector('.hero-intro .retro-computer');
  const screen = computer?.querySelector('.computer-screen');
  if (!screen) return;
  let touchInput = false;
  const wake = active => {
    computer.classList.toggle('is-awake', active);
    screen.setAttribute('aria-pressed', String(active));
  };
  screen.addEventListener('pointerenter', event => {
    touchInput = event.pointerType === 'touch';
    if (!touchInput) wake(true);
  });
  screen.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'touch') wake(false);
  });
  screen.addEventListener('focus', () => {
    if (screen.matches(':focus-visible')) wake(true);
  });
  screen.addEventListener('blur', () => wake(false));
  screen.addEventListener('click', event => {
    if (touchInput) wake(!computer.classList.contains('is-awake'));
    else wake(true);
  });
})();
