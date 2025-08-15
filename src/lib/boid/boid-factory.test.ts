import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BoidFactory } from './boid-factory';
import { BoidVariant } from './types';
import type { IBoidDependencies } from '$interfaces/boid';
import type { IVectorFactory, IRandomGenerator, ITimeProvider, IPhysics } from '$interfaces';
import type { IGameEventBus } from '$events/types';

// Mock PhaserBoid
vi.mock('./phaser-boid', () => ({
	PhaserBoid: vi.fn().mockImplementation(() => ({
		getId: vi.fn().mockReturnValue('test-id'),
		getVariant: vi.fn().mockReturnValue(BoidVariant.PREY),
		destroy: vi.fn()
	}))
}));

// Mock BoidSpriteManager
vi.mock('./animation/sprite-manager', () => ({
	BoidSpriteManager: {
		getInstance: vi.fn(() => ({
			getRandomSprite: vi.fn().mockReturnValue(null)
		}))
	}
}));

// Create minimal mock scene
const createMockScene = () => ({
	scale: { width: 800, height: 600 },
	add: { existing: vi.fn() }
});

// Mock dependencies
const createMockDependencies = (): Omit<IBoidDependencies, 'config'> => ({
	vectorFactory: {
		create: vi.fn().mockImplementation((x = 0, y = 0) => ({ x, y })),
		zero: vi.fn().mockReturnValue({ x: 0, y: 0 }),
		fromAngle: vi.fn(),
		random: vi.fn(),
		up: vi.fn(),
		down: vi.fn(),
		left: vi.fn(),
		right: vi.fn()
	} as IVectorFactory,
	eventEmitter: {
		emit: vi.fn(),
		on: vi.fn(),
		off: vi.fn(),
		once: vi.fn(),
		removeAllListeners: vi.fn(),
		subscribe: vi.fn(),
		unsubscribe: vi.fn(),
		unsubscribeAll: vi.fn(),
		dispatch: vi.fn(),
		hasListeners: vi.fn().mockReturnValue(false),
		destroy: vi.fn()
	} as IGameEventBus,
	random: {
		float: vi.fn().mockReturnValue(100),
		integer: vi.fn().mockReturnValue(50),
		boolean: vi.fn().mockReturnValue(true),
		angle: vi.fn().mockReturnValue(0),
		pick: vi.fn().mockImplementation(<T>(array: T[]): T => array[0]),
		value: vi.fn().mockReturnValue(0.5)
	} as IRandomGenerator,
	time: {
		now: vi.fn().mockReturnValue(1000),
		getDelta: vi.fn().mockReturnValue(16),
		getFrame: vi.fn().mockReturnValue(60),
		getFPS: vi.fn().mockReturnValue(60),
		setTimeout: vi.fn().mockReturnValue(1),
		clearTimeout: vi.fn()
	} as ITimeProvider,
	physics: {
		circleOverlap: vi.fn().mockReturnValue(false),
		pointInCircle: vi.fn().mockReturnValue(false),
		angleBetweenPoints: vi.fn().mockReturnValue(0),
		shortestAngleBetween: vi.fn().mockReturnValue(0)
	} as IPhysics
});

describe('BoidFactory', () => {
	let factory: BoidFactory;
	let mockScene: ReturnType<typeof createMockScene>;
	let mockDeps: Omit<IBoidDependencies, 'config'>;

	beforeEach(() => {
		mockScene = createMockScene();
		mockDeps = createMockDependencies();
		factory = new BoidFactory(mockScene as unknown as Phaser.Scene, mockDeps);
	});

	describe('constructor', () => {
		test('should create factory with valid dependencies', () => {
			expect(factory).toBeDefined();
			expect(factory.createPrey).toBeDefined();
			expect(factory.createPredator).toBeDefined();
		});
	});

	describe('createBoid', () => {
		test('should create a boid at specified position', () => {
			const boid = factory.createBoid(100, 200, BoidVariant.PREY);

			expect(boid).toBeDefined();
			expect(mockScene.add.existing).toHaveBeenCalledWith(boid);
		});
	});

	describe('createPrey', () => {
		test('should create a prey boid', () => {
			const boid = factory.createPrey(100, 200);

			expect(boid).toBeDefined();
			expect(mockScene.add.existing).toHaveBeenCalledWith(boid);
		});
	});

	describe('createPredator', () => {
		test('should create a predator boid', () => {
			const boid = factory.createPredator(300, 400);

			expect(boid).toBeDefined();
			expect(mockScene.add.existing).toHaveBeenCalledWith(boid);
		});
	});

	describe('createBoids', () => {
		test('should create multiple boids', () => {
			const count = 5;
			const boids = factory.createBoids(count, BoidVariant.PREY);

			expect(boids).toHaveLength(count);
			expect(mockScene.add.existing).toHaveBeenCalledTimes(count);
		});

		test('should handle zero count', () => {
			const boids = factory.createBoids(0, BoidVariant.PREY);
			expect(boids).toHaveLength(0);
		});

		test('should use random positioning within bounds', () => {
			vi.mocked(mockDeps.random.float).mockReturnValueOnce(100).mockReturnValueOnce(200);

			const boids = factory.createBoids(1, BoidVariant.PREY);

			expect(boids).toHaveLength(1);
			expect(mockDeps.random.float).toHaveBeenCalledTimes(2); // x and y
		});
	});

	describe('createPreys', () => {
		test('should create multiple prey boids', () => {
			const count = 3;
			const boids = factory.createPreys(count);

			expect(boids).toHaveLength(count);
		});
	});

	describe('createPredators', () => {
		test('should create multiple predator boids', () => {
			const count = 2;
			const boids = factory.createPredators(count);

			expect(boids).toHaveLength(count);
		});
	});

	describe('error handling', () => {
		test('should handle invalid positions gracefully', () => {
			expect(() => factory.createPrey(NaN, 100)).not.toThrow();
			expect(() => factory.createPrey(100, NaN)).not.toThrow();
		});

		test('should handle large counts efficiently', () => {
			const startTime = performance.now();
			const boids = factory.createBoids(100, BoidVariant.PREY);
			const endTime = performance.now();

			expect(boids).toHaveLength(100);
			expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
		});
	});
});
