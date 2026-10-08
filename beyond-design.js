(() => {
  'use strict';
  const section = document.getElementById('beyond');
  if (!section) return;
  const tapLayout = matchMedia('(max-width: 767px), (hover: none), (pointer: coarse)');

  // Photo fan and music have separate controllers; neither reacts to scroll.
  const fan = section.querySelector('.bd-photo-group');
  const photos = [...fan.querySelectorAll('.bd-photo-position')];
  const clearActivePhoto = () => {
    delete fan.dataset.activePhoto;
    photos.forEach(photo => {
      photo.classList.remove('is-active');
      photo.style.removeProperty('--bd-active-transform');
      photo.style.removeProperty('--bd-avoid-x');
    });
  };
  const setFan = expanded => {
    fan.setAttribute('aria-expanded', String(expanded));
    if (!expanded) clearActivePhoto();
  };
  photos.forEach((photo, index) => {
    photo.addEventListener('pointerenter', event => {
      if (tapLayout.matches || event.pointerType === 'touch') return;
      // Freeze the actual current transform: selecting a displaced sibling must
      // not pull that photo back under the pointer while its neighbours move.
      const transform = getComputedStyle(photo).transform;
      const active = photo.getBoundingClientRect();
      const group = fan.getBoundingClientRect();
      const gap = fan.clientWidth * .025;
      const stagger = fan.clientWidth * .105;
      fan.dataset.activePhoto = String(index + 1);
      photos.forEach((sibling, i) => {
        sibling.classList.toggle('is-active', i === index);
        if (i === index) {
          sibling.style.setProperty('--bd-active-transform', transform);
          return;
        }
        const fanX = parseFloat(getComputedStyle(sibling).getPropertyValue('--bd-fan-x')) / 100;
        const base = sibling.offsetLeft + sibling.offsetWidth * fanX;
        const target = i < index
          ? active.left - group.left - sibling.offsetWidth - gap - (index - i - 1) * stagger
          : active.right - group.left + gap + (i - index - 1) * stagger;
        const direction = i < index ? -1 : 1;
        // Keep the spread bounded when moving between already displaced photos;
        // repeatedly hovering neighbours must not walk the fan across the player.
        const distance = Math.max(sibling.offsetWidth * .12, direction * (target - base));
        const displacement = direction * Math.min(sibling.offsetWidth * .65, distance);
        sibling.style.setProperty('--bd-avoid-x', `${displacement}px`);
      });
    });
    photo.addEventListener('pointerleave', event => {
      if (!tapLayout.matches && !event.relatedTarget?.closest('.bd-photo-position')) clearActivePhoto();
    });
  });
  fan.addEventListener('pointerenter', event => { if (!tapLayout.matches && event.pointerType !== 'touch') setFan(true); });
  fan.addEventListener('pointerleave', event => { if (!tapLayout.matches && event.pointerType !== 'touch') setFan(false); });
  fan.addEventListener('focus', () => { if (fan.matches(':focus-visible')) setFan(true); });
  fan.addEventListener('blur', () => setFan(false));
  fan.addEventListener('click', event => { if (tapLayout.matches || event.detail === 0) setFan(fan.getAttribute('aria-expanded') !== 'true'); });
  fan.addEventListener('keydown', event => { if (event.key === 'Escape') setFan(false); });

  const player = section.querySelector('.bd-player');
  const music = section.querySelector('[data-bd-music]');
  const playerIcon = player.querySelector('.bd-player-icon');
  const musicStatus = section.querySelector('[data-bd-music-status]');
  let playRequested = false;
  let playVersion = 0;
  const showPlaying = playing => {
    player.classList.toggle('is-playing', playing);
    player.setAttribute('aria-pressed', String(playing));
    player.setAttribute('aria-label', `${playing ? '暂停' : '播放'}《サンキュー!!》— HOME MADE 家族`);
    playerIcon.src = `assets/images/beyond-${playing ? 'pause' : 'play'}.png`;
    section.dataset.audioState = playing ? 'playing' : 'paused';
  };
  player.addEventListener('click', async () => {
    const version = ++playVersion;
    if (playRequested || !music.paused) {
      playRequested = false;
      music.pause();
      player.removeAttribute('aria-busy');
      showPlaying(false);
      return;
    }
    playRequested = true;
    player.setAttribute('aria-busy', 'true');
    musicStatus.textContent = '';
    try {
      await music.play();
      if (version !== playVersion || !playRequested) return;
      player.removeAttribute('aria-busy');
      showPlaying(!music.paused);
    } catch (error) {
      if (version !== playVersion) return;
      playRequested = false;
      player.removeAttribute('aria-busy');
      showPlaying(false);
      if (error.name !== 'AbortError') musicStatus.textContent = '音乐暂时无法播放，请再试一次。';
    }
  });
  music.addEventListener('playing', () => { if (playRequested) showPlaying(true); else music.pause(); });
  music.addEventListener('pause', () => {
    playRequested = false;
    player.removeAttribute('aria-busy');
    showPlaying(false);
  });
  music.addEventListener('ended', () => {
    ++playVersion;
    playRequested = false;
    music.currentTime = 0;
    player.removeAttribute('aria-busy');
    showPlaying(false);
  });
  music.addEventListener('error', () => {
    ++playVersion;
    playRequested = false;
    player.removeAttribute('aria-busy');
    showPlaying(false);
    musicStatus.textContent = '音乐暂时无法播放，请再试一次。';
  });

  const folders = [...section.querySelectorAll('.bd-folder')];
  const notes = [...section.querySelectorAll('.bd-note')];
  let activeFolder = -1;
  const setFolder = index => {
    activeFolder = index;
    folders.forEach((folder, i) => folder.setAttribute('aria-expanded', String(i === index && !notes[i].hasAttribute('data-bd-note-empty'))));
    notes.forEach((note, i) => {
      const visible = i === index && !note.hasAttribute('data-bd-note-empty');
      note.classList.toggle('is-active', visible);
      note.setAttribute('aria-hidden', String(!visible));
    });
  };
  folders.forEach((folder, index) => {
    folder.addEventListener('pointerenter', event => { if (!tapLayout.matches && event.pointerType !== 'touch') setFolder(index); });
    folder.addEventListener('pointerleave', event => { if (!tapLayout.matches && event.pointerType !== 'touch') setFolder(-1); });
    folder.addEventListener('focus', () => { if (folder.matches(':focus-visible')) setFolder(index); });
    folder.addEventListener('blur', () => setFolder(-1));
    folder.addEventListener('click', event => {
      if (tapLayout.matches || event.detail === 0) setFolder(activeFolder === index ? -1 : index);
      else setFolder(index);
    });
    folder.addEventListener('keydown', event => { if (event.key === 'Escape') setFolder(-1); });
  });
  document.addEventListener('pointerdown', event => { if (!event.target.closest('#beyond .bd-folder')) setFolder(-1); });

  const camera = section.querySelector('.bd-camera-trigger');
  const stage = section.querySelector('.bd-camera-stage');
  const cameraCard = section.querySelector('.bd-card-3');
  const shutter = section.querySelector('[data-bd-shutter]');
  const cameraStatus = section.querySelector('[data-bd-camera-status]');
  const prints = [...section.querySelectorAll('.bd-polaroid')];
  const positions = new Map(prints.map(print => [print, { x: 0, y: 0 }]));
  let cameraClicks = 0;
  let revealedCount = 0;
  let pressTimer;
  let topLayer = 3;
  let drag = null;
  let previousStageSize = { width: stage.clientWidth, height: stage.clientHeight };
  const setPosition = (print, x, y) => {
    // Use the complete third card as the boundary, including on mobile where
    // its text and camera stage are stacked rather than shrinking the artwork.
    const cardBounds = cameraCard.getBoundingClientRect();
    const stageBounds = stage.getBoundingClientRect();
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const inset = parseFloat(getComputedStyle(section).getPropertyValue('--wzz-space-1')) * rem;
    const baseX = stageBounds.left - cardBounds.left + print.offsetLeft;
    const baseY = stageBounds.top - cardBounds.top + print.offsetTop;
    const minX = inset - baseX;
    const maxX = cameraCard.clientWidth - inset - print.offsetWidth - baseX;
    const minY = inset - baseY;
    const maxY = cameraCard.clientHeight - inset - print.offsetHeight - baseY;
    const position = { x: Math.max(minX, Math.min(maxX, x)), y: Math.max(minY, Math.min(maxY, y)) };
    positions.set(print, position);
    print.style.setProperty('--bd-drag-x', `${position.x}px`);
    print.style.setProperty('--bd-drag-y', `${position.y}px`);
  };
  const raise = print => { print.style.zIndex = String(++topLayer); };
  camera.addEventListener('click', () => {
    cameraClicks++;
    section.dataset.cameraClicks = String(cameraClicks);
    // Restart only the local feedback, including rapid presses. The ejection
    // counter, shutter audio and one-second paper hold remain independent.
    camera.classList.remove('is-pressed');
    void camera.offsetWidth;
    camera.classList.add('is-armed', 'is-pressed');
    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => camera.classList.remove('is-pressed'), parseFloat(getComputedStyle(section).getPropertyValue('--wzz-motion-tiny')));
    if (cameraClicks < 3) {
      cameraStatus.textContent = `快门已按 ${cameraClicks} 次，再按 ${3 - cameraClicks} 次吐出第一张宝丽来。`;
      return;
    }
    if (revealedCount === prints.length) return;
    const print = prints[revealedCount++];
    print.hidden = false;
    print.tabIndex = 0;
    const source = camera.getBoundingClientRect();
    const target = print.getBoundingClientRect();
    print.style.setProperty('--bd-eject-x', `${source.left + source.width / 2 - target.left - target.width / 2}px`);
    print.style.setProperty('--bd-eject-y', `${source.top + source.height * .78 - target.top}px`);
    raise(print);
    print.classList.add('is-ejecting');
    setPosition(print, 0, 0);
    try { shutter.currentTime = 0; shutter.play().catch(() => {}); } catch { /* The photograph remains usable if sound is unavailable. */ }
    setTimeout(() => {
      print.classList.add('is-developed');
      print.setAttribute('aria-label', `宝丽来照片 ${prints.indexOf(print) + 1}，可拖动，方向键移动`);
    }, 1000);
    section.dataset.revealedPhotos = String(revealedCount);
    cameraStatus.textContent = `第 ${revealedCount} 张宝丽来已吐出，正在显影。`;
    camera.setAttribute('aria-label', revealedCount < 3 ? `按快门吐出第 ${revealedCount + 1} 张宝丽来` : '三张宝丽来已全部吐出');
  });
  prints.forEach(print => {
    print.addEventListener('animationend', event => { if (event.animationName === 'bd-photo-eject') print.classList.remove('is-ejecting'); });
    print.addEventListener('pointerdown', event => {
      if (event.isPrimary === false || (event.pointerType === 'mouse' && event.button !== 0) || drag) return;
      event.preventDefault();
      print.focus({ preventScroll: true });
      raise(print);
      const bounds = stage.getBoundingClientRect();
      drag = { print, id: event.pointerId, startX: event.clientX - bounds.left, startY: event.clientY - bounds.top, ...positions.get(print) };
      print.setPointerCapture(event.pointerId);
      print.classList.remove('is-ejecting');
      print.classList.add('is-dragging');
    });
    print.addEventListener('pointermove', event => {
      if (!drag || drag.print !== print || drag.id !== event.pointerId) return;
      const bounds = stage.getBoundingClientRect();
      setPosition(print, drag.x + event.clientX - bounds.left - drag.startX, drag.y + event.clientY - bounds.top - drag.startY);
    });
    const release = event => {
      if (!drag || drag.print !== print || drag.id !== event.pointerId) return;
      drag = null;
      print.classList.remove('is-dragging');
      if (print.hasPointerCapture(event.pointerId)) print.releasePointerCapture(event.pointerId);
    };
    print.addEventListener('pointerup', release);
    print.addEventListener('pointercancel', release);
    print.addEventListener('lostpointercapture', release);
    print.addEventListener('keydown', event => {
      const vectors = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (!vectors[event.key]) return;
      event.preventDefault();
      raise(print);
      const step = event.shiftKey ? 32 : 8;
      const position = positions.get(print);
      setPosition(print, position.x + vectors[event.key][0] * step, position.y + vectors[event.key][1] * step);
    });
  });
  const fitStack = () => {
    const style = getComputedStyle(section);
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const top = parseFloat(style.getPropertyValue('--bd-stack-top')) * rem;
    const step = parseFloat(style.getPropertyValue('--bd-stack-step')) * rem;
    section.dataset.stackFit = String([...section.querySelectorAll('.bd-card')].every((card, i) => card.offsetHeight + top + i * step + 16 <= innerHeight));
    const size = { width: stage.clientWidth, height: stage.clientHeight };
    prints.filter(print => !print.hidden).forEach(print => {
      const position = positions.get(print);
      setPosition(print, position.x * size.width / (previousStageSize.width || size.width), position.y * size.height / (previousStageSize.height || size.height));
    });
    previousStageSize = size;
  };
  const observer = new ResizeObserver(fitStack);
  section.querySelectorAll('.bd-card').forEach(card => observer.observe(card));
  addEventListener('resize', fitStack, { passive: true });
  addEventListener('resize', clearActivePhoto, { passive: true });
  fitStack();
})();
