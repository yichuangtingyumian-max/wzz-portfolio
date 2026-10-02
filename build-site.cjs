const fs=require('node:fs');
const path=require('node:path');
const content=JSON.parse(fs.readFileSync('project-content.json','utf8'));
const projects=[{slug:'juzi',title:'桔子短租升级项目'},{slug:'tmall',title:'天猫校园集卡活动'},{slug:'aigc',title:'喵莘莘 AIGC 提效'}];
const lightbox=`<dialog class="lightbox" aria-label="图片查看器"><div class="lightbox-toolbar"><p class="lightbox-caption"></p><div><button type="button" data-zoom aria-pressed="false">查看原尺寸</button><button type="button" data-close aria-label="关闭图片查看器">关闭 ×</button></div></div><div class="lightbox-scroll"><img alt=""></div><p class="lightbox-hint">点击图片切换缩放 · 按 Esc 关闭</p></dialog>`;
for(let i=0;i<projects.length;i++){
 const p=projects[i],prev=projects[(i+2)%3],next=projects[(i+1)%3],pages=content[p.slug];
 const out=`<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${p.title} · 王增增作品集</title><meta name="description" content="${p.title}完整作品展示"><link rel="icon" href="favicon.svg"><link rel="stylesheet" href="home.css"><link rel="stylesheet" href="portfolio.css"><script src="portfolio.js" defer></script></head><body class="reader-page"><a class="skip" href="#artwork">跳到作品正文</a><header class="reader-header"><a href="index.html#work" class="back-link">← 作品目录</a><h1>${p.title}</h1><a href="index.html#contact">联系我 ↗</a></header><div class="reader-layout"><aside class="reader-sidebar"><p class="eyebrow">CONTENTS / 作品目录</p><nav aria-label="作品分段导航">${pages.map((r,j)=>`<a href="#sheet-${j+1}" ${j===0?'aria-current="location"':''}><span>${String(j+1).padStart(2,'0')}</span>${r.title}</a>`).join('')}</nav><p class="reader-tip">连续滚动阅读<br>点击作品可放大查看</p><a class="reader-home" href="index.html#work">返回全部作品</a></aside><main class="artwork" id="artwork" aria-label="${p.title}原稿">${pages.map((r,j)=>`<section class="art-sheet" id="sheet-${j+1}" aria-label="${r.title}"><button type="button" class="art-button" data-image="${r.original}" data-document="true" data-caption="${p.title} · ${r.title}" aria-label="放大：${r.title}">${r.strips.map((s,k)=>`<img src="${s.src}" alt="${r.title}${k?' · 续':''}" width="${s.width}" height="${s.height}" ${(j||k)?'loading="lazy"':'fetchpriority="high"'} decoding="async">`).join('')}<span class="enlarge-label">放大查看 ↗</span></button></section>`).join('')}<nav class="project-switch" aria-label="切换项目"><a href="${prev.slug}.html"><small>← 上一个项目</small><strong>${prev.title}</strong></a><a href="${next.slug}.html"><small>下一个项目 →</small><strong>${next.title}</strong></a></nav><footer class="reader-footer"><a href="index.html#work">全部作品</a><a href="#artwork">回到开篇 ↑</a><span>© 2026 王增增</span></footer></main></div><div class="reading-progress" aria-hidden="true"></div>${lightbox}</body></html>`;
 fs.writeFileSync(`${p.slug}.html`,out);
}
// Only publish files actually used by the current website.
const files=new Set(['index.html','juzi.html','tmall.html','aigc.html','design-tokens.css','home.css','portfolio.css','home-refresh.css','hero-intro.css','portfolio.js','hero-intro.js','favicon.svg','assets/fonts/Inter-Variable.ttf']);
for(const html of ['index.html','juzi.html','tmall.html','aigc.html']){
 const source=fs.readFileSync(html,'utf8');
 for(const m of source.matchAll(/(?:src|poster|data-image)="(assets\/[^"<>]+)"/g))files.add(m[1]);
}
for(const file of files){if(!fs.existsSync(file))throw new Error('Missing asset: '+file);const target=path.join('dist',file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(file,target);}
console.log(`Built 4 pages with ${files.size-4} supporting files.`);
