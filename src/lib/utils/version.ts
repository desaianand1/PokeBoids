// This file is automatically updated by pnpm version commands
export const gameVersion = '1.19.1';

// Parse version components for programmatic use
export const versionParts = {
	major: 1,
	minor: 19,
	patch: 1
};

// Format: returns version with optional prefix
export function formatVersion(prefix = 'v') {
	return `${prefix}${gameVersion}`;
}
