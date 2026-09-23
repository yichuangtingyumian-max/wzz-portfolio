(() => {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function activate(tab) {
    tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!selected;});
  }
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',e=>{let j=i;if(['ArrowRight','ArrowDown'].includes(e.key))j=(i+1)%tabs.length;else if(['ArrowLeft','ArrowUp'].includes(e.key))j=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=tabs.length-1;else return;e.preventDefault();activate(tabs[j]);tabs[j].focus();});});
  let toastTimer;
  function notify(message){const toast=document.querySelector('.toast');if(!toast)return;clearTimeout(toastTimer);toast.textContent=message;toast.hidden=false;toastTimer=setTimeout(()=>{toast.hidden=true;},3000);}
  document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
    const value=button.dataset.copy;
    let copied=false;
    try{await navigator.clipboard.writeText(value);copied=true;}catch{
      const area=document.createElement('textarea');area.value=value;area.style.cssText='position:fixed;top:0;left:-9999px';document.body.append(area);area.select();try{copied=document.execCommand('copy');}catch{}area.remove();button.focus();
    }
    if(copied){notify('已复制：'+value);const label=button.textContent;button.textContent='已复制 ✓';setTimeout(()=>button.textContent=label,1800);}
    else {notify('无法自动复制，请选中下方内容手动复制');let input=button.closest('.contact-card').querySelector('.manual-copy');if(!input){input=document.createElement('input');input.className='manual-copy';input.readOnly=true;input.setAttribute('aria-label','请手动复制联系方式');button.closest('.contact-card').append(input);}input.value=value;input.focus();input.select();}
  }));
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
