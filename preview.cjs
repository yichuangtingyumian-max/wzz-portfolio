const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const previewPort = Number(process.env.WZZ_PREVIEW_PORT || 4174);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpeg':'image/jpeg','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf','.mp4':'video/mp4'};
http.createServer((req,res) => {
  let name;
  try { name = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  if(name === '/') name = '/index.html';
  if(!(/^\/((index|juzi|tmall|aigc)\.html|(design-tokens|home|portfolio|home-refresh|hero-intro|about)\.css|(portfolio|hero-intro)\.js|favicon\.svg|assets\/(fonts|images|videos)\/[a-zA-Z0-9_.-]+)$/.test(name))) {res.writeHead(404).end();return;}
  const file = path.join(root,name);
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404).end();return;}
    if(path.extname(file) === '.mp4') {
      const headers = {'Content-Type':types['.mp4'],'Accept-Ranges':'bytes','Cache-Control':'no-store'};
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
    res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
    res.end(data);
  });
}).listen(previewPort,'127.0.0.1',()=>console.log(`Portfolio preview: http://127.0.0.1:${previewPort}`));
