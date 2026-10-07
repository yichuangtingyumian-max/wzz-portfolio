(() => {
  const scene = document.querySelector('#capabilities .cc-scene');
  if (!scene) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const folders = new Map();
  let activeFolder = 'none';
  let frame = 0;

  const milliseconds = (styles, name, fallback) => {
    const value = styles.getPropertyValue(name).trim();
    const parsed = parseFloat(value);
    if (!Number.isFinite(parsed)) return fallback;
    return value.endsWith('ms') ? parsed : parsed * 1000;
  };
  const number = (value) => parseFloat(value) || 0;
  const mix = (from, to, amount) => amount === 0 ? from : amount === 1 ? to :
    from + (to - from) * amount;
  const smooth = (value) => {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  };
  const median = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  };

  scene.querySelectorAll('[data-cc-target]').forEach((hitArea) => {
    const root = hitArea.closest('.cc-folder');
    const body = root.querySelector('.folder-body');
    if (!body) return;
    folders.set(hitArea.dataset.ccTarget, {
      body,
      root,
      art: root.querySelector(':scope > .cc-object'),
      group: root.querySelector('.cc-tool-group'),
      back: root.querySelector('.folder-back'),
      front: root.querySelector('.folder-front'),
      tools: [...root.querySelectorAll('.cc-tool-content')].map((node) => ({ node })),
      progress: 0,
      from: 0,
      target: 0,
      started: 0,
      duration: 0,
      bodyProgress: 0,
      bodyFrom: 0,
      bodyTarget: 0,
      bodyStarted: 0,
      bodyDuration: 0,
      bodyOut: 320,
      closeAfterTools: false,
    });
  });

  const measure = (folder) => {
    const art = getComputedStyle(folder.art);
    const group = getComputedStyle(folder.group);
    const bounds = scene.getBoundingClientRect();
    const sceneWidth = bounds.width;
    folder.stackX = number(art.left) - number(group.getPropertyValue('--cc-group-x')) * sceneWidth / 100;
    // Both origins derive from the approved folder and tool coordinates. Only
    // the hidden stack pose changes; no final layout coordinates are rewritten.
    folder.closedY = number(art.top) + number(art.height) * .06 -
      number(group.getPropertyValue('--cc-group-y')) * sceneWidth / 100;
    folder.stackAngle = number(art.getPropertyValue('--cc-angle'));
    folder.tools.forEach((tool, index) => {
      const styles = getComputedStyle(tool.node.parentElement);
      tool.x = number(styles.left);
      tool.y = number(styles.top);
      tool.angle = number(styles.getPropertyValue('--cc-tool-angle'));
      const slot = index - (folder.tools.length - 1) / 2;
      tool.slotX = slot * sceneWidth * .003;
      tool.slotY = slot * sceneWidth * .0015;
      tool.slotAngle = slot * 1.2;
    });
    folder.raisedY = median(folder.tools.map((tool) => tool.y));

    // The page transform belongs to the body wrapper. Tool coordinates below
    // are inverse-registered into that local space, preserving their world pose.
    folder.bodyOrigin = { x: number(art.left), y: number(art.top) };
    folder.groupOrigin = {
      x: number(group.getPropertyValue('--cc-group-x')) * sceneWidth / 100,
      y: number(group.getPropertyValue('--cc-group-y')) * sceneWidth / 100,
    };
    folder.canvasScale = number(art.width) / 1536;
    // All three layers share the full canvas origin. Compensate
    // the former centered tool-layer origin without changing any tool path.
    folder.toolOrigin = { x: number(art.width) / 2, y: number(art.height) / 2 };
    const radians = folder.stackAngle * Math.PI / 180;
    folder.cos = Math.cos(radians);
    folder.sin = Math.sin(radians);
  };

  const renderBody = (folder) => {
    const b = smooth(folder.bodyProgress);
    if (b === 0) {
      folder.back.style.transform = 'none';
      folder.front.style.transform = 'none';
    } else {
      const unit = folder.canvasScale;
      const angle = -57 * b * Math.PI / 180;
      // Keep the projected pocket wider than the back at every hinge pose.
      // The registered front is 1152px wide; the back is 1106px. A long lens
      // retains that side overlap instead of exposing a second silhouette.
      const depth = 38400 * unit;
      const height = 554 * unit;
      const squeeze = 1 - .012 * b;
      const projectedHeight = height * squeeze * Math.cos(angle) /
        (1 - height * squeeze * Math.sin(angle) / depth);
      // Keep the bottom seam registered while the pocket mouth folds down.
      // Translation compensates its perspective shortening, rather than
      // moving two independently sized sheets away from each other.
      const shift = height - projectedHeight;
      folder.back.style.transform = 'none';
      folder.front.style.transform = 'translateY(' + shift + 'px) perspective(' +
        depth + 'px) rotateX(' + (-57 * b) + 'deg) scaleY(' + squeeze + ')';
    }
    folder.root.dataset.ccBodyProgress = String(folder.bodyProgress);
  };

  const render = (folder) => {
    const p = folder.progress;
    // One reversible path: the compact stack rises during the first third;
    // spreading starts before that rise finishes. In reverse, the icons are
    // already compact before the shared stack sinks behind the front pocket.
    const rise = smooth(p / .34);
    const spread = smooth((p - .22) / .68);
    const stackY = mix(folder.closedY, folder.raisedY, rise);
    const settle = p > .86 && p < 1 ? Math.sin(Math.PI * (p - .86) / .14) : 0;
    const body = smooth(p / .16);
    folder.root.style.setProperty('--cc-body-y', (-3 * body) + 'px');
    folder.root.style.setProperty('--cc-body-scale', 1 + .01 * body);
    // The progress is also useful when inspecting an interrupted transition.
    folder.root.dataset.ccProgress = String(p);
    folder.tools.forEach((tool) => {
      const x = mix(folder.stackX + tool.slotX, tool.x, spread) - tool.x;
      const y = mix(stackY + tool.slotY, tool.y, spread) - tool.y - 2.5 * settle;
      const angle = mix(folder.stackAngle + tool.slotAngle, tool.angle, spread);
      const scale = mix(.9, 1, spread) + .005 * settle;
      const containerScale = 1 + .01 * body;
      const origin = folder.bodyOrigin;
      const worldX = containerScale * (folder.groupOrigin.x + tool.x + x - origin.x);
      const worldY = containerScale * (folder.groupOrigin.y + tool.y + y - origin.y) - 3 * body;
      const localX = folder.cos * worldX + folder.sin * worldY - tool.x + folder.toolOrigin.x;
      const localY = -folder.sin * worldX + folder.cos * worldY - tool.y + folder.toolOrigin.y;
      tool.node.style.transform = 'translate(' + localX + 'px, ' + localY + 'px) rotate(' +
        (angle - folder.stackAngle) + 'deg) scale(' + (scale * containerScale) + ')';
    });
    renderBody(folder);
  };

  const advanceBody = (folder, now) => {
    if (folder.bodyProgress === folder.bodyTarget) return;
    const elapsed = Math.max(0, Math.min(1, (now - folder.bodyStarted) / folder.bodyDuration));
    folder.bodyProgress = elapsed === 1 ? folder.bodyTarget : mix(folder.bodyFrom, folder.bodyTarget, elapsed);
  };
  const moveBody = (folder, target, now, duration) => {
    advanceBody(folder, now);
    folder.bodyFrom = folder.bodyProgress;
    folder.bodyTarget = target;
    folder.bodyStarted = now;
    folder.bodyDuration = Math.max(80, duration * Math.abs(target - folder.bodyProgress));
    if (reducedMotion.matches) folder.bodyProgress = target;
    renderBody(folder);
  };

  const advance = (folder, now) => {
    if (folder.progress === folder.target) return;
    const elapsed = Math.max(0, Math.min(1, (now - folder.started) / folder.duration));
    folder.progress = elapsed === 1 ? folder.target : mix(folder.from, folder.target, elapsed);
    render(folder);
  };
  const tick = (now) => {
    frame = 0;
    folders.forEach((folder) => {
      advanceBody(folder, now);
      advance(folder, now);
      if (folder.closeAfterTools && folder.progress === 0) {
        folder.closeAfterTools = false;
        moveBody(folder, 0, now, folder.bodyOut);
      }
      renderBody(folder);
    });
    if ([...folders.values()].some((folder) => folder.progress !== folder.target ||
      folder.bodyProgress !== folder.bodyTarget || folder.closeAfterTools)) {
      frame = requestAnimationFrame(tick);
    }
  };
  const move = (folder, target, now, duration) => {
    if (!folder || folder.target === target) return;
    advance(folder, now);
    folder.from = folder.progress;
    folder.target = target;
    folder.started = now;
    folder.duration = Math.max(100, duration * Math.abs(target - folder.progress));
    if (reducedMotion.matches) {
      folder.progress = target;
      render(folder);
    }
  };
  const setActiveFolder = (next) => {
    if (activeFolder === next) return;
    const now = performance.now();
    const styles = getComputedStyle(scene);
    const outgoing = folders.get(activeFolder), incoming = folders.get(next);
    move(outgoing, 0, now, milliseconds(styles, '--cc-icon-out', 520));
    if (outgoing) {
      advanceBody(outgoing, now);
      // Freeze the current hinge pose until fan-in, restack and retract finish.
      // Re-entry cancels this wait and opens from that same pose, without reset.
      outgoing.bodyTarget = outgoing.bodyProgress;
      outgoing.bodyOut = milliseconds(styles, '--cc-front-out', 320);
      outgoing.closeAfterTools = outgoing.progress !== 0;
      if (!outgoing.closeAfterTools) moveBody(outgoing, 0, now, outgoing.bodyOut);
    }
    if (incoming) {
      incoming.closeAfterTools = false;
      moveBody(incoming, 1, now, milliseconds(styles, '--cc-front-in', 400));
    }
    move(incoming, 1, now, milliseconds(styles, '--cc-icon-in', 560));
    activeFolder = next;
    scene.dataset.activeFolder = activeFolder;
    // Outgoing and incoming folders run together; no reset, queued close,
    // per-icon delay, or second unrelated animation is introduced on reversal.
    if (!frame && !reducedMotion.matches) frame = requestAnimationFrame(tick);
  };

  folders.forEach((folder) => { measure(folder); render(folder); });
  scene.querySelectorAll('[data-cc-target]').forEach((hitArea) => {
    hitArea.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse') return;
      setActiveFolder(hitArea.dataset.ccTarget);
    });
  });
  // The same fixed hit areas and leave rules remain in force.
  scene.addEventListener('pointerleave', () => setActiveFolder('none'));
  scene.addEventListener('pointercancel', () => setActiveFolder('none'));
  window.addEventListener('blur', () => setActiveFolder('none'));

  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    cancelAnimationFrame(frame);
    frame = 0;
    folders.forEach((folder, key) => {
      folder.progress = folder.target;
      folder.bodyProgress = folder.bodyTarget = key === activeFolder ? 1 : 0;
      folder.closeAfterTools = false;
      render(folder);
    });
  });
  const remeasure = () => folders.forEach((folder) => { measure(folder); render(folder); });
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(remeasure).observe(scene);
  } else {
    window.addEventListener('resize', remeasure);
  }

  // Ambient trajectories are independent of hover. Pause only when the whole
  // section is off screen or the document is hidden, without resetting phase.
  let sceneVisible = true;
  const refreshAmbient = () => {
    scene.dataset.ambientRunning = String(sceneVisible && !document.hidden);
  };
  if (typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver(([entry]) => {
      sceneVisible = entry.isIntersecting;
      refreshAmbient();
    });
    observer.observe(scene);
  }
  document.addEventListener('visibilitychange', refreshAmbient);
  refreshAmbient();
})();
