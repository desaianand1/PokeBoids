/**
 * Constants for mathematically significant angles and their cosine values
 */
export const ANGLES = {
  ZERO: 0,
  QUARTER_PI: Math.PI / 4,    // 45 degrees
  HALF_PI: Math.PI / 2,       // 90 degrees
  PI: Math.PI,                // 180 degrees
  THREE_HALF_PI: Math.PI * 1.5 // 270 degrees
} as const;

export const COS_ANGLES = {
  ZERO: 1,                    // cos(0) = 1
  QUARTER_PI: Math.SQRT1_2,   // cos(45°) = 1/√2 ≈ 0.707
  HALF_PI: 0,                 // cos(90°) = 0
  PI: -1,                     // cos(180°) = -1
  THREE_HALF_PI: 0           // cos(270°) = 0
} as const;

/**
 * Epsilon values for different purposes
 */
export const EPSILON = {
  ANGLE: 0.03,      // For angle comparisons and adjustments
  DOT_PRODUCT: 0.0001 // For dot product clamping
} as const;

/**
 * Makes an angle safe by adjusting it away from problematic values.
 * This prevents issues with floating-point precision and mathematical edge cases.
 * 
 * @param angle The angle to make safe (in radians)
 * @returns A safe version of the angle
 */
export function safeAngle(angle: number): number {
  // Normalize angle to [0, 2π]
  angle = angle % (Math.PI * 2);
  if (angle < 0) angle += Math.PI * 2;

  // Check for problematic angles
  const isNear = (a: number, b: number) => Math.abs(a - b) < EPSILON.ANGLE;

  // Add epsilon to problematic angles
  if (isNear(angle, ANGLES.ZERO)) {
    return EPSILON.ANGLE;
  }
  if (isNear(angle, ANGLES.HALF_PI)) {
    // Use a larger epsilon for 90 degrees to avoid edge cases
    return ANGLES.HALF_PI + EPSILON.ANGLE * 2;
  }
  if (isNear(angle, ANGLES.PI)) {
    return ANGLES.PI + EPSILON.ANGLE;
  }
  if (isNear(angle, ANGLES.THREE_HALF_PI)) {
    return ANGLES.THREE_HALF_PI + EPSILON.ANGLE;
  }

  return angle;
}

/**
 * Clamps a dot product to [-1, 1] to handle numerical precision issues.
 * Also adjusts values very close to problematic cosine values.
 * 
 * @param value The dot product value to clamp
 * @returns The clamped and adjusted value
 */
export function clampDotProduct(value: number): number {
  // First clamp to valid range
  value = Math.max(-1, Math.min(1, value));
  
  // Adjust values near problematic cosines
  const isNear = (a: number, b: number) => Math.abs(a - b) < EPSILON.DOT_PRODUCT;
  
  if (isNear(value, COS_ANGLES.HALF_PI)) {
    return COS_ANGLES.HALF_PI + EPSILON.DOT_PRODUCT;
  }
  if (isNear(value, COS_ANGLES.THREE_HALF_PI)) {
    return COS_ANGLES.THREE_HALF_PI + EPSILON.DOT_PRODUCT;
  }
  
  return value;
}
