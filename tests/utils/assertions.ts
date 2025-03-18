import type { IVector2 } from '$lib/interfaces';
import { expect, type MockInstance } from 'vitest';

/**
 * Custom assertions for vector equality
 */
export function expectVectorEqual(actual: IVector2, expected: IVector2, precision = 0.0001): void {
  expect(Math.abs(actual.x - expected.x)).toBeLessThanOrEqual(precision);
  expect(Math.abs(actual.y - expected.y)).toBeLessThanOrEqual(precision);
}

/**
 * Assert that a vector has the expected length
 */
export function expectVectorLength(vector: IVector2, expectedLength: number, precision = 0.0001): void {
  expect(Math.abs(vector.length() - expectedLength)).toBeLessThanOrEqual(precision);
}

/**
 * Assert that a vector has the expected angle
 * Note: angle() is optional in IVector2, so we check if it exists
 */
export function expectVectorAngle(vector: IVector2, expectedAngle: number, precision = 0.0001): void {
  if (typeof vector.angle !== 'function') {
    throw new Error('Vector does not implement angle() method');
  }
  const angle = vector.angle();
  const diff = Math.abs(angle - expectedAngle) % (Math.PI * 2);
  expect(Math.min(diff, Math.PI * 2 - diff)).toBeLessThanOrEqual(precision);
}

/**
 * Assert that a value is within a range
 */
export function expectInRange(value: number, min: number, max: number): void {
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
}

/**
 * Assert that a value approximately equals another value
 */
export function expectApprox(actual: number, expected: number, precision = 0.0001): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(precision);
}

/**
 * Assert that an event was emitted with the expected data
 */
export function expectEventEmitted<T>(
  emitMock: MockInstance,
  eventName: string,
  expectedData?: T
): void {
  expect(emitMock).toHaveBeenCalled();
  const calls = emitMock.mock.calls as [string, unknown][];
  const call = calls.find(([event]) => event === eventName);
  expect(call).toBeDefined();
  if (expectedData !== undefined) {
    expect(call![1]).toEqual(expectedData);
  }
}

/**
 * Assert that a debug draw call was made with the expected parameters
 */
export function expectDrawCall(
  drawCalls: Array<{ type: string; params: Record<string, unknown> }>,
  type: string,
  params: Record<string, unknown>
): void {
  const call = drawCalls.find((c) => c.type === type);
  expect(call).toBeDefined();
  expect(call!.params).toMatchObject(params);
}
