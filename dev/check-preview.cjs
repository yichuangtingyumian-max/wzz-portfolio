const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const root = path.join(__dirname, '..');

async function checkMode(mode, production = false) {
  const port = await new Promise(resolve => {
    const socket = net.createServer();
    socket.listen(0, '127.0.0.1', () => {
      const value = socket.address().port;
      socket.close(() => resolve(value));
    });
  });
  const child = spawn(process.execPath, ['preview.cjs'], {
    cwd: root,
    env: { ...process.env, WZZ_PREVIEW_PORT: String(port), WZZ_ANNOTATION_TOOL: mode, NODE_ENV: production ? 'production' : 'development' },
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let errors = '';
  child.stderr.on('data', chunk => { errors += chunk; });
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Preview startup timeout: ${errors}`)), 15000);
      child.once('exit', code => { clearTimeout(timeout); reject(new Error(`Preview exited ${code}: ${errors}`)); });
      child.stdout.on('data', chunk => {
        if (chunk.toString().includes('Portfolio preview:')) { clearTimeout(timeout); resolve(); }
      });
    });
    const origin = `http://127.0.0.1:${port}`;
    const disabled = production || mode === 'off';
    for (const page of ['index', 'juzi', 'tmall', 'aigc']) {
      const response = await fetch(`${origin}/${page}.html`);
      assert.equal(response.status, 200);
      const html = await response.text();
      const scripts = html.match(/<script src="\/__dev\/[^>]+><\/script>/g) || [];
      assert.equal(scripts.length, disabled ? 0 : mode === 'official' ? 2 : 3);
      assert.equal(html.replace(/<script src="\/__dev\/[^>]+><\/script>/g, ''), fs.readFileSync(path.join(root, `${page}.html`), 'utf8'), `${page}: website HTML changed`);
      if (!disabled) {
        assert.equal(html.includes('/__dev/agentation-island.js'), mode === 'official');
        assert.equal(html.includes('/__dev/agentation-legacy-library.js'), mode === 'legacy');
      }
    }
    for (const route of ['annotation-backup.js', 'agentation-island.js', 'agentation-legacy-library.js']) {
      const response = await fetch(`${origin}/__dev/${route}`);
      const allowed = !disabled && (route === 'annotation-backup.js' || (mode === 'official' ? route === 'agentation-island.js' : route === 'agentation-legacy-library.js'));
      assert.equal(response.status, allowed ? 200 : 404, `${route}: wrong dev route availability`);
    }
    const rejectedBackup = await fetch(`${origin}/__dev/annotation-backup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(rejectedBackup.status, disabled ? 404 : 403);
    const video = await fetch(`${origin}/assets/videos/hero-wave.mp4`, { headers: { Range: 'bytes=0-63' } });
    assert.equal(video.status, 206);
    assert.equal((await video.arrayBuffer()).byteLength, 64);
    assert.match(video.headers.get('content-range'), /^bytes 0-63\//);
    console.log(`Passed: ${production ? 'production override' : mode} — four unchanged pages, tool isolation, backup access and video ranges.`);
  } finally {
    child.kill();
    await new Promise(resolve => { if (child.exitCode !== null) resolve(); else child.once('exit', resolve); });
  }
}

(async () => {
  await checkMode('official');
  await checkMode('legacy');
  await checkMode('off');
  await checkMode('official', true);
})().catch(error => { console.error(error); process.exitCode = 1; });
