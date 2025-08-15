import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventBus } from './event-bus';
import type { GameEvents } from './types';
import type { IBoid } from '$interfaces/boid';

// Create mock boid for proper event testing
const createMockBoid = (): IBoid => ({
	getId: vi.fn().mockReturnValue('test-boid-id'),
	getVariant: vi.fn(),
	getGroupId: vi.fn(),
	getBoidPosition: vi.fn(),
	setBoidPosition: vi.fn(),
	getBoidVelocity: vi.fn(),
	setBoidVelocity: vi.fn(),
	applyForce: vi.fn(),
	getMaxSpeed: vi.fn(),
	setMaxSpeed: vi.fn(),
	getMaxForce: vi.fn(),
	setMaxForce: vi.fn(),
	getPerceptionRadius: vi.fn(),
	setPerceptionRadius: vi.fn(),
	getFieldOfViewAngle: vi.fn(),
	isInFieldOfView: vi.fn(),
	showCollisionEffect: vi.fn(),
	getStats: vi.fn(),
	takeDamage: vi.fn(),
	increaseReproduction: vi.fn(),
	levelUp: vi.fn(),
	update: vi.fn(),
	destroy: vi.fn()
});

describe('EventBus', () => {
	beforeEach(() => {
		// Clean up event bus before each test
		EventBus.destroy();
		EventBus.setDebug(false);
	});

	afterEach(() => {
		// Clean up after each test
		EventBus.destroy();
	});

	describe('basic event emission and subscription', () => {
		test('should emit and receive events', () => {
			const handler = vi.fn();
			const testData: GameEvents['boid-added'] = { boid: createMockBoid() };

			EventBus.on('boid-added', handler);
			const result = EventBus.emit('boid-added', testData);

			expect(handler).toHaveBeenCalledTimes(1);
			expect(handler).toHaveBeenCalledWith(testData);
			expect(result).toBe(true);
		});

		test('should handle multiple handlers for same event', () => {
			const handler1 = vi.fn();
			const handler2 = vi.fn();
			const testData: GameEvents['flock-updated'] = { count: 5 };

			EventBus.on('flock-updated', handler1);
			EventBus.on('flock-updated', handler2);
			EventBus.emit('flock-updated', testData);

			expect(handler1).toHaveBeenCalledWith(testData);
			expect(handler2).toHaveBeenCalledWith(testData);
		});

		test('should return false when no handlers exist', () => {
			const result = EventBus.emit('game-started', undefined);
			expect(result).toBe(false);
		});
	});

	describe('event handler management', () => {
		test('should remove specific handler with off', () => {
			const handler1 = vi.fn();
			const handler2 = vi.fn();

			EventBus.on('simulation-paused', handler1);
			EventBus.on('simulation-paused', handler2);
			EventBus.off('simulation-paused', handler1);

			EventBus.emit('simulation-paused', undefined);

			expect(handler1).not.toHaveBeenCalled();
			expect(handler2).toHaveBeenCalled();
		});

		test('should remove all handlers for event with off', () => {
			const handler1 = vi.fn();
			const handler2 = vi.fn();

			EventBus.on('game-reset', handler1);
			EventBus.on('game-reset', handler2);
			EventBus.off('game-reset');

			EventBus.emit('game-reset', undefined);

			expect(handler1).not.toHaveBeenCalled();
			expect(handler2).not.toHaveBeenCalled();
		});

		test('should handle once subscription', () => {
			const handler = vi.fn();

			EventBus.once('simulation-restart', handler);

			EventBus.emit('simulation-restart', undefined);
			EventBus.emit('simulation-restart', undefined);

			expect(handler).toHaveBeenCalledTimes(1);
		});
	});

	describe('subscription interface', () => {
		test('should support subscribe and unsubscribe', () => {
			const handler = vi.fn();

			EventBus.subscribe('theme-changed', handler);
			EventBus.emit('theme-changed', { isDark: true });

			expect(handler).toHaveBeenCalledWith({ isDark: true });

			EventBus.unsubscribe('theme-changed', handler);
			EventBus.emit('theme-changed', { isDark: false });

			expect(handler).toHaveBeenCalledTimes(1); // Should not be called again
		});

		test('should unsubscribe all handlers', () => {
			const handler1 = vi.fn();
			const handler2 = vi.fn();

			EventBus.subscribe('debug-toggle', handler1);
			EventBus.subscribe('debug-toggle', handler2);
			EventBus.unsubscribeAll();

			EventBus.emit('debug-toggle', { enabled: true });

			expect(handler1).not.toHaveBeenCalled();
			expect(handler2).not.toHaveBeenCalled();
		});
	});

	describe('dispatch interface', () => {
		test('should dispatch events', () => {
			const handler = vi.fn();

			EventBus.on('boid-removed', handler);
			EventBus.dispatch('boid-removed', { boid: createMockBoid() });

			expect(handler).toHaveBeenCalled();
		});

		test('should check if listeners exist', () => {
			expect(EventBus.hasListeners('game-started')).toBe(false);

			EventBus.on('game-started', vi.fn());
			expect(EventBus.hasListeners('game-started')).toBe(true);
		});
	});

	describe('error handling and edge cases', () => {
		test('should handle invalid event names gracefully', () => {
			expect(() =>
				EventBus.emit('invalid-event' as keyof GameEvents & string, {} as never)
			).not.toThrow();
		});

		test('should propagate handler errors as expected', () => {
			const errorHandler = vi.fn().mockImplementation(() => {
				throw new Error('Handler error');
			});

			EventBus.on('simulation-speed-changed', errorHandler);

			// EventBus doesn't catch handler errors, so they propagate
			expect(() => EventBus.emit('simulation-speed-changed', { value: 1.5 })).toThrow(
				'Handler error'
			);
		});

		test('should handle rapid subscription/unsubscription', () => {
			const handler = vi.fn();

			for (let i = 0; i < 100; i++) {
				EventBus.on('alignment-weight-changed', handler);
				EventBus.off('alignment-weight-changed', handler);
			}

			EventBus.emit('alignment-weight-changed', { value: 1.0 });
			expect(handler).not.toHaveBeenCalled();
		});
	});

	describe('cleanup and memory management', () => {
		test('should clean up all resources on destroy', () => {
			const handler = vi.fn();

			EventBus.on('cohesion-weight-changed', handler);
			EventBus.destroy();

			EventBus.emit('cohesion-weight-changed', { value: 2.0 });
			expect(handler).not.toHaveBeenCalled();
		});

		test('should be reusable after destroy', () => {
			const handler = vi.fn();

			EventBus.on('max-speed-changed', handler);
			EventBus.destroy();

			EventBus.on('max-speed-changed', handler);
			EventBus.emit('max-speed-changed', { value: 3.0 });

			expect(handler).toHaveBeenCalledWith({ value: 3.0 });
		});
	});
});
