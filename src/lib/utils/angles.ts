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

/**
 * Converts radians to degrees
 *
 * @param radians Angle in radians
 * @returns Angle in degrees
 */
export function radiansToDegrees(radians: number): number {
	return (radians * 180) / Math.PI;
}

/**
 * Converts degrees to radians
 *
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
export function degreesToRadians(degrees: number): number {
	return (degrees * Math.PI) / 180;
}

/**
 * Compares two angles for approximate equality by converting to degrees
 * and rounding to the nearest integer. This prevents floating-point precision
 * issues when comparing angles.
 *
 * @param angle1 First angle (in radians)
 * @param angle2 Second angle (in radians)
 * @returns True if angles are approximately equal (within 1 degree)
 */
export function areAnglesEqual(angle1: number, angle2: number): boolean {
	const degrees1 = Math.round(radiansToDegrees(angle1));
	const degrees2 = Math.round(radiansToDegrees(angle2));
	return degrees1 === degrees2;
}

/**
 * Determines if an angle has changed significantly enough to warrant an update.
 * Converts to degrees, rounds, and compares. This is useful for preventing
 * infinite update loops caused by tiny floating-point differences.
 *
 * @param oldAngle Previous angle (in radians)
 * @param newAngle New angle (in radians)
 * @param precision Precision in degrees (default: 1)
 * @returns True if the angle has changed significantly
 */
export function hasAngleChanged(
	oldAngle: number,
	newAngle: number,
	precision: number = 1
): boolean {
	const degrees1 = Math.round(radiansToDegrees(oldAngle) / precision) * precision;
	const degrees2 = Math.round(radiansToDegrees(newAngle) / precision) * precision;
	return degrees1 !== degrees2;
}
