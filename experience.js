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
      id: 'tmall',
      company: '杭州天猫校园技术服务有限公司',
      logo: { src: 'assets/images/experience-tmall-front.svg', width: 95, height: 48 },
      storyLogo: { src: 'assets/images/experience-tmall-story.svg', width: 61, height: 57 },
      background: 'assets/images/experience-tmall-story.png',
      role: 'UI / 视觉设计师',
      date: '2025.08 — 2026.01',
      tag: '实习经历',
      story: '深度参与设计需求及内宣的创意设计，包括项目界面设计、弹窗设计、头图、腰封、宣传海报等。\n结合AIGC能力提升设计效率、周期性总结设计方法优化设计流程。'
    },
    {
      id: 'juzi',
      company: '北京逅客酒店管理有限公司',
      logo: { src: 'assets/images/experience-juzi-front.svg', width: 75, height: 37 },
      storyLogo: { src: 'assets/images/experience-juzi-story.svg', width: 104, height: 63 },
      background: 'assets/images/experience-juzi-story.png',
      role: 'UI 实习设计师',
      date: '2026.03 — 2026.06',
      tag: '实习经历',
      story: '参与找房产品体验优化，负责用户调研、问题分析及核心页面设计。\n通过优化首页、搜索、列表和详情页的信息结构与操作流程，提升用户浏览和筛选房源的体验。'
    }
  ];

  class ExperienceHint {
    constructor() {
      this.element = document.createElement('div');
      this.element.className = 'experience-hover-hint';
      this.element.setAttribute('aria-hidden', 'true');
      this.element.dataset.phase = 'idle';
      this.element.innerHTML = '<span>点击翻转</span>';
      document.body.append(this.element);
      this.activeCard = null;
      this.current = null;
      this.target = { x: 0, y: 0 };
      this.frame = 0;
      this.hideFrame = 0;
      this.lastTime = 0;
      this.tick = this.tick.bind(this);
      const hide = () => this.hide(this.activeCard);
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
      // Lerp 0.22 at 60 Hz; normalize across refresh rates and stop when settled.
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

    paint() { this.element.style.transform = `translate3d(${this.current.x}px, ${this.current.y}px, 0)`; }

    hide(card) {
      if (!this.activeCard || card !== this.activeCard) return;
      this.activeCard = null;
      cancelAnimationFrame(this.hideFrame);
      // Adjacent-card entry can cancel this hide without replacing the node.
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
      this.data = data;
      this.element = template.content.firstElementChild.cloneNode(true);
      this.front = this.element.querySelector('.experience-front');
      this.back = this.element.querySelector('.experience-back');
      this.reflection = this.element.querySelector('.experience-reflection-copy');
      this.isFlipped = false;
      this.element.dataset.experience = data.id;
      this.back.id = `experience-back-${data.id}`;
      this.reflection.id = `experience-reflection-${data.id}`;
      this.element.setAttribute('aria-controls', this.back.id);
      this.element.querySelector('.experience-company').textContent = data.company;
      this.element.querySelector('.experience-role-copy').textContent = data.role;
      this.element.querySelector('.experience-date').textContent = data.date;
      this.element.querySelector('.experience-type').textContent = data.tag;
      this.reflection.textContent = data.story;
      [[this.front, data.logo], [this.back, data.storyLogo]].forEach(([face, asset]) => {
        const img = face.querySelector('img');
        img.src = asset.src;
        img.width = asset.width;
        img.height = asset.height;
      });
      this.back.style.backgroundImage = `url("${data.background}")`;
      // Native button clicks also cover touch, Enter, and Space. Focus/hover never flip.
      this.element.addEventListener('click', () => {
        this.isFlipped = !this.isFlipped;
        this.render();
      });
      this.element.addEventListener('pointerenter', event => hint.show(event, this));
      this.element.addEventListener('pointermove', event => hint.show(event, this));
      this.element.addEventListener('pointerleave', () => hint.hide(this));
      this.element.addEventListener('pointercancel', () => hint.hide(this));
      this.render();
    }

    render() {
      this.element.setAttribute('aria-expanded', String(this.isFlipped));
      this.element.setAttribute('aria-pressed', String(this.isFlipped));
      this.element.setAttribute('aria-label', `${this.data.company}，${this.data.role}，${this.data.date}，${this.data.tag}。${this.isFlipped ? '点击返回工作经历' : '点击查看经历故事'}`);
      this.front.setAttribute('aria-hidden', String(this.isFlipped));
      this.back.setAttribute('aria-hidden', String(!this.isFlipped));
      if (this.isFlipped) this.element.setAttribute('aria-describedby', this.reflection.id);
      else this.element.removeAttribute('aria-describedby');
    }
  }

  const hint = new ExperienceHint();
  const cards = experiences.map(data => new ExperienceCard(data, hint));
  list.replaceChildren(...cards.map(card => card.element));
})();
