(() => {
  const dock = document.querySelector('.hero-dock');
  if (dock) {
    // Touch opens the complete panel first, then a second tap chooses a section.
    let touch = false;
    dock.addEventListener('pointerdown', event => { touch = event.pointerType === 'touch'; });
    dock.addEventListener('click', event => {
      if (!touch || !event.target.closest('a')) return;
      if (dock.dataset.expanded !== 'true') {
        event.preventDefault();
        dock.dataset.expanded = 'true';
      } else dock.dataset.expanded = 'false';
    });
    document.addEventListener('pointerdown', event => {
      if (!dock.contains(event.target)) dock.dataset.expanded = 'false';
    });
    dock.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        dock.dataset.expanded = 'false';
        document.activeElement?.blur();
      }
    });
  }

  const computer = document.querySelector('.hero-intro .retro-computer');
  const screen = computer?.querySelector('.computer-screen');
  const scene = computer?.querySelector('.screen-content');
  const greeting = computer?.querySelector('.computer-greeting');
  const video = computer?.querySelector('.computer-animation');
  if (!screen || !scene || !greeting || !video) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const styles = getComputedStyle(computer);
  const tokenMs = name => parseFloat(styles.getPropertyValue(name)) || 0;
  const enterDelay = tokenMs('--wzz-motion-fast');
  const exitDelay = tokenMs('--wzz-motion-base');
  const followLag = tokenMs('--wzz-motion-tiny');
  const inset = parseFloat(styles.getPropertyValue('--wzz-space-1')) * parseFloat(getComputedStyle(document.documentElement).fontSize) || 4;
  let phaseTimer = 0;
  let revision = 0;
  let frame = 0;
  let lastFrame = 0;
  let requestedActive = false;
  let pointerInside = false;
  let touchInput = false;
  let mediaFailed = false;
  let playAttempt = null;
  let x = 0, y = 0, targetX = 0, targetY = 0;

  video.muted = true;
  video.defaultMuted = true;
  video.loop = false;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const setPhase = phase => {
    computer.dataset.screenState = phase;
    screen.setAttribute('aria-pressed', String(phase === 'entering' || phase === 'active'));
  };
  const renderGreeting = () => {
    greeting.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
  };
  const positionGreeting = event => {
    const bounds = scene.getBoundingClientRect();
    const width = greeting.offsetWidth;
    const height = greeting.offsetHeight;
    const localX = event ? event.clientX - bounds.left : bounds.width / 2;
    const localY = event ? event.clientY - bounds.top : bounds.height - height;
    // Follow the pointer with a gentle offset. The whole bubble stays in the display.
    targetX = clamp(localX - width / 2, inset, Math.max(inset, bounds.width - width - inset));
    targetY = clamp(localY + inset * 2, inset, Math.max(inset, bounds.height - height - inset));
  };
  const stopFollowing = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
  };
  const follow = time => {
    const elapsed = lastFrame ? Math.min(time - lastFrame, 64) : 16;
    lastFrame = time;
    const amount = 1 - Math.exp(-elapsed / followLag);
    x += (targetX - x) * amount;
    y += (targetY - y) * amount;
    renderGreeting();
    if (requestedActive && (Math.abs(targetX - x) > .1 || Math.abs(targetY - y) > .1)) {
      frame = requestAnimationFrame(follow);
    } else { frame = 0; lastFrame = 0; }
  };
  const startFollowing = () => {
    if (reducedMotion.matches) return; // Static greeting position in reduced-motion mode.
    if (!frame) frame = requestAnimationFrame(follow);
  };
  const setMediaState = () => {
    computer.dataset.mediaState = reducedMotion.matches || mediaFailed ? 'static' : 'video';
  };
  const playWave = () => {
    if (!requestedActive || reducedMotion.matches || mediaFailed || video.readyState < 2 || playAttempt || video.ended) return;
    const attemptRevision = revision;
    setMediaState();
    const attempt = video.play();
    playAttempt = attempt;
    attempt.then(() => {
      if (!requestedActive || reducedMotion.matches) video.pause();
    }).catch(error => {
      // A pause during a fast leave aborts play normally; stale attempts cannot change UI.
      if (error.name !== 'AbortError' && attemptRevision === revision) {
        mediaFailed = true;
        setMediaState();
      }
    }).finally(() => {
      if (playAttempt === attempt) playAttempt = null;
      if (attemptRevision !== revision && requestedActive && computer.dataset.screenState === 'active' && video.paused) playWave();
    });
  };
  const activate = () => {
    if (!requestedActive) return;
    // Hold Welcome's transition until a real video frame is ready.
    if (!reducedMotion.matches && !mediaFailed && video.readyState < 2) return;
    setMediaState();
    setPhase('active');
    playWave();
  };
  const enter = event => {
    if (!reducedMotion.matches) positionGreeting(event);
    if (requestedActive) { startFollowing(); return; }
    requestedActive = true;
    const currentRevision = ++revision;
    clearTimeout(phaseTimer);
    // Re-entering a fading scene resumes its frame, rather than snapping to frame zero.
    setPhase('entering');
    startFollowing();
    if (video.readyState < 2 && !reducedMotion.matches) video.load();
    phaseTimer = window.setTimeout(() => {
      phaseTimer = 0;
      if (currentRevision === revision) activate();
    }, reducedMotion.matches ? 0 : enterDelay);
  };
  const leave = () => {
    if (!requestedActive && computer.dataset.screenState === 'idle') return;
    requestedActive = false;
    const currentRevision = ++revision;
    clearTimeout(phaseTimer);
    stopFollowing();
    video.pause();
    setPhase('leaving');
    phaseTimer = window.setTimeout(() => {
      phaseTimer = 0;
      if (currentRevision !== revision || requestedActive) return;
      setPhase('idle');
      if (video.readyState >= 1) video.currentTime = 0;
      positionGreeting();
      x = targetX; y = targetY; renderGreeting();
    }, reducedMotion.matches ? 0 : exitDelay);
  };
  video.addEventListener('loadeddata', () => {
    setMediaState();
    if (requestedActive && !phaseTimer) activate();
  });
  video.addEventListener('error', () => {
    mediaFailed = true;
    setMediaState();
    if (requestedActive && !phaseTimer) activate();
  });
  // Ended holds the natural last smile. Only a new interaction after Idle replays it.
  video.addEventListener('ended', () => { video.pause(); });
  screen.addEventListener('pointerenter', event => {
    touchInput = event.pointerType === 'touch';
    pointerInside = !touchInput;
    if (!touchInput) enter(event);
  });
  screen.addEventListener('pointermove', event => {
    if (!requestedActive || event.pointerType === 'touch' || reducedMotion.matches) return;
    positionGreeting(event); startFollowing();
  });
  screen.addEventListener('pointerleave', event => {
    pointerInside = false;
    if (event.pointerType !== 'touch' && !screen.matches(':focus-visible')) leave();
  });
  screen.addEventListener('pointerdown', event => { touchInput = event.pointerType === 'touch'; });
  screen.addEventListener('focus', () => { if (screen.matches(':focus-visible')) enter(); });
  screen.addEventListener('blur', () => { if (!pointerInside) leave(); });
  screen.addEventListener('click', event => {
    if (touchInput && requestedActive) leave();
    else enter(event.detail ? event : undefined);
  });
  screen.addEventListener('keydown', event => { if (event.key === 'Escape') leave(); });
  window.addEventListener('resize', () => {
    positionGreeting();
    x = clamp(x, inset, Math.max(inset, scene.clientWidth - greeting.offsetWidth - inset));
    y = clamp(y, inset, Math.max(inset, scene.clientHeight - greeting.offsetHeight - inset));
    if (requestedActive) startFollowing();
    else { x = targetX; y = targetY; }
    renderGreeting();
  });
  reducedMotion.addEventListener('change', () => {
    stopFollowing(); video.pause(); setMediaState();
    positionGreeting(); x = targetX; y = targetY; renderGreeting();
    if (requestedActive) { clearTimeout(phaseTimer); phaseTimer = 0; activate(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) leave(); });
  window.addEventListener('pagehide', leave);
  window.WZZHeroScreen = Object.freeze({
    setAnimationSource(source) {
      leave(); mediaFailed = false;
      video.src = source; video.load();
    }
  });
  setMediaState(); positionGreeting(); x = targetX; y = targetY; renderGreeting();
})();
