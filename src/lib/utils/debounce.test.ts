import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
	beforeEach(() => {
		// Use fake timers for precise timing control
		vi.useFakeTimers();
	});

	afterEach(() => {
		// Restore real timers after each test
		vi.useRealTimers();
		vi.clearAllTimers();
	});

	describe('basic functionality', () => {
		test('should delay function execution', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 100);

			debouncedFn('test');
			expect(mockFn).not.toHaveBeenCalled();

			vi.advanceTimersByTime(100);
			expect(mockFn).toHaveBeenCalledWith('test');
			expect(mockFn).toHaveBeenCalledTimes(1);
		});

		test('should use default wait time when not provided', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn);

			debouncedFn();
			expect(mockFn).not.toHaveBeenCalled();

			vi.advanceTimersByTime(149); // Less than default 150ms
			expect(mockFn).not.toHaveBeenCalled();

			vi.advanceTimersByTime(1); // Now at 150ms
			expect(mockFn).toHaveBeenCalled();
		});

		test('should execute function with correct arguments', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 50);

			debouncedFn('arg1', 'arg2', 123);
			vi.advanceTimersByTime(50);

			expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123);
		});

		test('should handle function with no arguments', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 50);

			debouncedFn();
			vi.advanceTimersByTime(50);

			expect(mockFn).toHaveBeenCalledWith();
		});
	});

	describe('debouncing behavior', () => {
		test('should cancel previous timeout when called multiple times', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 100);

			debouncedFn('first');
			vi.advanceTimersByTime(50);

			debouncedFn('second');
			vi.advanceTimersByTime(50); // Total 100ms, but timer was reset

			expect(mockFn).not.toHaveBeenCalled();

			vi.advanceTimersByTime(50); // Now 100ms since second call
			expect(mockFn).toHaveBeenCalledWith('second');
			expect(mockFn).toHaveBeenCalledTimes(1);
		});

		test('should only execute the last call when called rapidly', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 100);

			debouncedFn('call1');
			vi.advanceTimersByTime(10);

			debouncedFn('call2');
			vi.advanceTimersByTime(10);

			debouncedFn('call3');
			vi.advanceTimersByTime(10);

			debouncedFn('call4');
			vi.advanceTimersByTime(100);

			expect(mockFn).toHaveBeenCalledWith('call4');
			expect(mockFn).toHaveBeenCalledTimes(1);
		});

		test('should execute multiple times if enough time passes between calls', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 100);

			debouncedFn('first');
			vi.advanceTimersByTime(100);
			expect(mockFn).toHaveBeenCalledWith('first');

			debouncedFn('second');
			vi.advanceTimersByTime(100);
			expect(mockFn).toHaveBeenCalledWith('second');

			expect(mockFn).toHaveBeenCalledTimes(2);
		});

		test('should handle burst of calls followed by quiet period', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 100);

			// Burst of calls
			for (let i = 0; i < 10; i++) {
				debouncedFn(`call${i}`);
				vi.advanceTimersByTime(5); // Total 50ms of rapid calls
			}

			// Should not have executed yet
			expect(mockFn).not.toHaveBeenCalled();

			// Wait for debounce to trigger
			vi.advanceTimersByTime(100);

			// Should execute only once with the last call's arguments
			expect(mockFn).toHaveBeenCalledWith('call9');
			expect(mockFn).toHaveBeenCalledTimes(1);
		});
	});

	describe('edge cases and error handling', () => {
		test('should handle zero wait time', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 0);

			debouncedFn('test');
			vi.advanceTimersByTime(0);

			expect(mockFn).toHaveBeenCalledWith('test');
		});

		test('should handle negative wait time', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, -100);

			debouncedFn('test');
			vi.advanceTimersByTime(0);

			// setTimeout with negative delay should execute immediately
			expect(mockFn).toHaveBeenCalledWith('test');
		});

		test('should handle very large wait time', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, Number.MAX_SAFE_INTEGER);

			debouncedFn('test');
			vi.advanceTimersByTime(1000);

			// setTimeout with MAX_SAFE_INTEGER has implementation-defined behavior
			// It may be called immediately or with a clamped timeout
			expect(mockFn).toHaveBeenCalled();
		});

		test('should handle function that throws error', () => {
			const mockFn = vi.fn(() => {
				throw new Error('Test error');
			});
			const debouncedFn = debounce(mockFn, 50);

			debouncedFn();

			expect(() => {
				vi.advanceTimersByTime(50);
			}).toThrow('Test error');
		});

		test('should handle null/undefined function gracefully', () => {
			expect(() => {
				// @ts-expect-error - Testing runtime behavior with invalid input
				debounce(null, 100);
			}).not.toThrow();

			expect(() => {
				// @ts-expect-error - Testing runtime behavior with invalid input
				debounce(undefined, 100);
			}).not.toThrow();
		});

		test('should handle non-function input', () => {
			expect(() => {
				// @ts-expect-error - Testing runtime behavior with invalid input
				const debouncedFn = debounce('not a function', 100);
				debouncedFn();
				vi.advanceTimersByTime(100);
			}).toThrow();
		});

		test('should handle Infinity as wait time', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, Infinity);

			debouncedFn('test');
			vi.advanceTimersByTime(1000000);

			// setTimeout with Infinity has implementation-defined behavior
			// It may be called immediately or with a clamped timeout
			expect(mockFn).toHaveBeenCalled();
		});

		test('should handle NaN as wait time', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, NaN);

			debouncedFn('test');
			vi.advanceTimersByTime(0);

			// NaN timeout should execute immediately (setTimeout behavior)
			expect(mockFn).toHaveBeenCalledWith('test');
		});
	});

	describe('memory management', () => {
		test('should properly clean up timeouts', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 100);

			debouncedFn('first');
			debouncedFn('second'); // Should cancel first timeout

			// Advance time to complete only the second timeout
			vi.advanceTimersByTime(100);

			expect(mockFn).toHaveBeenCalledWith('second');
			expect(mockFn).toHaveBeenCalledTimes(1);
		});

		test('should handle multiple debounced functions independently', () => {
			const mockFn1 = vi.fn();
			const mockFn2 = vi.fn();
			const debouncedFn1 = debounce(mockFn1, 50);
			const debouncedFn2 = debounce(mockFn2, 100);

			debouncedFn1('fn1');
			debouncedFn2('fn2');

			vi.advanceTimersByTime(50);
			expect(mockFn1).toHaveBeenCalledWith('fn1');
			expect(mockFn2).not.toHaveBeenCalled();

			vi.advanceTimersByTime(50);
			expect(mockFn2).toHaveBeenCalledWith('fn2');
		});

		test('should not interfere when creating multiple debounced versions of same function', () => {
			const mockFn = vi.fn();
			const debouncedFn1 = debounce(mockFn, 50);
			const debouncedFn2 = debounce(mockFn, 100);

			debouncedFn1('from1');
			debouncedFn2('from2');

			vi.advanceTimersByTime(50);
			expect(mockFn).toHaveBeenCalledWith('from1');

			vi.advanceTimersByTime(50);
			expect(mockFn).toHaveBeenCalledWith('from2');
			expect(mockFn).toHaveBeenCalledTimes(2);
		});
	});

	describe('performance characteristics', () => {
		test('should handle rapid successive calls efficiently', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 100);

			// Make 1000 rapid calls
			for (let i = 0; i < 1000; i++) {
				debouncedFn(`call${i}`);
				vi.advanceTimersByTime(1);
			}

			// Should still only execute once after the delay
			vi.advanceTimersByTime(100);
			expect(mockFn).toHaveBeenCalledTimes(1);
			expect(mockFn).toHaveBeenCalledWith('call999');
		});

		test('should handle high frequency alternating calls', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 50);

			// Alternate between two different argument sets rapidly
			for (let i = 0; i < 100; i++) {
				debouncedFn(i % 2 === 0 ? 'even' : 'odd');
				vi.advanceTimersByTime(1);
			}

			vi.advanceTimersByTime(50);
			expect(mockFn).toHaveBeenCalledTimes(1);
			expect(mockFn).toHaveBeenCalledWith('odd'); // Last call
		});

		test('should maintain consistent behavior under heavy load', () => {
			const results: string[] = [];
			const mockFn = vi.fn((value: string) => results.push(value));
			const debouncedFn = debounce(mockFn, 25);

			// Mixed pattern of calls with varying delays
			debouncedFn('a');
			vi.advanceTimersByTime(10);
			debouncedFn('b');
			vi.advanceTimersByTime(30); // Should execute 'b'

			debouncedFn('c');
			vi.advanceTimersByTime(5);
			debouncedFn('d');
			vi.advanceTimersByTime(30); // Should execute 'd'

			expect(results).toEqual(['b', 'd']);
			expect(mockFn).toHaveBeenCalledTimes(2);
		});
	});

	describe('argument handling', () => {
		test('should handle complex argument types', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 50);

			const complexArgs = [
				{ nested: { object: true } },
				['array', 'values'],
				null,
				undefined,
				42,
				'string',
				Symbol('test')
			];

			debouncedFn(...complexArgs);
			vi.advanceTimersByTime(50);

			expect(mockFn).toHaveBeenCalledWith(...complexArgs);
		});

		test('should handle changing argument counts', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 50);

			debouncedFn(1);
			vi.advanceTimersByTime(25);
			debouncedFn(1, 2, 3);
			vi.advanceTimersByTime(50);

			expect(mockFn).toHaveBeenCalledWith(1, 2, 3);
			expect(mockFn).toHaveBeenCalledTimes(1);
		});

		test('should preserve argument references', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 50);

			const obj = { value: 42 };
			debouncedFn(obj);
			vi.advanceTimersByTime(50);

			expect(mockFn).toHaveBeenCalledWith(obj);
			expect(mockFn.mock.calls[0][0]).toBe(obj); // Same reference
		});

		test('should handle mutations to arguments after call', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 50);

			const obj = { value: 42 };
			debouncedFn(obj);

			// Mutate the object before the debounced function executes
			obj.value = 100;

			vi.advanceTimersByTime(50);

			// The function should receive the mutated object (same reference)
			expect(mockFn).toHaveBeenCalledWith({ value: 100 });
		});
	});
});
