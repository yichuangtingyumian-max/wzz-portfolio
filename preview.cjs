const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpeg':'image/jpeg','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf'};
const agentationFile = path.join(root,'node_modules','agentation-vanilla','dist','agentation-vanilla.global.js');
const agentationLoader = `<script src="/__dev/agentation.js"></script><script>
  window.AgentationVanilla.createAnnotator({
    enabled: false,
    position: 'bottom-right',
    storageKey: 'wzz-portfolio-annotations',
    onCopy(markdown) {
      if (!markdown) return;
      const field = document.createElement('textarea');
      field.value = markdown;
      field.setAttribute('aria-hidden', 'true');
      field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
  }).mount();
</script>`;
http.createServer((req,res) => {
  let name;
  try { name = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  if(name === '/') name = '/index.html';
  if(name === '/__dev/agentation.js') {
    fs.readFile(agentationFile,(err,data)=>{if(err){res.writeHead(503).end('Agentation development dependency is not installed');return;}res.writeHead(200,{'Content-Type':types['.js'],'Cache-Control':'no-store'});res.end(data);});
    return;
  }
  if(!(/^\/((index|juzi|tmall|aigc)\.html|(home|portfolio|home-refresh|hero-intro)\.css|(portfolio|hero-intro)\.js|favicon\.svg|assets\/(fonts|images)\/[a-zA-Z0-9_.-]+)$/.test(name))) {res.writeHead(404).end();return;}
  const file = path.join(root,name);
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404).end();return;}
    const isHtml = path.extname(file) === '.html';
    const body = isHtml ? data.toString('utf8').replace('</body>',`${agentationLoader}</body>`) : data;
    res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
    res.end(body);
  });
}).listen(4174,'127.0.0.1',()=>console.log('Portfolio preview: http://127.0.0.1:4174'));
