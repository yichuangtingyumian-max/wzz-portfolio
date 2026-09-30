const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpeg':'image/jpeg','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf'};
http.createServer((req,res) => {
  let name;
  try { name = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  if(name === '/') name = '/index.html';
  if(!(/^\/((index|juzi|tmall|aigc)\.html|(home|portfolio|home-refresh)\.css|portfolio\.js|favicon\.svg|assets\/(fonts|images)\/[a-zA-Z0-9_.-]+)$/.test(name))) {res.writeHead(404).end();return;}
  const file = path.join(root,name);
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream'});res.end(data);});
}).listen(4174,'127.0.0.1',()=>console.log('Portfolio preview: http://127.0.0.1:4174'));
