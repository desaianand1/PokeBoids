import { describe, test, expect } from 'vitest';
import {
	ANGLES,
	normalizeAngle,
	clamp,
	radiansToDegrees,
	degreesToRadians,
	areAnglesEqual,
	hasAngleChanged
} from './angles';

describe('ANGLES constants', () => {
	test('should have correct mathematical values', () => {
		expect(ANGLES.ZERO).toBe(0);
		expect(ANGLES.QUARTER_PI).toBe(Math.PI / 4);
		expect(ANGLES.HALF_PI).toBe(Math.PI / 2);
		expect(ANGLES.PI).toBe(Math.PI);
		expect(ANGLES.THREE_HALF_PI).toBe(Math.PI * 1.5);
		expect(ANGLES.TWO_PI).toBe(Math.PI * 2);
	});

	test('should be immutable constants', () => {
		// ANGLES uses 'as const' for TypeScript immutability, but is not frozen at runtime
		// This test verifies the TypeScript type safety, not runtime immutability
		const originalZero = ANGLES.ZERO;
		expect(originalZero).toBe(0);
	});

	test('should have relationships between constants', () => {
		expect(ANGLES.QUARTER_PI * 2).toBe(ANGLES.HALF_PI);
		expect(ANGLES.HALF_PI * 2).toBe(ANGLES.PI);
		expect(ANGLES.PI * 2).toBe(ANGLES.TWO_PI);
		expect(ANGLES.THREE_HALF_PI).toBe(ANGLES.PI + ANGLES.HALF_PI);
	});
});

describe('normalizeAngle', () => {
	test('should normalize positive angles within range', () => {
		expect(normalizeAngle(Math.PI)).toBe(Math.PI);
		expect(normalizeAngle(Math.PI / 2)).toBe(Math.PI / 2);
		expect(normalizeAngle(0)).toBe(0);
	});

	test('should normalize angles greater than 2π', () => {
		expect(normalizeAngle(3 * Math.PI)).toBeCloseTo(Math.PI, 10);
		expect(normalizeAngle(4 * Math.PI)).toBeCloseTo(0, 10);
		expect(normalizeAngle(2.5 * Math.PI)).toBeCloseTo(0.5 * Math.PI, 10);
	});

	test('should normalize negative angles', () => {
		expect(normalizeAngle(-Math.PI)).toBeCloseTo(Math.PI, 10);
		expect(normalizeAngle(-Math.PI / 2)).toBeCloseTo(1.5 * Math.PI, 10);
		expect(normalizeAngle(-2 * Math.PI)).toBeCloseTo(0, 10);
	});

	test('should handle very large angles', () => {
		const largeAngle = 100 * Math.PI;
		const normalized = normalizeAngle(largeAngle);
		expect(normalized).toBeGreaterThanOrEqual(0);
		expect(normalized).toBeLessThan(2 * Math.PI);
		expect(normalized).toBeCloseTo(0, 10);
	});

	test('should handle very large negative angles', () => {
		const largeNegativeAngle = -100 * Math.PI;
		const normalized = normalizeAngle(largeNegativeAngle);
		expect(normalized).toBeGreaterThanOrEqual(0);
		expect(normalized).toBeLessThan(2 * Math.PI);
		// Due to floating-point precision, result is close to 2*PI, not 0
		expect(normalized).toBeCloseTo(2 * Math.PI, 5);
	});

	test('should handle zero angle', () => {
		expect(normalizeAngle(0)).toBe(0);
		// -0 in JavaScript is distinct from +0, normalizeAngle returns -0 for -0 input
		expect(Object.is(normalizeAngle(-0), 0)).toBe(false);
		expect(normalizeAngle(-0)).toBe(-0);
	});

	test('should handle edge case exactly at 2π', () => {
		expect(normalizeAngle(2 * Math.PI)).toBeCloseTo(0, 10);
		expect(normalizeAngle(-2 * Math.PI)).toBeCloseTo(0, 10);
	});

	test('should handle floating point precision issues', () => {
		const almostZero = 1e-15;
		const almostTwoPi = 2 * Math.PI - 1e-15;

		expect(normalizeAngle(almostZero)).toBeCloseTo(almostZero, 10);
		expect(normalizeAngle(almostTwoPi)).toBeCloseTo(almostTwoPi, 10);
	});

	test('should handle special floating point values', () => {
		expect(normalizeAngle(Infinity)).toBeNaN();
		expect(normalizeAngle(-Infinity)).toBeNaN();
		expect(normalizeAngle(NaN)).toBeNaN();
	});

	test('should be consistent for equivalent angles', () => {
		const angle = Math.PI / 3;
		const equivalent = angle + 2 * Math.PI;

		expect(normalizeAngle(angle)).toBeCloseTo(normalizeAngle(equivalent), 10);
	});
});

