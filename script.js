const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealItems = document.querySelectorAll('.reveal, .reveal-text, .image-reveal');
if (prefersReducedMotion) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  revealItems.forEach((item) => observer.observe(item));
}

requestAnimationFrame(() => {
  document.querySelectorAll('.hero .reveal-text, .case-hero .reveal-text').forEach((item, index) => {
    window.setTimeout(() => item.classList.add('is-visible'), index * 110 + 100);
  });
});

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.textContent = isOpen ? '关闭' : '菜单';
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.textContent = '菜单';
  }));
}

document.querySelectorAll('a[href]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) return;
    event.preventDefault();
    document.body.classList.add('is-leaving');
    window.setTimeout(() => { window.location.href = href; }, prefersReducedMotion ? 0 : 520);
  });
});

window.addEventListener('pageshow', () => document.body.classList.remove('is-leaving'));
