import { describe, test, expect, beforeEach, vi } from 'vitest';
import { PhaserEventAdapter, type IGameEventBus } from '$adapters/phaser-events';
import type { Scene } from 'phaser';

describe('PhaserEventAdapter', () => {
	let adapter: PhaserEventAdapter;
	let mockScene: Scene;
	let mockEventBus: IGameEventBus;

	beforeEach(() => {
		// Mock Phaser scene
		mockScene = {
			events: {
				emit: vi.fn(),
				on: vi.fn(),
				once: vi.fn(),
				off: vi.fn(),
				removeAllListeners: vi.fn()
			}
		} as unknown as Scene;

		// Mock event bus
		mockEventBus = {
			emit: vi.fn().mockReturnValue(true),
			on: vi.fn().mockReturnValue({ emit: () => true }),
			once: vi.fn().mockReturnValue({ emit: () => true }),
			off: vi.fn().mockReturnValue({ emit: () => true }),
			removeAllListeners: vi.fn().mockReturnValue({ emit: () => true }),
			subscribe: vi.fn(),
			unsubscribe: vi.fn(),
			unsubscribeAll: vi.fn(),
			dispatch: vi.fn(),
			hasListeners: vi.fn().mockReturnValue(false)
		};

		adapter = new PhaserEventAdapter(mockScene, mockEventBus);
	});

	test('should forward events from Phaser to event bus', () => {
		const testData = { value: 42 };
		adapter.emit('simulation-speed-changed', testData);

		expect(mockScene.events.emit).toHaveBeenCalledWith('simulation-speed-changed', testData);
		expect(mockEventBus.emit).toHaveBeenCalledWith('simulation-speed-changed', testData);
	});

	test('should handle event subscriptions', () => {
		const handler = vi.fn();
		adapter.on('game-started', handler);

		expect(mockScene.events.on).toHaveBeenCalledWith('game-started', handler, undefined);
	});

	test('should handle one-time event subscriptions', () => {
		const handler = vi.fn();
		adapter.once('game-reset', handler);

		expect(mockScene.events.on).toHaveBeenCalled();
	});

	test('should handle event unsubscriptions', () => {
		const handler = vi.fn();
		adapter.off('simulation-paused', handler);

		expect(mockScene.events.off).toHaveBeenCalledWith('simulation-paused', handler, undefined);
	});

	test('should handle removing all listeners', () => {
		adapter.removeAllListeners();
		expect(mockScene.events.removeAllListeners).toHaveBeenCalled();
	});

	test('should handle removing listeners for specific event', () => {
		adapter.removeAllListeners('debug-toggle');
		expect(mockScene.events.removeAllListeners).toHaveBeenCalledWith('debug-toggle');
	});

	test('should track event listeners', () => {
		const handler = vi.fn();
		adapter.on('boid-added', handler);

		expect(adapter.hasListeners('boid-added')).toBe(true);
		expect(adapter.hasListeners('unknown-event')).toBe(false);
	});

	test('should clean up on destroy', () => {
		adapter.on('boid-added', vi.fn());
		adapter.destroy();

		expect(mockScene.events.removeAllListeners).toHaveBeenCalled();
	});

	test('should handle context binding', () => {
		const context = { value: 0 };
		const handler = function (this: typeof context) {
			this.value++;
		};

		adapter.on('simulation-resumed', handler, context);
		expect(mockScene.events.on).toHaveBeenCalledWith('simulation-resumed', handler, context);
	});

	test('should forward all Phaser events', () => {
		// Get the wildcard handler that was registered in constructor
		const wildcardHandler = (mockScene.events.on as ReturnType<typeof vi.fn>).mock.calls.find(
			(call: unknown[]) => call[0] === '*'
		)?.[1];

		expect(wildcardHandler).toBeDefined();

		// Simulate Phaser emitting an event
		if (wildcardHandler) {
			wildcardHandler('simulation-speed-changed', { value: 42 });
			expect(mockEventBus.emit).toHaveBeenCalledWith('simulation-speed-changed', { value: 42 });
		}
	});
});