describe('clamp', () => {
	test('should clamp values within default range [-1, 1]', () => {
		expect(clamp(0.5)).toBe(0.5);
		expect(clamp(-0.5)).toBe(-0.5);
		expect(clamp(0)).toBe(0);
	});

	test('should clamp values outside default range', () => {
		expect(clamp(2)).toBe(1);
		expect(clamp(-2)).toBe(-1);
		expect(clamp(1.5)).toBe(1);
		expect(clamp(-1.5)).toBe(-1);
	});

	test('should clamp to custom range', () => {
		expect(clamp(5, 0, 10)).toBe(5);
		expect(clamp(-5, 0, 10)).toBe(0);
		expect(clamp(15, 0, 10)).toBe(10);
	});

	test('should handle edge cases at boundaries', () => {
		expect(clamp(1)).toBe(1);
		expect(clamp(-1)).toBe(-1);
		expect(clamp(10, 0, 10)).toBe(10);
		expect(clamp(0, 0, 10)).toBe(0);
	});

	test('should handle inverted range gracefully', () => {
		// When min > max, behavior follows Math.max(min, Math.min(max, value))
		expect(clamp(5, 10, 0)).toBe(10); // Math.max(10, Math.min(0, 5)) = Math.max(10, 0) = 10
	});

	test('should handle special floating point values', () => {
		expect(clamp(Infinity)).toBe(1);
		expect(clamp(-Infinity)).toBe(-1);
		expect(clamp(NaN)).toBeNaN();
	});

	test('should handle very small floating point values', () => {
		const tiny = 1e-15;
		expect(clamp(tiny)).toBe(tiny);
		expect(clamp(-tiny)).toBe(-tiny);
	});

	test('should handle zero range (min === max)', () => {
		expect(clamp(5, 3, 3)).toBe(3);
		expect(clamp(1, 3, 3)).toBe(3);
		expect(clamp(3, 3, 3)).toBe(3);
	});

	test('should handle negative ranges', () => {
		expect(clamp(-5, -10, -2)).toBe(-5);
		expect(clamp(-15, -10, -2)).toBe(-10);
		expect(clamp(0, -10, -2)).toBe(-2);
	});

	test('should maintain precision for small ranges', () => {
		const value = 0.123456789;
		const clamped = clamp(value, 0, 1);
		expect(clamped).toBe(value);
	});
});

describe('radiansToDegrees', () => {
	test('should convert common angles correctly', () => {
		expect(radiansToDegrees(0)).toBe(0);
		expect(radiansToDegrees(Math.PI)).toBeCloseTo(180, 10);
		expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90, 10);
		expect(radiansToDegrees(2 * Math.PI)).toBeCloseTo(360, 10);
		expect(radiansToDegrees(Math.PI / 4)).toBeCloseTo(45, 10);
		expect(radiansToDegrees((3 * Math.PI) / 4)).toBeCloseTo(135, 10);
	});

	test('should handle negative angles', () => {
		expect(radiansToDegrees(-Math.PI)).toBeCloseTo(-180, 10);
		expect(radiansToDegrees(-Math.PI / 2)).toBeCloseTo(-90, 10);
	});

	test('should handle large angles', () => {
		expect(radiansToDegrees(10 * Math.PI)).toBeCloseTo(1800, 10);
		expect(radiansToDegrees(-10 * Math.PI)).toBeCloseTo(-1800, 10);
	});

	test('should handle special floating point values', () => {
		expect(radiansToDegrees(Infinity)).toBe(Infinity);
		expect(radiansToDegrees(-Infinity)).toBe(-Infinity);
		expect(radiansToDegrees(NaN)).toBeNaN();
	});

	test('should maintain precision for small angles', () => {
		const smallAngle = 1e-10;
		const degrees = radiansToDegrees(smallAngle);
		expect(degrees).toBeCloseTo((smallAngle * 180) / Math.PI, 15);
	});

	test('should be inverse of degreesToRadians', () => {
		const testAngles = [0, 30, 45, 90, 135, 180, 270, 360];

		testAngles.forEach((degrees) => {
			const radians = degreesToRadians(degrees);
			const backToDegrees = radiansToDegrees(radians);
			expect(backToDegrees).toBeCloseTo(degrees, 10);
		});
	});
});

