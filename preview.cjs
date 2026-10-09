const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = process.env.WZZ_PREVIEW_ROOT ? path.resolve(__dirname, process.env.WZZ_PREVIEW_ROOT) : __dirname;
const previewPort = Number(process.env.WZZ_PREVIEW_PORT || 4174);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpeg':'image/jpeg','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf','.mp4':'video/mp4','.mp3':'audio/mpeg','.pdf':'application/pdf'};
async function start() {
const toolMode = process.env.NODE_ENV === 'production' || process.env.WZZ_PREVIEW_ROOT ? 'off' : (process.env.WZZ_ANNOTATION_TOOL || 'official');
const { createPreviewTools } = require('./dev/preview-tools.cjs');
const devTools = await createPreviewTools(root, toolMode);
// Use the same explicit route rules locally and in the Netlify publish directory.
const routes = fs.existsSync(path.join(root, '_redirects'))
  ? fs.readFileSync(path.join(root, '_redirects'), 'utf8').split(/\r?\n/).map(line => line.trim().split(/\s+/)).filter(parts => parts.length === 3 && ['200', '200!', '301'].includes(parts[2]))
  : [];
http.createServer((req,res) => {
  let name;
  try { name = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  const route = routes.find(parts => parts[0].replace(/\/$/, '') === name.replace(/\/$/, ''));
  if (route?.[2] === '301') { res.writeHead(301, { Location: route[1] + new URL(req.url, 'http://localhost').search }).end(); return; }
  if (route) name = route[1];
  if(name === '/') name = '/index.html';
  if(devTools.handle(req,res,name)) return;
  if(!(/^\/((index|juzi|tmall|aigc|portfolio)\.html|(design-tokens|home|portfolio|portfolio-document|reader-navigation|home-refresh|hero-intro|about|core-capabilities|selected-works|section-card-system|experience|beyond-design|contact|contact-cursor)\.css|(portfolio|reader-navigation|hero-intro|core-capabilities|featured-projects|experience|beyond-design|contact|contact-cursor)\.js|favicon\.svg|assets\/(fonts|images|videos|audio|documents)\/[a-zA-Z0-9_.-]+)$/.test(name))) {res.writeHead(404).end();return;}
  const file = path.join(root,name);
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404).end();return;}
    if(['.mp4', '.mp3', '.pdf'].includes(path.extname(file))) {
      const headers = {'Content-Type':types[path.extname(file)],'Accept-Ranges':'bytes','Cache-Control':'no-store'};
      if (name === '/assets/documents/wang-zengzeng-portfolio.pdf') headers['Content-Disposition'] = 'attachment; filename="wang-zengzeng-portfolio.pdf"';
      if(req.headers.range) {
        const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        let start = range?.[1] ? Number(range[1]) : 0;
        let end = range?.[2] ? Number(range[2]) : data.length-1;
        if(range && !range[1] && range[2]) { start=Math.max(0,data.length-end); end=data.length-1; }
        if(!range || start>end || start>=data.length) { res.writeHead(416,{'Content-Range':`bytes */${data.length}`}).end(); return; }
        end=Math.min(end,data.length-1);
        res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':end-start+1});
        res.end(data.subarray(start,end+1));
      } else { res.writeHead(200,{...headers,'Content-Length':data.length}); res.end(data); }
      return;
    }
    const isHtml = path.extname(file) === '.html';
    const body = isHtml ? data.toString('utf8').replace('</body>',`${devTools.loader}</body>`) : data;
    res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
    res.end(body);
  });
}).listen(previewPort,'127.0.0.1',()=>console.log(`Portfolio preview: http://127.0.0.1:${previewPort} (annotations: ${toolMode})`));
}
start().catch(error => { console.error('Preview startup failed:', error.message); process.exitCode = 1; });
