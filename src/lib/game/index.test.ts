import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BoidsGame as Game } from '$game';
import { EventBus } from '$game/event-bus';
import { Flock } from '$boid/flock';
import { Boid, BoidVariant } from '$boid';
import { createPhaserMocks } from '../../../setup-tests';

// Mock Flock class
vi.mock('$boid/flock', () => {
	return {
		Flock: vi.fn().mockImplementation(() => ({
			addBoid: vi.fn(),
			run: vi.fn(),
			destroy: vi.fn(),
			clearAllObstacles: vi.fn(),
			addObstacle: vi.fn()
		}))
	};
});

// Mock Boid class
vi.mock('$boid', () => {
	return {
		Boid: vi.fn().mockImplementation(() => ({
			destroy: vi.fn(),
			preUpdate: vi.fn(),
			getVariant: vi.fn().mockReturnValue(BoidVariant.PREY),
			getPerceptionRadius: vi.fn().mockReturnValue(50),
			getVelocity: vi.fn().mockReturnValue({ x: 1, y: 0, length: () => 1 })
		})),
		BoidVariant
	};
});

describe('Game', () => {
	let game: Game;
	const { mockScene } = createPhaserMocks();

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks();

		// Spy on EventBus
		vi.spyOn(EventBus, 'emit');
		vi.spyOn(EventBus, 'on');
		vi.spyOn(EventBus, 'off');

		// Create a new game instance
		game = new Game();

		// Add required Phaser scene methods from our mocks
		Object.assign(game, mockScene);
	});

	afterEach(() => {
		game.shutdown();
		EventBus.removeAllListeners();
	});

	/**
	 * Test game initialization and setup
	 */
	describe('Initialization', () => {
		it('should set up game environment in create method', () => {
			// Act
			game.create();

			// Assert
			// Background should be created
			expect(game.add.image).toHaveBeenCalledWith(0, 0, 'day-sky');

			// Flock should be created
			expect(Flock).toHaveBeenCalled();

			// Event listeners should be set up (multiple events)
			expect(EventBus.on).toHaveBeenCalledTimes(expect.any(Number));

			// Scene ready event should be emitted
			expect(EventBus.emit).toHaveBeenCalledWith('scene-ready', { scene: game });
		});

		it('should initialize boids based on configuration', () => {
			// Arrange
			Object.assign(game, {
				simulationConfig: {
					initialPreyCount: 3,
					initialPredatorCount: 2
				}
			});

			// Set up for boid creation tracking
			game.add.existing = vi.fn();

			// Act
			game.create();
			(game as any).createBoids();

			// Assert
			// Should create prey boids
			expect(Boid).toHaveBeenCalledWith(
				game,
				expect.any(Number),
				expect.any(Number),
				BoidVariant.PREY,
				expect.any(Object)
			);

			// Should create predator boids
			expect(Boid).toHaveBeenCalledWith(
				game,
				expect.any(Number),
				expect.any(Number),
				BoidVariant.PREDATOR,
				expect.any(Object)
			);

			// Should create correct total number
			expect(Boid).toHaveBeenCalledTimes(5);

			// Should add all boids to the scene
			expect(game.add.existing).toHaveBeenCalledTimes(5);
		});
	});

	/**
	 * Test game event handling
	 */
	describe('Event handling', () => {
		it('should respond to simulation control events', () => {
			// Arrange
			game.create();

			// Test simulation pause
			EventBus.emit('simulation-paused', undefined);
			expect((game as any).simulationActive).toBe(false);
			expect(EventBus.emit).toHaveBeenCalledWith('game-paused', undefined);

			// Test simulation resume
			EventBus.emit('simulation-started', undefined);
			expect((game as any).simulationActive).toBe(true);
			expect(EventBus.emit).toHaveBeenCalledWith('game-resumed', undefined);

			// Test simulation speed
			const newSpeed = 2.0;
			EventBus.emit('simulation-speed-changed', { value: newSpeed });
			expect((game as any).simulationSpeed).toBe(newSpeed);

			// Test debug mode
			EventBus.emit('debug-toggle', { enabled: true });
			expect((game as any).debugMode).toBe(true);
		});

		it('should handle configuration changes', () => {
			// Arrange
			game.create();

			// Test boid config
			const boidConfig = { alignmentWeight: 0.5 };
			EventBus.emit('boid-config-changed', { config: boidConfig });
			expect((game as any).boidConfig).toBe(boidConfig);

			// Test simulation config
			const simulationConfig = { initialPreyCount: 50 };
			EventBus.emit('simulation-config-changed', { config: simulationConfig });
			expect((game as any).simulationConfig).toBe(simulationConfig);
		});
	});

	/**
	 * Test simulation reset
	 */
	describe('Simulation reset', () => {
		it('should properly reset the simulation', () => {
			// Arrange
			game.create();

			// Add test boids
			(game as any).boids = [{ destroy: vi.fn() }, { destroy: vi.fn() }];

			// Act
			EventBus.emit('simulation-reset', undefined);

			// Assert
			// Should destroy all existing boids
			expect((game as any).boids[0].destroy).toHaveBeenCalled();
			expect((game as any).boids[1].destroy).toHaveBeenCalled();

			// Should create new flock
			expect(Flock).toHaveBeenCalledTimes(2); // Once in create(), once in reset

			// Should emit reset event
			expect(EventBus.emit).toHaveBeenCalledWith('game-reset', undefined);
			expect(EventBus.emit).toHaveBeenCalledWith('flock-updated', { count: 0 });
		});
	});

	/**
	 * Test obstacle management
	 */
	describe('Obstacle management', () => {
		it('should create obstacles based on count', () => {
			// Arrange
			game.create();

			// Mock obstacle group
			const mockObstacleGroup = {
				clear: vi.fn(),
				add: vi.fn(),
				getLength: vi.fn().mockReturnValue(0)
			};
			(game as any).obstacleGroup = mockObstacleGroup;
			(game as any).flock = { addObstacle: vi.fn(), clearAllObstacles: vi.fn() };

			// Act
			(game as any).createObstacles(3);

			// Assert
			// Should clear existing obstacles
			expect(mockObstacleGroup.clear).toHaveBeenCalled();
			expect((game as any).flock.clearAllObstacles).toHaveBeenCalled();

			// Should create 3 new obstacles
			expect(game.add.circle).toHaveBeenCalledTimes(3);

			// Should add obstacles to the group
			expect(mockObstacleGroup.add).toHaveBeenCalledTimes(3);

			// Should make obstacles interactive
			expect(game.input.setDraggable).toHaveBeenCalledTimes(3);
		});

		it('should update obstacles when count changes', () => {
			// Arrange
			game.create();

			// Spy on createObstacles
			const createObstaclesSpy = vi.spyOn(game as any, 'createObstacles');

			// Mock obstacle group with current count = 0
			const mockObstacleGroup = {
				getLength: vi.fn().mockReturnValue(0)
			};
			(game as any).obstacleGroup = mockObstacleGroup;

			// Act - change to 5
			EventBus.emit('obstacle-count-changed', { value: 5 });

			// Assert
			expect(createObstaclesSpy).toHaveBeenCalledWith(5);

			// Reset spy
			createObstaclesSpy.mockClear();

			// Act - set count to same value (5)
			mockObstacleGroup.getLength = vi.fn().mockReturnValue(5);
			EventBus.emit('obstacle-count-changed', { value: 5 });

			// Assert - should not recreate obstacles when count doesn't change
			expect(createObstaclesSpy).not.toHaveBeenCalled();
		});
	});

	/**
	 * Test main update loop
	 */
	describe('Update loop', () => {
		it('should update boids and run flock when active', () => {
			// Arrange
			game.create();

			// Create test boids
			const boid1 = { preUpdate: vi.fn() };
			const boid2 = { preUpdate: vi.fn() };
			(game as any).boids = [boid1, boid2];

			// Set simulation as active with speed = 1
			(game as any).simulationActive = true;
			(game as any).simulationSpeed = 1.0;

			// Act
			game.update(0, 16); // 16ms = ~60fps

			// Assert
			// Should update all boids
			expect(boid1.preUpdate).toHaveBeenCalledWith(0, 16);
			expect(boid2.preUpdate).toHaveBeenCalledWith(0, 16);

			// Should run flock simulation
			expect((game as any).flock.run).toHaveBeenCalled();
		});

		it('should not update when simulation is paused', () => {
			// Arrange
			game.create();

			// Create test boids
			const boid1 = { preUpdate: vi.fn() };
			const boid2 = { preUpdate: vi.fn() };
			(game as any).boids = [boid1, boid2];

			// Set simulation as paused
			(game as any).simulationActive = false;

			// Act
			game.update(0, 16);

			// Assert
			// Should not update boids
			expect(boid1.preUpdate).not.toHaveBeenCalled();
			expect(boid2.preUpdate).not.toHaveBeenCalled();

			// Should not run flock simulation
			expect((game as any).flock.run).not.toHaveBeenCalled();
		});

		it('should adjust delta time by simulation speed', () => {
			// Arrange
			game.create();

			// Create a test boid
			const boid = { preUpdate: vi.fn() };
			(game as any).boids = [boid];

			// Set simulation as active with double speed
			(game as any).simulationActive = true;
			(game as any).simulationSpeed = 2.0;

			// Act
			game.update(0, 16); // 16ms at 60fps

			// Assert
			// Should multiply delta by speed: 16ms * 2.0 = 32ms
			expect(boid.preUpdate).toHaveBeenCalledWith(0, 32);
		});

		it('should draw debug visuals when debug mode is active', () => {
			// Arrange
			game.create();

			// Create mock debug graphics
			const mockDebugGraphics = {
				clear: vi.fn(),
				lineStyle: vi.fn().mockReturnThis(),
				strokeCircle: vi.fn().mockReturnThis(),
				lineBetween: vi.fn().mockReturnThis()
			};
			(game as any).debugGraphics = mockDebugGraphics;

			// Create a test boid
			(game as any).boids = [
				{
					x: 100,
					y: 100,
					getPerceptionRadius: vi.fn().mockReturnValue(50),
					getVariant: vi.fn().mockReturnValue(BoidVariant.PREY),
					getVelocity: vi.fn().mockReturnValue({ x: 1, y: 0, length: () => 1 })
				}
			];

			// Enable simulation and debug mode
			(game as any).simulationActive = true;
			(game as any).debugMode = true;

			// Act
			game.update(0, 16);

			// Assert
			// Should draw debug visuals
			expect(mockDebugGraphics.clear).toHaveBeenCalled();
			expect(mockDebugGraphics.lineStyle).toHaveBeenCalled();
			expect(mockDebugGraphics.strokeCircle).toHaveBeenCalled();
			expect(mockDebugGraphics.lineBetween).toHaveBeenCalled();
		});
	});

	/**
	 * Test cleanup
	 */
	describe('Cleanup', () => {
		it('should clean up resources on shutdown', () => {
			// Arrange
			game.create();

			// Act
			game.shutdown();

			// Assert
			// Should remove all event listeners
			expect(EventBus.off).toHaveBeenCalledWith('simulation-paused', undefined, game);
			expect(EventBus.off).toHaveBeenCalledWith('simulation-started', undefined, game);
			expect(EventBus.off).toHaveBeenCalledWith('simulation-reset', undefined, game);
			expect(EventBus.off).toHaveBeenCalledWith('simulation-speed-changed', undefined, game);
			expect(EventBus.off).toHaveBeenCalledWith('boid-config-changed', undefined, game);
			expect(EventBus.off).toHaveBeenCalledWith('simulation-config-changed', undefined, game);
			expect(EventBus.off).toHaveBeenCalledWith('debug-toggle', undefined, game);
			expect(EventBus.off).toHaveBeenCalledWith('obstacle-count-changed', undefined, game);

			// Should remove scale resize listener
			expect(game.scale.off).toHaveBeenCalledWith('resize', expect.any(Function), game);

			// Should destroy flock
			expect((game as any).flock.destroy).toHaveBeenCalled();
		});
	});
});
