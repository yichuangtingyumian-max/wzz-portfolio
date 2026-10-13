const fs=require('node:fs');
const path=require('node:path');
const { readerHeaderActions }=require('./reader-navigation.cjs');
const { projectSwitch }=require('./project-navigation.cjs');
const root=__dirname;
const args=process.argv.slice(2);
if(args.length && (args.length!==2 || args[0]!=='--out-dir')) throw new Error('Usage: node build-site.cjs [--out-dir .cache/<directory>]');
const cache=path.join(root,'.cache');
const output=path.resolve(root,args[1] || '.cache/netlify-publish');
const outputRelative=path.relative(cache,output);
if(!outputRelative || outputRelative.startsWith('..') || path.isAbsolute(outputRelative)) throw new Error('Build output must be a directory inside .cache; source files and dist are protected.');
fs.mkdirSync(cache,{recursive:true});
const staging=fs.mkdtempSync(path.join(cache,'release-build-'));
require('./featured-projects.cjs').writeFeaturedProjects(path.join(staging,'index.html'));
const content=JSON.parse(fs.readFileSync(path.join(root,'project-content.json'),'utf8'));
const projects=[{slug:'juzi',title:'桔子短租升级项目'},{slug:'tmall',title:'天猫校园集卡活动'},{slug:'aigc',title:'喵莘莘 AIGC 提效'}];
const lightbox=`<dialog class="lightbox" aria-label="图片查看器"><div class="lightbox-toolbar"><p class="lightbox-caption"></p><div><button type="button" data-zoom aria-pressed="false">查看原尺寸</button><button type="button" data-close aria-label="关闭图片查看器">关闭 ×</button></div></div><div class="lightbox-scroll"><img alt=""></div><p class="lightbox-hint">点击图片切换缩放 · 按 Esc 关闭</p></dialog>`;
for(let i=0;i<projects.length;i++){
 const p=projects[i],pages=content[p.slug];
 const out=`<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${p.title} · 王增增作品集</title><meta name="description" content="${p.title}完整作品展示"><link rel="icon" href="favicon.svg"><link rel="stylesheet" href="design-tokens.css"><link rel="stylesheet" href="home.css"><link rel="stylesheet" href="portfolio.css"><link rel="stylesheet" href="reader-navigation.css"><script src="portfolio.js" defer></script><script src="reader-navigation.js" defer></script></head><body class="reader-page refreshed-home"><a class="skip" href="#artwork">跳到作品正文</a><header class="reader-header"><a href="index.html#work" class="back-link">← 作品目录</a><h1>${p.title}</h1>${readerHeaderActions()}</header><div class="reader-layout"><aside class="reader-sidebar" id="reader-directory"><p class="eyebrow">CONTENTS / 作品目录</p><nav aria-label="作品分段导航">${pages.map((r,j)=>`<a href="#sheet-${j+1}" ${j===0?'aria-current="location"':''}><span>${String(j+1).padStart(2,'0')}</span>${r.title}</a>`).join('')}</nav><p class="reader-tip">连续滚动阅读<br>点击作品可放大查看</p><a class="reader-home" href="index.html#work">返回全部作品</a></aside><main class="artwork" id="artwork" aria-label="${p.title}原稿">${pages.map((r,j)=>`<section class="art-sheet" id="sheet-${j+1}" aria-label="${r.title}"><button type="button" class="art-button" data-image="${r.original}" data-document="true" data-caption="${p.title} · ${r.title}" aria-label="放大：${r.title}">${r.strips.map((s,k)=>`<img src="${s.src}" alt="${r.title}${k?' · 续':''}" width="${s.width}" height="${s.height}" ${(j||k)?'loading="lazy"':'fetchpriority="high"'} decoding="async">`).join('')}<span class="enlarge-label">放大查看 ↗</span></button></section>`).join('')}${projectSwitch(p.slug)}<footer class="reader-footer"><a href="index.html#work">全部作品</a><a href="#artwork">回到开篇 ↑</a><span>© 2026 王增增</span></footer></main></div><div class="reading-progress" aria-hidden="true"></div>${lightbox}</body></html>`;
 fs.writeFileSync(path.join(staging,`${p.slug}.html`),out);
}
require('./portfolio-pdf.cjs').writePortfolioDocument(lightbox,path.join(staging,'portfolio.html'));
require('./vibe-coding.cjs').writeVibeCodingDocument(lightbox,path.join(staging,'vibe-coding.html'));
const htmlPages=['index.html','juzi.html','tmall.html','aigc.html','portfolio.html','vibe-coding.html'];
// Only publish files actually used by the current website.
const files=new Set(['index.html','juzi.html','tmall.html','aigc.html','design-tokens.css','home.css','portfolio.css','home-refresh.css','hero-intro.css','about.css','core-capabilities.css','selected-works.css','section-card-system.css','experience.css','beyond-design.css','beyond-design.js','experience.js','portfolio.js','core-capabilities.js','hero-intro.js','featured-projects.js','favicon.svg','assets/fonts/Inter-Variable.ttf']);
files.add('contact.css');
files.add('booking-card.css');
files.add('vibe-coding.html');
files.add('vibe-coding-reader.css');
files.add('contact.js');
files.add('contact-cursor.css');
files.add('contact-cursor.js');
files.add('portfolio.html');
files.add('portfolio-document.css');
files.add('reader-navigation.css');
files.add('reader-navigation.js');
files.add('_redirects');
files.add('assets/documents/wang-zengzeng-portfolio.pdf');
files.add('assets/documents/wang-zengzeng-resume.pdf');
const pdfPages=JSON.parse(fs.readFileSync(path.join(root,'portfolio-pdf-content.json'),'utf8'));
for(const page of pdfPages){files.add(page.original);for(const strip of page.strips)files.add(strip.src);}
for(const html of htmlPages){
 const source=fs.readFileSync(path.join(staging,html),'utf8');
 for(const m of source.matchAll(/(?:src|poster|data-image|href)="(assets\/[^"<>]+)"/g))files.add(m[1]);
}
// The playback icon is selected dynamically after a successful audio play.
files.add('assets/images/beyond-pause.png');
// ExperienceCard's exported SVG/PNG assets are declared in its module data.
for(const m of fs.readFileSync(path.join(root,'experience.js'),'utf8').matchAll(/['"](assets\/images\/experience-[a-z0-9-]+\.(?:svg|png))['"]/g))files.add(m[1]);
for(const file of files){
 if(!/^(?:[a-z0-9-]+\.(?:html|css|js|svg)|_redirects|assets\/(?:fonts|images|videos|audio|documents)\/[a-zA-Z0-9_.-]+)$/.test(file))throw new Error('Invalid release path: '+file);
 if(htmlPages.includes(file))continue;
 const source=path.join(root,file),target=path.join(staging,file);
 if(!fs.statSync(source,{throwIfNoEntry:false})?.isFile())throw new Error('Missing asset: '+file);
 fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target);
}
// Audit a fresh release before replacing any previously validated output.
require('./release-audit.cjs').assertReleaseFiles(staging,files);
// Prepare the inventory before touching the previously validated release.
const inventory=output+'.files.json',stagedInventory=staging+'.files.json';
fs.writeFileSync(stagedInventory,JSON.stringify([...files].sort(),null,2),{flag:'wx'});
fs.mkdirSync(path.dirname(output),{recursive:true});
if(fs.existsSync(output) && (!fs.lstatSync(output).isDirectory() || fs.lstatSync(output).isSymbolicLink()))throw new Error('Refusing to replace a non-directory build output.');
if(fs.existsSync(inventory) && (!fs.lstatSync(inventory).isFile() || fs.lstatSync(inventory).isSymbolicLink()))throw new Error('Refusing to replace a non-file release inventory.');
const previous=path.join(cache,`release-backup-${Date.now()}-${path.basename(staging)}`);
let savedOutput=false,savedInventory=false,installedOutput=false,installedInventory=false;
try {
 if(fs.existsSync(output)){fs.renameSync(output,previous);savedOutput=true;}
 if(fs.existsSync(inventory)){fs.renameSync(inventory,previous+'.files.json');savedInventory=true;}
 fs.renameSync(staging,output);installedOutput=true;
 fs.renameSync(stagedInventory,inventory);installedInventory=true;
} catch(error) {
 // Preserve the failed candidate as well, then restore the previous complete pair.
 if(installedInventory)fs.renameSync(inventory,stagedInventory);
 if(installedOutput)fs.renameSync(output,staging);
 if(savedInventory)fs.renameSync(previous+'.files.json',inventory);
 if(savedOutput)fs.renameSync(previous,output);
 throw error;
}
console.log(`Built ${htmlPages.length} pages and ${files.size-htmlPages.length} supporting files in ${path.relative(root,output)}. Source files and dist unchanged.${savedOutput?' Previous release preserved in '+path.relative(root,previous)+'.':''}`);
