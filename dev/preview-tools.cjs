const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

async function createPreviewTools(root, mode) {
  if (mode === 'off') return { loader: '', handle: () => false };
  if (!['official', 'legacy'].includes(mode)) throw new Error('WZZ_ANNOTATION_TOOL must be official, legacy or off.');
  const token = crypto.randomBytes(24).toString('hex');
  const backupDirectory = path.join(root, '.local-backups', 'annotation-storage');
  fs.mkdirSync(backupDirectory, { recursive: true });
  const assets = new Map([
    ['/__dev/annotation-backup.js', fs.readFileSync(path.join(__dirname, 'annotation-backup.js'))],
  ]);
  const scripts = [`<script src="/__dev/annotation-backup.js" data-backup-token="${token}" defer></script>`];
  if (mode === 'official') {
    const { build } = require('esbuild');
    const result = await build({
      absWorkingDir: root,
      entryPoints: ['dev/agentation-island.mjs'],
      bundle: true,
      write: false,
      format: 'iife',
      platform: 'browser',
      target: 'es2020',
      define: { 'process.env.NODE_ENV': '"development"' },
      logLevel: 'silent',
    });
    assets.set('/__dev/agentation-island.js', result.outputFiles[0].contents);
    scripts.push('<script src="/__dev/agentation-island.js" defer></script>');
  } else {
    assets.set('/__dev/agentation-legacy-library.js', fs.readFileSync(path.join(root, 'node_modules', 'agentation-vanilla', 'dist', 'agentation-vanilla.global.js')));
    assets.set('/__dev/agentation-legacy.js', fs.readFileSync(path.join(__dirname, 'agentation-legacy.js')));
    scripts.push('<script src="/__dev/agentation-legacy-library.js" defer></script>', '<script src="/__dev/agentation-legacy.js" defer></script>');
  }

  function handle(req, res, name) {
    if (!name.startsWith('/__dev/')) return false;
    if (name === '/__dev/annotation-backup' && req.method === 'POST') {
      const origin = req.headers.origin;
      let parsedOrigin;
      try { parsedOrigin = new URL(origin); } catch { res.writeHead(403).end(); return true; }
      if (req.headers['x-wzz-backup-token'] !== token || parsedOrigin.host !== req.headers.host || !['127.0.0.1', 'localhost', '[::1]'].includes(parsedOrigin.hostname)) {
        res.writeHead(403).end();
        return true;
      }
      let chunks = [];
      let length = 0;
      req.on('data', chunk => {
        length += chunk.length;
        if (length > 5 * 1024 * 1024) { res.writeHead(413).end(); req.destroy(); return; }
        chunks.push(chunk);
      });
      req.on('end', () => {
        if (res.writableEnded) return;
        try {
          const snapshot = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          if (snapshot.origin !== origin || !snapshot.storage || Array.isArray(snapshot.storage) || typeof snapshot.storage !== 'object') throw new Error('Invalid snapshot');
          for (const [key, value] of Object.entries(snapshot.storage)) {
            if (!/agentation|feedback-|wzz-portfolio-annotations/i.test(key) || typeof value !== 'string') throw new Error('Invalid annotation storage');
          }
          const hash = crypto.createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');
          const filename = `${hash}.json`;
          const file = path.join(backupDirectory, filename);
          if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ savedAt: new Date().toISOString(), ...snapshot }, null, 2), { flag: 'wx' });
          res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
          res.end(JSON.stringify({ saved: true, file: `.local-backups/annotation-storage/${filename}` }));
        } catch (error) {
          console.error('Unable to back up annotation storage:', error.message);
          res.writeHead(400).end('Annotation backup failed');
        }
      });
      return true;
    }
    const asset = assets.get(name);
    if (!asset || !['GET', 'HEAD'].includes(req.method)) { res.writeHead(404).end(); return true; }
    res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : asset);
    return true;
  }
  return { loader: scripts.join(''), handle };
}

module.exports = { createPreviewTools };
