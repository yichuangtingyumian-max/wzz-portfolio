const projects = require('./featured-projects.json');

const escape = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

// All detail pages follow the same circular order as the homepage cards.
function projectSwitch(slug) {
  const index = projects.findIndex(project => project.slug === slug);
  if (index < 0 || projects.length < 2) throw new Error('Invalid project navigation: ' + slug);
  const prev = projects[(index + projects.length - 1) % projects.length];
  const next = projects[(index + 1) % projects.length];
  return `<nav class="project-switch" aria-label="切换项目"><a href="${escape(prev.href)}"><small>← 上一个项目</small><strong>${escape(prev.title)}</strong></a><a href="${escape(next.href)}"><small>下一个项目 →</small><strong>${escape(next.title)}</strong></a></nav>`;
}

module.exports = { projectSwitch };
