const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const rootDir = join(__dirname, '..');
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
const buildTime = new Date().toISOString();
const buildId = `${packageJson.version}-${buildTime}`;

const versionInfo = {
  version: packageJson.version,
  buildTime,
  buildId,
};

mkdirSync(join(rootDir, 'public'), { recursive: true });
writeFileSync(
  join(rootDir, 'public', 'version.json'),
  `${JSON.stringify(versionInfo, null, 2)}\n`,
);

mkdirSync(join(rootDir, 'src', 'generated'), { recursive: true });
writeFileSync(
  join(rootDir, 'src', 'generated', 'version.ts'),
  `export const APP_VERSION = ${JSON.stringify(versionInfo, null, 2)} as const;\n`,
);

console.log(`Wrote version metadata: ${buildId}`);