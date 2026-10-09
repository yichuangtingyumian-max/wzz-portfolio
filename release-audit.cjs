const fs = require('node:fs');
const path = require('node:path');

function assertReleaseFiles(directory, expectedFiles) {
  const forbiddenPath = /(^|[\\/])(?:node_modules|__dev|dev|\.local-backups|\.cache|\.git|versions|archives)([\\/]|$)|(^|[\\/])(?:\.env(?:\..*)?|preview\.cjs|package(?:-lock)?\.json|pnpm-lock\.yaml|agentation[^\\/]*|react(?:-dom)?[^\\/]*|.*\.(?:zip|bundle|pem|key))$/i;
  const forbiddenContent = /\/__dev\/|AgentationVanilla|agentation-toolbar|data-ui-annotator-host|WZZAgentationIsland|WZZAnnotationBackup|feedback-freeze-styles|react-dom|react\.development|react\.production/i;
  let checked = 0;
  const found = new Set();
  function visit(folder) {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name);
      const relative = path.relative(directory, file);
      if (forbiddenPath.test(relative)) throw new Error(`Development file in release: ${relative}`);
      if (entry.isSymbolicLink()) throw new Error(`Symbolic link in release: ${relative}`);
      if (entry.isDirectory()) visit(file);
      else {
        const name = relative.split(path.sep).join('/');
        if (expectedFiles && !expectedFiles.has(name)) throw new Error(`Unexpected file in release: ${name}`);
        found.add(name);
        if (/\.(html|css|[cm]?js)$/i.test(file)) {
        if (forbiddenContent.test(fs.readFileSync(file, 'utf8'))) throw new Error(`Development code in release: ${relative}`);
        checked++;
        }
      }
    }
  }
  visit(directory);
  if (expectedFiles) for (const file of expectedFiles) if (!found.has(file)) throw new Error(`Missing release file: ${file}`);
  return checked;
}

module.exports = { assertReleaseFiles };
if (require.main === module) {
  const directory = path.resolve(__dirname, process.argv[2] || '.cache/netlify-publish');
  const expectedFiles = new Set(JSON.parse(fs.readFileSync(directory + '.files.json', 'utf8')));
  console.log(`Release isolation passed: ${assertReleaseFiles(directory, expectedFiles)} HTML/CSS/JS files checked; ${expectedFiles.size} release files matched.`);
}
