import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a full UUID v4
 */
export function generateId(): string {
	return uuidv4();
}

/**
 * Generate a short UUID (8 characters) for display purposes
 */
export function generateShortId(): string {
	return uuidv4().slice(0, 8);
}

/**
 * Generate a prefixed ID for specific entity types
 */
export function generatePrefixedId(prefix: string): string {
	return `${prefix}-${generateShortId()}`;
}
