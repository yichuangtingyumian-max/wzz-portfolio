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
      this.element.dataset.visible = 'false';
      this.element.innerHTML = '<span>翻转（咔哒）我</span>';
      document.body.append(this.element);
      this.activeCard = null;
      this.current = null;
      this.target = { x: 0, y: 0 };
      this.frame = 0;
      this.hideFrame = 0;
      this.lastTime = 0;
      this.tick = this.tick.bind(this);
      const hide = () => this.hide(this.activeCard);
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
      this.element.dataset.visible = 'true';
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
        this.element.dataset.visible = 'false';
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
      this.open = false;
      element.addEventListener('click', () => { this.open = !this.open; this.render(); });
      element.addEventListener('keydown', event => {
        if (event.key === 'Escape' && this.open) {
          event.preventDefault();
          this.open = false;
          this.render();
        }
      });
      // Hover is only a cue. Native button activation handles mouse, tap, Enter and Space.
      element.addEventListener('pointerenter', event => hint.show(event, this));
      element.addEventListener('pointermove', event => hint.show(event, this));
      element.addEventListener('pointerleave', () => hint.hide(this));
      element.addEventListener('pointercancel', () => hint.hide(this));
      this.render();
    }

    render() {
      this.element.setAttribute('aria-expanded', String(this.open));
      this.front.setAttribute('aria-hidden', String(this.open));
      this.back.setAttribute('aria-hidden', String(!this.open));
      if (this.open) this.element.setAttribute('aria-describedby', this.reflection.id);
      else this.element.removeAttribute('aria-describedby');
    }
  }

  const cards = [...section.querySelectorAll('.experience-card')];
  if (cards.length) {
    const hint = new ExperienceHint();
    cards.forEach(element => new ExperienceCard(element, hint));
  }
})();
