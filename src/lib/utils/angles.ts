/**
 * Constants for mathematically significant angles and their cosine values
 */
export const ANGLES = {
	ZERO: 0,
	QUARTER_PI: Math.PI / 4, // 45 degrees
	HALF_PI: Math.PI / 2, // 90 degrees
	PI: Math.PI, // 180 degrees
	THREE_HALF_PI: Math.PI * 1.5, // 270 degrees
	TWO_PI: Math.PI * 2 // 360 degrees
} as const;

/**
 * Normalizes an angle to the range [0, 2π)
 *
 * @param angle The angle to normalize (in radians)
 * @returns The normalized angle in the range [0, 2π)
 */
export function normalizeAngle(angle: number): number {
	angle = angle % ANGLES.TWO_PI;
	if (angle < 0) angle += ANGLES.TWO_PI;
	return angle;
}

/**
 * Clamps a value to ensure it's within a specified range.
 *
 * @param value The value to clamp
 * @param min The minimum allowed value (default: -1)
 * @param max The maximum allowed value (default: 1)
 * @returns The clamped value
 */
export function clamp(value: number, min: number = -1, max: number = 1): number {
	return Math.max(min, Math.min(max, value));
}
