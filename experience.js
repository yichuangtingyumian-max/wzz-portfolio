(() => {
  const section = document.querySelector('#experience');
  if (!section || section.dataset.experienceReady === 'true') return;
  section.dataset.experienceReady = 'true';
  const hoverMedia = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const reducedMedia = matchMedia('(prefers-reduced-motion: reduce)');

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
        x: Math.max(8, event.clientX + width + 20 > innerWidth ? event.clientX - width - 12 : event.clientX + 12),
        y: Math.max(8, event.clientY + height + 22 > innerHeight ? event.clientY - height - 14 : event.clientY + 14)
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
    constructor(element, hint) {
      this.element = element;
      this.front = element.querySelector('.experience-front');
      this.back = element.querySelector('.experience-back');
      this.reflection = element.querySelector('.experience-reflection-copy');
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

  const cards = [...section.querySelectorAll('.experience-card')];
  if (cards.length) {
    const hint = new ExperienceHint();
    cards.forEach(element => new ExperienceCard(element, hint));
  }
})();
