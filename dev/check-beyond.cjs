// Controller regression checks run the actual browser script against a small
// event/geometry fixture. Real rendering and native dragging are checked in preview.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Element {
  constructor(rect = {}) {
    this.listeners = {}; this.attributes = {}; this.dataset = {};
    this.hidden = false; this.textContent = ''; this.focusVisible = false;
    this.rect = { left: 0, top: 0, width: 100, height: 100, ...rect };
    this.offsetLeft = this.rect.left; this.offsetTop = this.rect.top;
    this.offsetWidth = this.clientWidth = this.rect.width;
    this.offsetHeight = this.clientHeight = this.rect.height;
    this.classes = new Set(); this.properties = {};
    this.classList = { add: (...v) => v.forEach(x => this.classes.add(x)), remove: (...v) => v.forEach(x => this.classes.delete(x)), contains: x => this.classes.has(x), toggle: (x, active) => active ? this.classes.add(x) : this.classes.delete(x) };
    this.style = { setProperty: (k, v) => { this.properties[k] = v; }, removeProperty: k => { delete this.properties[k]; } };
  }
  addEventListener(name, handler) { (this.listeners[name] ||= []).push(handler); }
  emit(name, values = {}) { const event = { target: this, detail: 1, pointerType: 'mouse', pointerId: 1, button: 0, isPrimary: true, preventDefault() {}, ...values }; return Promise.all((this.listeners[name] || []).map(handler => handler(event))); }
  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k] ?? null; }
  hasAttribute(k) { return k in this.attributes; }
  removeAttribute(k) { delete this.attributes[k]; }
  matches() { return this.focusVisible; }
  closest() { return this.isFolder ? this : null; }
  focus() {}
  setPointerCapture(id) { this.capture = id; }
  hasPointerCapture(id) { return this.capture === id; }
  releasePointerCapture() { this.capture = null; }
  getBoundingClientRect() { return { ...this.rect, right: this.rect.left + this.rect.width, bottom: this.rect.top + this.rect.height }; }
}
class Audio extends Element {
  constructor() { super(); this.paused = true; this.currentTime = 0; this.playCount = 0; }
  play() {
    this.playCount++;
    if (this.deferred) return this.deferred.promise;
    if (this.failure) return Promise.reject(this.failure);
    this.paused = false; this.emit('playing'); return Promise.resolve();
  }
  pause() { const changed = !this.paused; this.paused = true; if (changed) this.emit('pause'); }
}
function fixture() {
  const section = new Element(), document = new Element(), fan = new Element(), player = new Element(), icon = new Element();
  const music = new Audio(), shutter = new Audio(), status = new Element(), cameraStatus = new Element();
  const card = new Element({ width: 1000, height: 500 });
  const stage = new Element({ width: 1000, height: 500 });
  const camera = new Element({ left: 650, top: 100, width: 120, height: 120 });
  const prints = [600, 700, 800].map(left => { const e = new Element({ left, top: 300, width: 80, height: 100 }); e.hidden = true; return e; });
  const folders = [0, 1, 2].map(() => { const e = new Element(); e.isFolder = true; return e; });
  const notes = [0, 1, 2].map(() => new Element());
  notes[1].setAttribute('data-bd-note-empty', '');
  fan.clientWidth = 1000;
  const photos = [0, 1, 2, 3, 4].map(i => {
    const photo = new Element({ left: 100 + i * 150, top: 20, width: 280, height: 280 });
    photo.fanX = ['-30%', '-23%', '-11%', '0%', '11%'][i];
    photo.transform = `matrix(1, 0, 0, 1, ${i * 11}, 0)`;
    return photo;
  });
  fan.querySelectorAll = () => photos;
  const cards = [card, new Element({ height: 500 }), new Element({ height: 500 })];
  const selectors = { '.bd-photo-group': fan, '.bd-player': player, '[data-bd-music]': music, '[data-bd-music-status]': status, '.bd-camera-trigger': camera, '.bd-camera-stage': stage, '.bd-card-3': card, '[data-bd-shutter]': shutter, '[data-bd-camera-status]': cameraStatus };
  section.querySelector = selector => selectors[selector];
  section.querySelectorAll = selector => ({ '.bd-folder': folders, '.bd-note': notes, '.bd-polaroid': prints, '.bd-card': cards })[selector];
  player.querySelector = () => icon;
  document.getElementById = () => section;
  document.documentElement = new Element();
  const media = { matches: false }, timers = new Map(); let clock = 0, timerId = 0;
  const windowListeners = {};
  const tokens = { '--wzz-space-1': '.25rem', '--bd-stack-top': '3rem', '--bd-stack-step': '1.25rem', '--wzz-motion-tiny': '180ms' };
  const context = { document, matchMedia: () => media, getComputedStyle: element => ({ fontSize: '16px', transform: element.transform, getPropertyValue: k => k === '--bd-fan-x' ? element.fanX : tokens[k] }), innerHeight: 900,
    ResizeObserver: class { observe() {} }, addEventListener: (name, fn) => { const previous = windowListeners[name]; windowListeners[name] = () => { previous?.(); fn(); }; },
    setTimeout: (fn, delay) => { timers.set(++timerId, { fn, at: clock + delay }); return timerId; }, clearTimeout: id => timers.delete(id) };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../beyond-design.js'), 'utf8'), context);
  const tick = milliseconds => { clock += milliseconds; for (const [id, timer] of [...timers]) if (timer.at <= clock) { timers.delete(id); timer.fn(); } };
  return { section, document, fan, photos, player, music, shutter, status, camera, prints, folders, notes, media, card, stage, context, windowListeners, tick };
}
async function main() {
  const f = fixture();
  assert.equal(f.music.playCount, 0);
  await f.fan.emit('pointerenter'); assert.equal(f.fan.getAttribute('aria-expanded'), 'true');
  for (const active of [0, 2, 4, 1, 3]) {
    await f.photos[active].emit('pointerenter');
    assert.equal(f.fan.dataset.activePhoto, String(active + 1));
    assert.equal(f.photos[active].properties['--bd-active-transform'], f.photos[active].transform, 'the active photo retains its current transform');
    assert.equal(f.photos.filter(photo => photo.classList.contains('is-active')).length, 1);
    f.photos.forEach((photo, i) => {
      if (i !== active) {
        const displacement = parseFloat(photo.properties['--bd-avoid-x']);
        assert.ok((i < active ? -1 : 1) * displacement >= photo.offsetWidth * .12, 'every sibling further separates on the appropriate side');
        assert.ok(Math.abs(displacement) <= photo.offsetWidth * .65, 'switching siblings cannot accumulate unlimited spread');
      }
    });
  }
  assert.equal(f.music.playCount, 0, 'photo hover must not start audio');
  await f.fan.emit('pointerleave'); assert.equal(f.fan.getAttribute('aria-expanded'), 'false');
  assert.ok(f.photos.every(photo => !photo.classList.contains('is-active') && !('--bd-avoid-x' in photo.properties)));
  f.media.matches = true;
  await f.fan.emit('click'); assert.equal(f.fan.getAttribute('aria-expanded'), 'true');
  await f.fan.emit('click'); assert.equal(f.fan.getAttribute('aria-expanded'), 'false');
  f.media.matches = false;
  await f.player.emit('click'); assert.equal(f.section.dataset.audioState, 'playing');
  await f.fan.emit('pointerleave'); assert.equal(f.music.paused, false);
  f.music.pause(); await f.player.emit('click'); assert.equal(f.music.paused, false, 'external pause must permit replay');
  await f.player.emit('click'); assert.equal(f.section.dataset.audioState, 'paused');
  await f.player.emit('click'); f.music.currentTime = 240; f.music.paused = true;
  await f.music.emit('ended'); assert.equal(f.music.currentTime, 0); assert.equal(f.player.getAttribute('aria-pressed'), 'false');
  f.music.failure = Object.assign(new Error('unavailable'), { name: 'NotSupportedError' });
  await f.player.emit('click'); assert.equal(f.section.dataset.audioState, 'paused'); assert.ok(f.status.textContent);
  const rapid = fixture();
  let resolvePlay; rapid.music.deferred = { promise: new Promise(resolve => { resolvePlay = resolve; }) };
  const pending = rapid.player.emit('click'); await rapid.player.emit('click'); resolvePlay(); await pending;
  assert.equal(rapid.player.getAttribute('aria-pressed'), 'false', 'late play completion must not re-open vinyl');
  for (let i = 0; i < 3; i++) {
    await f.folders[i].emit('pointerenter');
    assert.deepEqual(f.notes.map(note => note.classList.contains('is-active')), [0, 1, 2].map(n => n === i && n !== 1));
    await f.folders[i].emit('pointerleave'); assert.ok(f.notes.every(note => !note.classList.contains('is-active')));
  }
  f.media.matches = true;
  await f.folders[0].emit('click'); await f.folders[2].emit('click');
  assert.equal(f.notes[0].getAttribute('aria-hidden'), 'true'); assert.equal(f.notes[2].getAttribute('aria-hidden'), 'false');
  await f.document.emit('pointerdown', { target: new Element() }); assert.ok(f.notes.every(note => !note.classList.contains('is-active')));
  for (let click = 1; click <= 7; click++) {
    await f.camera.emit('click');
    assert.equal(f.prints.filter(print => !print.hidden).length, Math.min(3, Math.max(0, click - 2)), `click ${click}`);
    assert.ok(f.camera.classList.contains('is-armed'));
    assert.ok(f.camera.classList.contains('is-pressed'), 'local white flash feedback runs for every press');
    if (click >= 3 && click <= 5) {
      const print = f.prints[click - 3]; assert.equal(print.classList.contains('is-developed'), false);
      f.tick(999); assert.equal(print.classList.contains('is-developed'), false);
      f.tick(1); assert.equal(print.classList.contains('is-developed'), true);
    }
  }
  assert.equal(f.shutter.playCount, 3, 'shutter only sounds for an actual ejection');
  for (const pointerType of ['mouse', 'touch']) {
    const print = f.prints[pointerType === 'mouse' ? 0 : 1];
    await print.emit('pointerdown', { pointerType, clientX: 610, clientY: 310 });
    await print.emit('pointermove', { pointerType, clientX: -5000, clientY: 5000 });
    assert.equal(parseFloat(print.properties['--bd-drag-x']), 4 - print.offsetLeft);
    assert.equal(parseFloat(print.properties['--bd-drag-y']), 396 - print.offsetTop);
    await print.emit(pointerType === 'mouse' ? 'pointerup' : 'pointercancel');
    assert.equal(print.classList.contains('is-dragging'), false); assert.equal(print.capture, null);
    assert.ok(Number(print.style.zIndex) > 6);
    const settled = print.properties['--bd-drag-x'];
    await print.emit('pointermove', { clientX: 5000, clientY: 5000 }); assert.equal(print.properties['--bd-drag-x'], settled, 'no momentum or movement after release');
  }
  f.context.innerHeight = 400; f.windowListeners.resize(); assert.equal(f.section.dataset.stackFit, 'false', 'short screens retain readable content');
  f.context.innerHeight = 900; f.windowListeners.resize(); assert.equal(f.section.dataset.stackFit, 'true');
  console.log('Passed Beyond controllers: independent photo/audio, pause/end/error/rapid clicks, exclusive folder hover/tap, camera 3–4–5 and 1s delay, mouse/touch bounds/cancel, resize.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
