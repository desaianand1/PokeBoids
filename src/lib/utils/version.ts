// This file is automatically updated by pnpm version commands
export const gameVersion = '0.2.5';

// Parse version components for programmatic use
export const versionParts = {
  major: 0,
  minor: 2,
  patch: 5
};

// Format: returns version with optional prefix
export function formatVersion(prefix = 'v') {
  return `${prefix}${gameVersion}`;
}
