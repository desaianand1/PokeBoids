// This file is automatically updated by pnpm version commands
export const gameVersion = '1.3.0';

// Parse version components for programmatic use
export const versionParts = {
  major: 1,
  minor: 3,
  patch: 0
};

// Format: returns version with optional prefix
export function formatVersion(prefix = 'v') {
  return `${prefix}${gameVersion}`;
}
