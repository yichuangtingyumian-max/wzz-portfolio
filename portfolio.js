(() => {
  document.querySelectorAll('.folder-cover').forEach(button=>button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));document.getElementById(button.getAttribute('aria-controls')).hidden=!open;button.querySelector('.folder-hint').textContent=open?'收起文件夹 ↙':'打开文件夹 ↗';}));
  document.querySelectorAll('.journey-card').forEach(button=>button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));button.querySelector('.journey-front').setAttribute('aria-hidden',String(open));button.querySelector('.journey-back').setAttribute('aria-hidden',String(!open));}));
  document.querySelectorAll('.kit-cover').forEach(button=>button.addEventListener('click',()=>{
    const open=button.getAttribute('aria-expanded')!=='true';
    document.querySelectorAll('.kit-cover').forEach(other=>{const active=other===button&&open;other.setAttribute('aria-expanded',String(active));other.closest('.kit-folder').classList.toggle('is-open',active);document.getElementById(other.getAttribute('aria-controls')).hidden=!active;other.querySelector('.kit-open').textContent=active?'收起工具夹 ↙':'打开工具夹 ↗';});
  }));
  const album=document.querySelector('.album-book');
  if(album)album.addEventListener('click',()=>{const open=album.getAttribute('aria-expanded')!=='true';album.setAttribute('aria-expanded',String(open));document.getElementById(album.getAttribute('aria-controls')).hidden=!open;});
  const camera=document.querySelector('.pet-camera');
  if(camera)camera.addEventListener('click',()=>{const open=camera.getAttribute('aria-expanded')!=='true';camera.setAttribute('aria-expanded',String(open));document.getElementById(camera.getAttribute('aria-controls')).hidden=!open;});
  document.querySelectorAll('.pet-print').forEach(print=>{
    let startX=0,startY=0,originX=0,originY=0,moved=false;
    print.addEventListener('pointerdown',event=>{if(event.button!==0)return;startX=event.clientX;startY=event.clientY;originX=Number(print.dataset.x)||0;originY=Number(print.dataset.y)||0;moved=false;print.setPointerCapture(event.pointerId);print.classList.add('is-dragging');});
    print.addEventListener('pointermove',event=>{if(!print.hasPointerCapture(event.pointerId))return;const x=originX+event.clientX-startX,y=originY+event.clientY-startY;if(Math.abs(x-originX)+Math.abs(y-originY)>5)moved=true;print.style.translate=x+'px '+y+'px';print.dataset.x=String(x);print.dataset.y=String(y);});
    print.addEventListener('pointerup',event=>{if(print.hasPointerCapture(event.pointerId))print.releasePointerCapture(event.pointerId);print.classList.remove('is-dragging');if(moved)print.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();},{once:true,capture:true});});
    print.addEventListener('pointercancel',()=>print.classList.remove('is-dragging'));
  });
  const lifeButtons=[...document.querySelectorAll('.life-toggle')];
  lifeButtons.forEach(button=>button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';lifeButtons.forEach(other=>{const active=other===button&&open;other.setAttribute('aria-expanded',String(active));document.getElementById(other.getAttribute('aria-controls')).hidden=!active;});}));
  const dockLinks=[...document.querySelectorAll('.side-dock a')];
  if(dockLinks.length){let pending=false;const updateDock=()=>{pending=false;let active=dockLinks[0];dockLinks.forEach(link=>{if(document.querySelector(link.hash).getBoundingClientRect().top<innerHeight*.4)active=link;});dockLinks.forEach(link=>{if(link===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});};addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(updateDock);}},{passive:true});addEventListener('resize',updateDock);updateDock();}
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function activate(tab) {
    tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!selected;});
  }
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',e=>{let j=i;if(['ArrowRight','ArrowDown'].includes(e.key))j=(i+1)%tabs.length;else if(['ArrowLeft','ArrowUp'].includes(e.key))j=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=tabs.length-1;else return;e.preventDefault();activate(tabs[j]);tabs[j].focus();});});
  let toastTimer;
  function notify(message){const toast=document.querySelector('.toast');if(!toast)return;clearTimeout(toastTimer);toast.textContent=message;toast.hidden=false;toastTimer=setTimeout(()=>{toast.hidden=true;},3000);}
  document.querySelectorAll('[data-copy-image]').forEach(button=>button.addEventListener('click',async()=>{
    try {
      if(!navigator.clipboard?.write || typeof ClipboardItem==='undefined')throw new Error('unsupported');
      const png=fetch(button.dataset.copyImage).then(response=>{if(!response.ok)throw new Error('image unavailable');return response.blob();});
      await navigator.clipboard.write([new ClipboardItem({'image/png':png})]);
      notify('微信二维码已复制，可以粘贴到聊天或文档中');
    } catch {notify('当前浏览器不支持复制图片，请使用“保存图片”');}
  }));
  document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
    const value=button.dataset.copy;
    let copied=false;
    try{await navigator.clipboard.writeText(value);copied=true;}catch{
      const area=document.createElement('textarea');area.value=value;area.style.cssText='position:fixed;top:0;left:-9999px';document.body.append(area);area.select();try{copied=document.execCommand('copy');}catch{}area.remove();button.focus();
    }
    if(copied){notify('已复制：'+value);const label=button.textContent;button.textContent='已复制 ✓';setTimeout(()=>button.textContent=label,1800);}
    else {notify('无法自动复制，请选中下方内容手动复制');const container=button.closest('.contact-card, .contact-info');let input=container.querySelector('.manual-copy');if(!input){input=document.createElement('input');input.className='manual-copy';input.readOnly=true;input.setAttribute('aria-label','请手动复制联系方式');container.append(input);}input.value=value;input.focus();input.select();}
  }));
  const contactForm=document.querySelector('.contact-form');
  if(contactForm)contactForm.addEventListener('submit',event=>{
    event.preventDefault();
    const name=contactForm.querySelector('[name="name"]').value.trim(),email=contactForm.querySelector('[name="email"]').value.trim(),message=contactForm.querySelector('[name="message"]').value.trim();
    if(!name||!email||!message)return;
    const subject=encodeURIComponent('来自作品集网站的留言 · '+name);
    const body=encodeURIComponent('姓名：'+name+'\n邮箱：'+email+'\n\n'+message);
    location.href='mailto:3367506893@qq.com?subject='+subject+'&body='+body;
  });
  const dialog=document.querySelector('.lightbox');
  if(dialog){
    const image=dialog.querySelector('img'),zoom=dialog.querySelector('[data-zoom]'),scroller=dialog.querySelector('.lightbox-scroll');let trigger;
    const setZoom=on=>{const ratio=scroller.scrollTop/Math.max(1,image.clientHeight);dialog.classList.toggle('zoomed',on);zoom.setAttribute('aria-pressed',String(on));zoom.textContent=on?'适应屏幕':'查看原尺寸';scroller.scrollTo(0,ratio*image.clientHeight);};
    document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',event=>{trigger=button;dialog.classList.toggle('document-view',button.dataset.document==='true');const bounds=button.getBoundingClientRect();const ratio=button.dataset.document==='true'&&event.detail>0?Math.max(0,(event.clientY-bounds.top)/bounds.height):0;image.onload=()=>{scroller.scrollTo(0,Math.max(0,ratio*image.clientHeight-100));};image.src=button.dataset.image;image.alt=button.dataset.caption;dialog.querySelector('.lightbox-caption').textContent=button.dataset.caption;setZoom(false);dialog.showModal();document.body.style.overflow='hidden';if(image.complete)image.onload();dialog.querySelector('[data-close]').focus();}));
    zoom.addEventListener('click',()=>setZoom(!dialog.classList.contains('zoomed')));
    image.addEventListener('click',()=>setZoom(!dialog.classList.contains('zoomed')));
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>{document.body.style.overflow='';trigger?.focus({preventScroll:true});});
  }
  const sheets=[...document.querySelectorAll('.art-sheet')],nav=[...document.querySelectorAll('.reader-sidebar nav a')];
  if(sheets.length){
    let scheduled=false;
    function update(){scheduled=false;let active=sheets[0].id;for(const sheet of sheets){if(sheet.getBoundingClientRect().top<=180)active=sheet.id;}nav.forEach(a=>{if(a.hash==='#'+active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('.reading-progress').style.width=(max>0?Math.min(100,Math.max(0,scrollY/max*100)):0)+'%';}
    addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}},{passive:true});addEventListener('resize',update);update();
  }
})();
