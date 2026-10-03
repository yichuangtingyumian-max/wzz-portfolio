(() => {
  const section = document.querySelector('#experience');
  if (!section || section.dataset.experienceReady === 'true') return;
  const template = section.querySelector('#experience-card-template');
  const list = section.querySelector('.experience-list');
  if (!template || !list) return;
  section.dataset.experienceReady = 'true';
  const hoverMedia = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const reducedMedia = matchMedia('(prefers-reduced-motion: reduce)');

  const experiences = [
    {
      id: 'juzi',
      company: '北京逅客酒店管理有限公司',
      logo: { src: 'assets/images/hero-logo-juzi.png', width: 1254, height: 1254, stampText: '短租' },
      role: 'UI 实习设计师',
      date: '2026.03 — 2026.06',
      tag: '实习经历',
      story: '在桔子短租升级中，我参与找房流程与核心页面的设计，梳理首页、筛选和房源信息的呈现。把界面放回使用场景后，我开始更在意用户先看到什么、下一步要做什么。这段经历让我学着在信息清晰、视觉表达与实际实现之间做取舍。',
      accentColor: '#DCEFEA',
      texture: { frequency: .72, seed: 3, opacity: .045 }
    },
    {
      id: 'tmall',
      company: '杭州天猫校园技术服务有限公司',
      logo: { src: 'assets/images/hero-logo-tmall.png', width: 658, height: 329, stampLayout: 'stacked' },
      role: 'UI / 视觉设计师',
      date: '2025.08 — 2026.01',
      tag: '实习经历',
      story: '在天猫校园活动中，我把玩法转化为页面与视觉素材，尝试让主题在不同触点保持连贯。参与喵莘莘 AIGC 提效时，我将 AI 生图与二次处理结合，也逐渐整理自己的创作步骤。这段经历让我更习惯在创意、一致性与交付之间反复核对。',
      accentColor: '#F5EBDD',
      texture: { frequency: .58, seed: 7, opacity: .04 }
    }
  ];

  class ExperienceHint {
    constructor() {
      this.element = document.createElement('div');
      this.element.className = 'experience-hover-hint';
      this.element.setAttribute('aria-hidden', 'true');
      this.element.dataset.phase = 'idle';
      this.element.innerHTML = '<span>翻转（咔哒）我</span>';
      document.body.append(this.element);
      this.activeCard = null;
      this.current = null;
      this.target = { x: 0, y: 0 };
      this.frame = 0;
      this.hideFrame = 0;
      this.lastTime = 0;
      this.tick = this.tick.bind(this);
      const hide = () => this.activeCard?.leaveHover();
      this.element.addEventListener('transitionend', event => {
        if (event.propertyName === 'opacity' && !this.activeCard) this.element.dataset.phase = 'idle';
      });
      addEventListener('scroll', hide, { passive: true, capture: true });
      addEventListener('resize', hide);
      addEventListener('blur', hide);
      document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
      hoverMedia.addEventListener('change', hide);
      reducedMedia.addEventListener('change', () => {
        cancelAnimationFrame(this.frame);
        this.frame = 0;
        if (this.current) { this.current = { ...this.target }; this.paint(); }
      });
    }

    show(event, card) {
      if (event.pointerType !== 'mouse' || !hoverMedia.matches) return;
      cancelAnimationFrame(this.hideFrame);
      this.hideFrame = 0;
      this.activeCard = card;
      this.move(event);
      this.element.dataset.phase = 'visible';
    }

    move(event) {
      const width = this.element.offsetWidth;
      const height = this.element.offsetHeight;
      this.target = {
        x: Math.max(8, event.clientX + width + 22 > innerWidth ? event.clientX - width - 14 : event.clientX + 14),
        y: Math.max(8, event.clientY + height + 24 > innerHeight ? event.clientY - height - 16 : event.clientY + 16)
      };
      if (!this.current || reducedMedia.matches) {
        this.current = { ...this.target };
        this.paint();
      } else if (!this.frame) {
        this.lastTime = 0;
        this.frame = requestAnimationFrame(this.tick);
      }
    }

    tick(time) {
      // Lerp 0.22 at 60 Hz; normalize for other refresh rates and stop when settled.
      const elapsed = this.lastTime ? Math.min(time - this.lastTime, 32) : 1000 / 60;
      const blend = 1 - Math.pow(.78, elapsed / (1000 / 60));
      this.lastTime = time;
      this.current.x += (this.target.x - this.current.x) * blend;
      this.current.y += (this.target.y - this.current.y) * blend;
      const settled = Math.hypot(this.target.x - this.current.x, this.target.y - this.current.y) < .1;
      if (settled) this.current = { ...this.target };
      this.paint();
      this.frame = settled ? 0 : requestAnimationFrame(this.tick);
    }

    paint() {
      this.element.style.transform = `translate3d(${this.current.x}px, ${this.current.y}px, 0)`;
    }

    hide(card) {
      if (card !== this.activeCard) return;
      this.activeCard = null;
      cancelAnimationFrame(this.hideFrame);
      // Keep the same pill and let adjacent-card entry cancel the pending hide.
      this.hideFrame = requestAnimationFrame(() => {
        this.hideFrame = 0;
        this.element.dataset.phase = 'leaving';
        cancelAnimationFrame(this.frame);
        this.frame = 0;
      });
    }
  }

  class ExperienceCard {
    constructor(data, hint) {
      const element = template.content.firstElementChild.cloneNode(true);
      this.data = data;
      this.element = element;
      this.front = element.querySelector('.experience-front');
      this.back = element.querySelector('.experience-back');
      this.reflection = element.querySelector('.experience-reflection-copy');
      element.dataset.experience = data.id;
      this.back.id = `experience-back-${data.id}`;
      this.reflection.id = `experience-reflection-${data.id}`;
      element.setAttribute('aria-controls', this.back.id);
      element.setAttribute('aria-label', `${data.company}，${data.role}，${data.date}，${data.tag}。悬停或聚焦查看经历，触屏点击切换`);
      element.querySelector('.experience-company').textContent = data.company;
      element.querySelector('.experience-role-copy').textContent = data.role;
      element.querySelector('.experience-date').textContent = data.date;
      element.querySelector('.experience-type').textContent = data.tag;
      this.reflection.textContent = data.story;
      const stampWord = element.querySelector('.experience-stamp-word');
      if (data.logo.stampText) stampWord.textContent = data.logo.stampText;
      else stampWord.remove();
      if (data.logo.stampLayout === 'stacked') {
        const parts = ['symbol', 'name'].map(part => {
          const slot = document.createElement('span');
          slot.className = `experience-stamp-${part}`;
          const img = document.createElement('img');
          img.alt = '';
          img.loading = 'lazy';
          slot.append(img);
          return slot;
        });
        element.querySelector('.experience-stamp').replaceChildren(...parts);
      }
      element.querySelectorAll('img').forEach(img => {
        img.src = data.logo.src;
        img.width = data.logo.width;
        img.height = data.logo.height;
      });
      const grain = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="${data.texture.frequency}" numOctaves="3" seed="${data.texture.seed}" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#paper)"/></svg>`;
      element.style.setProperty('--experience-accent', data.accentColor);
      element.style.setProperty('--experience-grain', `url("data:image/svg+xml,${encodeURIComponent(grain)}")`);
      element.style.setProperty('--experience-grain-opacity', data.texture.opacity);
      this.hovered = false;
      this.focused = false;
      this.toggled = false;
      this.pointerFocus = false;
      this.pointerType = null;
      element.addEventListener('pointerdown', event => {
        this.pointerType = event.pointerType;
        this.pointerFocus = true;
        this.focused = false;
        this.render();
        queueMicrotask(() => { this.pointerFocus = false; });
      });
      element.addEventListener('focus', () => {
        this.focused = !this.pointerFocus && element.matches(':focus-visible');
        this.render();
      });
      element.addEventListener('blur', () => { this.focused = false; this.pointerType = null; this.render(); });
      element.addEventListener('click', event => {
        if (event.detail === 0) {
          this.toggled = false;
          this.focused = element.getAttribute('aria-expanded') !== 'true';
        } else if (this.pointerType !== 'mouse' || !hoverMedia.matches) {
          this.toggled = !this.toggled;
        }
        this.render();
      });
      element.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          event.preventDefault();
          this.focused = false;
          this.toggled = false;
          this.leaveHover();
        }
      });
      this.hint = hint;
      // Pointer type separates real mouse hover from synthetic touch hover.
      element.addEventListener('pointerenter', event => this.enterHover(event));
      element.addEventListener('pointermove', event => this.enterHover(event));
      element.addEventListener('pointerleave', () => this.leaveHover());
      element.addEventListener('pointercancel', () => this.leaveHover());
      this.render();
    }

    measure() {
      const sectionStyle = getComputedStyle(section);
      const baseSize = name => parseFloat(sectionStyle.getPropertyValue(name)) * parseFloat(getComputedStyle(document.documentElement).fontSize);
      const extras = face => {
        const style = getComputedStyle(face);
        return parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      };
      const stacked = getComputedStyle(this.back).flexDirection === 'column';
      const main = this.front.querySelector('.experience-main').offsetHeight;
      const meta = this.front.querySelector('.experience-meta').offsetHeight;
      const logo = this.front.querySelector('.experience-logo').offsetHeight;
      const frontContent = stacked ? Math.max(logo, main + meta + parseFloat(getComputedStyle(this.front).rowGap)) : Math.max(logo, main, meta);
      const stamp = this.back.querySelector('.experience-stamp-area').offsetHeight;
      const copy = this.reflection.offsetHeight;
      const storyContent = stacked ? copy + stamp + parseFloat(getComputedStyle(this.back).rowGap) : Math.max(copy, stamp);
      this.frontHeight = Math.ceil(Math.max(baseSize('--experience-front-height'), frontContent + extras(this.front)));
      this.storyHeight = Math.ceil(Math.max(baseSize('--experience-story-height'), storyContent + extras(this.back)));
      this.element.style.setProperty('--experience-front-size', `${this.frontHeight}px`);
      this.element.style.setProperty('--experience-story-size', `${this.storyHeight}px`);
    }

    enterHover(event) {
      if (event.pointerType !== 'mouse' || !hoverMedia.matches) return;
      if (!this.hovered) {
        this.hovered = true;
        this.toggled = false;
        this.render();
      }
      this.hint.show(event, this);
    }

    leaveHover() {
      this.hovered = false;
      this.hint.hide(this);
      this.render();
    }

    render() {
      const open = this.hovered || this.focused || this.toggled;
      this.element.setAttribute('aria-expanded', String(open));
      this.front.setAttribute('aria-hidden', String(open));
      this.back.setAttribute('aria-hidden', String(!open));
      if (open) this.element.setAttribute('aria-describedby', this.reflection.id);
      else this.element.removeAttribute('aria-describedby');
    }
  }

  const hint = new ExperienceHint();
  const cards = experiences.map(data => new ExperienceCard(data, hint));
  list.replaceChildren(...cards.map(card => card.element));
  const measure = () => {
    cards.forEach(card => card.measure());
    const gap = parseFloat(getComputedStyle(list).rowGap);
    list.style.setProperty('--experience-list-height', `${cards.reduce((sum, card) => sum + card.storyHeight, 0) + gap * (cards.length - 1)}px`);
  };
  measure();
  let lastWidth = list.clientWidth;
  new ResizeObserver(() => {
    if (list.clientWidth !== lastWidth) {
      lastWidth = list.clientWidth;
      measure();
    }
  }).observe(list);
  document.fonts.ready.then(measure);
})();
