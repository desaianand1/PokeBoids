// This file is automatically updated by pnpm version commands
export const gameVersion = '0.4.1';

// Parse version components for programmatic use
export const versionParts = {
  major: 0,
  minor: 4,
  patch: 1
};

// Format: returns version with optional prefix
export function formatVersion(prefix = 'v') {
  return `${prefix}${gameVersion}`;
}
