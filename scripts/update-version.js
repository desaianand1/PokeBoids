#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));
const version = packageJson.version;

// Update version.ts
const versionFilePath = path.resolve(__dirname, '../src/lib/utils/version.ts');
const versionFileContent = `// This file is automatically updated by pnpm version commands
export const gameVersion = '${version}';

// Parse version components for programmatic use
export const versionParts = {
  major: ${version.split('.')[0]},
  minor: ${version.split('.')[1]},
  patch: ${version.split('.')[2]}
};

// Format: returns version with optional prefix
export function formatVersion(prefix = 'v') {
  return \`\${prefix}\${gameVersion}\`;
}
`;

fs.writeFileSync(versionFilePath, versionFileContent);
console.log(`Updated version.ts to version ${version}`);
