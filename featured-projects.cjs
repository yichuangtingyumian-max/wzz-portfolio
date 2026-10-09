const fs = require('node:fs');
const path = require('node:path');
const projects = require('./featured-projects.json');
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

// One build-time component keeps the static site's native links and readable HTML.
function FeaturedProjectCard(project) {
  const { slug, title, description, tags, href, hero, stickers } = project;
  if (!/^[a-z][a-z0-9-]*$/.test(slug) || href !== `${slug}.html`) throw new Error('Invalid featured project route');
  for (const asset of [hero, ...stickers]) {
    if (!/^assets\/images\/featured-[a-z0-9-]+\.(svg|png)$/.test(asset.src) || !fs.existsSync(path.join(__dirname, asset.src))) throw new Error('Missing featured asset: ' + asset.src);
  }
  return `          <a class="featured-project featured-${slug}" id="work-${slug}" href="${escapeHtml(href)}" aria-labelledby="featured-${slug}-title" aria-describedby="featured-${slug}-description">
            <div class="featured-project-copy">
              <h3 id="featured-${slug}-title">${escapeHtml(title)}</h3>
              <p class="featured-project-description" id="featured-${slug}-description">${escapeHtml(description)}</p>
              <ul class="featured-project-tags" aria-label="项目类型">${tags.map(tag => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>
            </div>
            <div class="featured-project-media">
              <img class="featured-project-hero" src="${escapeHtml(hero.src)}" alt="${escapeHtml(hero.alt)}" width="${hero.width}" height="${hero.height}" loading="lazy" decoding="async">
              ${stickers.map(sticker => `<img class="featured-project-sticker" data-slot="${escapeHtml(sticker.slot)}" src="${escapeHtml(sticker.src)}" alt="" aria-hidden="true" width="${sticker.width}" height="${sticker.height}" loading="lazy" decoding="async">`).join('\n              ')}
            </div>
            <span class="featured-project-cursor" aria-hidden="true">查看项目 <span>↗</span></span>
          </a>`;
}

function renderFeaturedProjects() { return projects.map(FeaturedProjectCard).join('\n'); }
function writeFeaturedProjects(outputFile = path.join(__dirname, 'index.html')) {
  const file = path.join(__dirname, 'index.html');
  const source = fs.readFileSync(file, 'utf8');
  const marker = /(<!-- featured-projects:start -->)[\s\S]*?(<!-- featured-projects:end -->)/;
  if (!marker.test(source)) throw new Error('Featured Projects build markers missing');
  const result = source.replace(marker, (_, start, end) => `${start}\n${renderFeaturedProjects()}\n        ${end}`);
  if (outputFile !== file || result !== source) fs.writeFileSync(outputFile, result);
}
module.exports = { FeaturedProjectCard, renderFeaturedProjects, writeFeaturedProjects };
