const fs = require('node:fs');
const path = require('node:path');

function assertReleaseFiles(directory) {
  const forbiddenPath = /(^|[\\/])(?:node_modules|__dev|dev|\.local-backups|\.cache)([\\/]|$)|(^|[\\/])(?:preview\.cjs|package(?:-lock)?\.json|pnpm-lock\.yaml|agentation[^\\/]*|react(?:-dom)?[^\\/]*)$/i;
  const forbiddenContent = /\/__dev\/|AgentationVanilla|agentation-toolbar|data-ui-annotator-host|WZZAgentationIsland|WZZAnnotationBackup|feedback-freeze-styles|react-dom|react\.development|react\.production/i;
  let checked = 0;
  function visit(folder) {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name);
      const relative = path.relative(directory, file);
      if (forbiddenPath.test(relative)) throw new Error(`Development file in release: ${relative}`);
      if (entry.isDirectory()) visit(file);
      else if (/\.(html|css|[cm]?js)$/i.test(file)) {
        if (forbiddenContent.test(fs.readFileSync(file, 'utf8'))) throw new Error(`Development code in release: ${relative}`);
        checked++;
      }
    }
  }
  visit(directory);
  return checked;
}

module.exports = { assertReleaseFiles };
if (require.main === module) console.log(`Release isolation passed: ${assertReleaseFiles(path.join(__dirname, 'dist'))} HTML/CSS/JS files checked.`);