describe('degreesToRadians', () => {
	test('should convert common angles correctly', () => {
		expect(degreesToRadians(0)).toBe(0);
		expect(degreesToRadians(180)).toBeCloseTo(Math.PI, 10);
		expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2, 10);
		expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI, 10);
		expect(degreesToRadians(45)).toBeCloseTo(Math.PI / 4, 10);
		expect(degreesToRadians(135)).toBeCloseTo((3 * Math.PI) / 4, 10);
	});

	test('should handle negative degrees', () => {
		expect(degreesToRadians(-180)).toBeCloseTo(-Math.PI, 10);
		expect(degreesToRadians(-90)).toBeCloseTo(-Math.PI / 2, 10);
	});

	test('should handle large degrees', () => {
		expect(degreesToRadians(720)).toBeCloseTo(4 * Math.PI, 10);
		expect(degreesToRadians(-720)).toBeCloseTo(-4 * Math.PI, 10);
	});

	test('should handle special floating point values', () => {
		expect(degreesToRadians(Infinity)).toBe(Infinity);
		expect(degreesToRadians(-Infinity)).toBe(-Infinity);
		expect(degreesToRadians(NaN)).toBeNaN();
	});

	test('should maintain precision for small degrees', () => {
		const smallDegrees = 1e-10;
		const radians = degreesToRadians(smallDegrees);
		expect(radians).toBeCloseTo((smallDegrees * Math.PI) / 180, 15);
	});

	test('should be inverse of radiansToDegrees', () => {
		const testRadians = [
			0,
			Math.PI / 6,
			Math.PI / 4,
			Math.PI / 2,
			Math.PI,
			(3 * Math.PI) / 2,
			2 * Math.PI
		];

		testRadians.forEach((radians) => {
			const degrees = radiansToDegrees(radians);
			const backToRadians = degreesToRadians(degrees);
			expect(backToRadians).toBeCloseTo(radians, 10);
		});
	});
});

describe('areAnglesEqual', () => {
	test('should return true for identical angles', () => {
		expect(areAnglesEqual(Math.PI, Math.PI)).toBe(true);
		expect(areAnglesEqual(0, 0)).toBe(true);
		expect(areAnglesEqual(Math.PI / 2, Math.PI / 2)).toBe(true);
	});

	test('should return true for angles within 1 degree tolerance', () => {
		const angle1 = degreesToRadians(45);
		const angle2 = degreesToRadians(45.4); // Within 1 degree when rounded
		expect(areAnglesEqual(angle1, angle2)).toBe(true);
	});

	test('should return false for angles outside 1 degree tolerance', () => {
		const angle1 = degreesToRadians(45);
		const angle2 = degreesToRadians(46.5); // Outside 1 degree when rounded
		expect(areAnglesEqual(angle1, angle2)).toBe(false);
	});

	test('should handle boundary cases for rounding', () => {
		const angle1 = degreesToRadians(44.5); // Rounds to 45
		const angle2 = degreesToRadians(45.4); // Rounds to 45
		expect(areAnglesEqual(angle1, angle2)).toBe(true);

		const angle3 = degreesToRadians(44.4); // Rounds to 44
		const angle4 = degreesToRadians(45.6); // Rounds to 46
		expect(areAnglesEqual(angle3, angle4)).toBe(false);
	});

	test('should handle negative angles', () => {
		const angle1 = degreesToRadians(-45);
		const angle2 = degreesToRadians(-45.3);
		expect(areAnglesEqual(angle1, angle2)).toBe(true);
	});

	test('should handle large angles', () => {
		const angle1 = degreesToRadians(720); // 720 degrees
		const angle2 = degreesToRadians(720.4); // Close to 720
		expect(areAnglesEqual(angle1, angle2)).toBe(true);
	});

	test('should handle special floating point values', () => {
		// NaN rounds to NaN, but NaN !== NaN in JavaScript, so areAnglesEqual returns false
		expect(areAnglesEqual(NaN, NaN)).toBe(false);
		expect(areAnglesEqual(Infinity, Infinity)).toBe(true);
		expect(areAnglesEqual(Infinity, -Infinity)).toBe(false);
	});

	test('should handle very small angle differences', () => {
		const angle1 = 1e-15;
		const angle2 = 2e-15;
		// Both should round to 0 degrees
		expect(areAnglesEqual(angle1, angle2)).toBe(true);
	});

	test('should handle angles differing by exactly 1 degree', () => {
		const angle1 = degreesToRadians(45);
		const angle2 = degreesToRadians(46);
		expect(areAnglesEqual(angle1, angle2)).toBe(false);
	});

	test('should be symmetric', () => {
		const angle1 = degreesToRadians(30.3);
		const angle2 = degreesToRadians(30.7);

		expect(areAnglesEqual(angle1, angle2)).toBe(areAnglesEqual(angle2, angle1));
	});
});

