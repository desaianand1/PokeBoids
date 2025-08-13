// This file is automatically updated by pnpm version commands
export const gameVersion = '2.0.0';

// Parse version components for programmatic use
export const versionParts = {
  major: 2,
  minor: 0,
  patch: 0
};

// Format: returns version with optional prefix
export function formatVersion(prefix = 'v') {
  return `${prefix}${gameVersion}`;
}