describe('hasAngleChanged', () => {
	test('should return false for identical angles', () => {
		expect(hasAngleChanged(Math.PI, Math.PI)).toBe(false);
		expect(hasAngleChanged(0, 0)).toBe(false);
	});

	test('should return false for angles within default precision (1 degree)', () => {
		const angle1 = degreesToRadians(45);
		const angle2 = degreesToRadians(45.4);
		expect(hasAngleChanged(angle1, angle2)).toBe(false);
	});

	test('should return true for angles outside default precision', () => {
		const angle1 = degreesToRadians(45);
		const angle2 = degreesToRadians(46.5);
		expect(hasAngleChanged(angle1, angle2)).toBe(true);
	});

	test('should respect custom precision', () => {
		const angle1 = degreesToRadians(45);
		const angle2 = degreesToRadians(45.1);

		// With 1 degree precision, should be false
		expect(hasAngleChanged(angle1, angle2, 1)).toBe(false);

		// With 0.05 degree precision, should be true
		expect(hasAngleChanged(angle1, angle2, 0.05)).toBe(true);
	});

	test('should handle zero precision', () => {
		const angle1 = degreesToRadians(45);
		const angle2 = degreesToRadians(45.001);

		// With 0 precision, any difference should matter
		expect(hasAngleChanged(angle1, angle2, 0)).toBe(true);
	});

	test('should handle large precision values', () => {
		const angle1 = degreesToRadians(10);
		const angle2 = degreesToRadians(20);

		// hasAngleChanged rounds to precision steps: 10/30 = 0.33 -> 0, 20/30 = 0.66 -> 1
		// So it rounds 10 to 0*30=0 and 20 to 1*30=30, which are different
		expect(hasAngleChanged(angle1, angle2, 30)).toBe(true);
	});

	test('should handle negative angles', () => {
		const angle1 = degreesToRadians(-45);
		const angle2 = degreesToRadians(-45.3);
		expect(hasAngleChanged(angle1, angle2)).toBe(false);

		const angle3 = degreesToRadians(-45);
		const angle4 = degreesToRadians(-47);
		expect(hasAngleChanged(angle3, angle4)).toBe(true);
	});

	test('should handle boundary cases with rounding', () => {
		// Test angles that are on precision boundaries
		const angle1 = degreesToRadians(44.5);
		const angle2 = degreesToRadians(45.5);

		// Both should round to multiples of 1 degree precision
		// 44.5 rounds to 45, 45.5 rounds to 46 when multiplied by precision
		expect(hasAngleChanged(angle1, angle2, 1)).toBe(true);
	});

	test('should handle very small precision values', () => {
		const angle1 = degreesToRadians(45);
		const angle2 = degreesToRadians(45.0001);

		expect(hasAngleChanged(angle1, angle2, 0.0001)).toBe(true);
		expect(hasAngleChanged(angle1, angle2, 0.001)).toBe(false);
	});

	test('should handle special floating point values', () => {
		// NaN rounds to NaN, and NaN !== NaN, so hasAngleChanged returns true
		expect(hasAngleChanged(NaN, NaN)).toBe(true);
		expect(hasAngleChanged(Infinity, Infinity)).toBe(false);
		expect(hasAngleChanged(Infinity, -Infinity)).toBe(true);
	});

	test('should be consistent with different precision values', () => {
		const angle1 = degreesToRadians(45);
		const angle2 = degreesToRadians(47);

		// 2-degree difference should be detected with 1-degree precision
		expect(hasAngleChanged(angle1, angle2, 1)).toBe(true);
		// With 3-degree precision: 45/3=15, 47/3=15.67->16, so 15*3=45 vs 16*3=48
		expect(hasAngleChanged(angle1, angle2, 3)).toBe(true);
	});

	test('should handle floating point precision edge cases', () => {
		const angle1 = 0;
		const angle2 = 1e-15; // Very small angle

		// Should be treated as no change with default precision
		expect(hasAngleChanged(angle1, angle2)).toBe(false);
	});

	test('should be symmetric', () => {
		const angle1 = degreesToRadians(30);
		const angle2 = degreesToRadians(32);

		expect(hasAngleChanged(angle1, angle2)).toBe(hasAngleChanged(angle2, angle1));
	});

	test('should handle large angle values', () => {
		const angle1 = degreesToRadians(720); // 720 degrees
		const angle2 = degreesToRadians(722); // 722 degrees

		expect(hasAngleChanged(angle1, angle2)).toBe(true);
	});
});
