import { describe, test, expect, beforeEach, vi } from 'vitest';
import { FlockLogic } from '$boid/flock-logic';
import { TestVectorFactory } from '$tests/implementations/vector';
import { TestEventBus } from '$tests/implementations/events';
import { testStrategy } from '$tests/implementations/strategy';
import { BoidVariant } from '$boid/types';
import { createMockBoid } from '$tests/utils/mock-boid';
import { TEST_BOID_CONFIG, TEST_DEFAULTS } from '$tests/utils/constants';

describe('FlockLogic', () => {
	let vectorFactory: TestVectorFactory;
	let eventBus: TestEventBus;
	let flockLogic: FlockLogic;

	beforeEach(() => {
		vectorFactory = new TestVectorFactory();
		eventBus = new TestEventBus();

		flockLogic = new FlockLogic(vectorFactory, eventBus, testStrategy, {
			alignmentWeight: TEST_BOID_CONFIG.alignmentWeight.default,
			cohesionWeight: TEST_BOID_CONFIG.cohesionWeight.default,
			separationWeight: TEST_BOID_CONFIG.separationWeight.default,
			perceptionRadius: TEST_BOID_CONFIG.perceptionRadius.default,
			separationRadius: TEST_BOID_CONFIG.separationRadius.default,
			boundaryMargin: TEST_BOID_CONFIG.boundaryMargin.default,
			boundaryForceMultiplier: TEST_BOID_CONFIG.boundaryForceMultiplier.default,
			boundaryForceRamp: TEST_BOID_CONFIG.boundaryForceRamp.default,
			boundaryMode: 'collidable' as const,
			boundaryStuckThreshold: 3000
		});
	});

	test('should calculate forces for a boid with neighbors', () => {
		// Create a boid at (0, 0)
		const boid = createMockBoid(0, 0, BoidVariant.PREY);
		const boidPos = vectorFactory.create(0, 0);
		const boidVel = vectorFactory.create(0, 0);
		vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
		vi.spyOn(boid, 'getBoidVelocity').mockReturnValue(boidVel);
		vi.spyOn(boid, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.boid.maxSpeed);
		vi.spyOn(boid, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.boid.maxForce);

		// Create neighbors in a triangle formation
		const neighbor1 = createMockBoid(10, 0, BoidVariant.PREY);
		const neighbor1Pos = vectorFactory.create(10, 0);
		const neighbor1Vel = vectorFactory.create(1, 0);
		vi.spyOn(neighbor1, 'getBoidPosition').mockReturnValue(neighbor1Pos);
		vi.spyOn(neighbor1, 'getBoidVelocity').mockReturnValue(neighbor1Vel);

		const neighbor2 = createMockBoid(-5, 8.66, BoidVariant.PREY);
		const neighbor2Pos = vectorFactory.create(-5, 8.66);
		const neighbor2Vel = vectorFactory.create(-0.5, 0.866);
		vi.spyOn(neighbor2, 'getBoidPosition').mockReturnValue(neighbor2Pos);
		vi.spyOn(neighbor2, 'getBoidVelocity').mockReturnValue(neighbor2Vel);

		const neighbor3 = createMockBoid(-5, -8.66, BoidVariant.PREY);
		const neighbor3Pos = vectorFactory.create(-5, -8.66);
		const neighbor3Vel = vectorFactory.create(-0.5, -0.866);
		vi.spyOn(neighbor3, 'getBoidPosition').mockReturnValue(neighbor3Pos);
		vi.spyOn(neighbor3, 'getBoidVelocity').mockReturnValue(neighbor3Vel);

		const force = flockLogic.calculateForces(boid, [neighbor1, neighbor2, neighbor3]);

		// Force should be non-zero
		expect(force.length()).toBeGreaterThan(0);
	});

	test('should update all boids in the flock', () => {
		// Create test boids
		const boid1 = createMockBoid(0, 0, BoidVariant.PREY);
		const boid1Vel = vectorFactory.create(1, 0);
		vi.spyOn(boid1, 'getBoidVelocity').mockReturnValue(boid1Vel);
		vi.spyOn(boid1, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.boid.maxSpeed);
		vi.spyOn(boid1, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.boid.maxForce);

		const boid2 = createMockBoid(10, 10, BoidVariant.PREY);
		const boid2Vel = vectorFactory.create(0, 1);
		vi.spyOn(boid2, 'getBoidVelocity').mockReturnValue(boid2Vel);
		vi.spyOn(boid2, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.boid.maxSpeed);
		vi.spyOn(boid2, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.boid.maxForce);

		const boid3 = createMockBoid(-10, 10, BoidVariant.PREY);
		const boid3Vel = vectorFactory.create(-1, 0);
		vi.spyOn(boid3, 'getBoidVelocity').mockReturnValue(boid3Vel);
		vi.spyOn(boid3, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.boid.maxSpeed);
		vi.spyOn(boid3, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.boid.maxForce);

		// Mock applyForce method
		vi.spyOn(boid1, 'applyForce');
		vi.spyOn(boid2, 'applyForce');
		vi.spyOn(boid3, 'applyForce');

		// Update flock
		flockLogic.update([boid1, boid2, boid3]);

		// Verify forces were applied to all boids
		expect(boid1.applyForce).toHaveBeenCalled();
		expect(boid2.applyForce).toHaveBeenCalled();
		expect(boid3.applyForce).toHaveBeenCalled();
	});

	test('should handle empty flock', () => {
		// Update with no boids
		flockLogic.update([]);

		// No errors should be thrown
		expect(true).toBe(true);
	});

	test('should not apply flocking forces to single boid', () => {
		// Place boid in center to avoid boundary forces
		const boid = createMockBoid(1500, 1500, BoidVariant.PREY);
		const boidPos = vectorFactory.create(1500, 1500);
		const boidVel = vectorFactory.create(1, 0);
		vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
		vi.spyOn(boid, 'getBoidVelocity').mockReturnValue(boidVel);
		vi.spyOn(boid, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.boid.maxSpeed);
		vi.spyOn(boid, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.boid.maxForce);

		// Calculate forces directly to test flocking behavior
		const force = flockLogic.calculateForces(boid, []);

		// No flocking forces should be applied (no neighbors)
		expect(force.length()).toBe(0);
	});

	test('should apply boundary forces to single boid near boundary', () => {
		// Place boid at left boundary
		const boid = createMockBoid(0, 1500, BoidVariant.PREY);
		const boidPos = vectorFactory.create(0, 1500);
		const boidVel = vectorFactory.create(-1, 0); // Moving toward boundary
		vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
		vi.spyOn(boid, 'getBoidVelocity').mockReturnValue(boidVel);
		vi.spyOn(boid, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.boid.maxSpeed);
		vi.spyOn(boid, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.boid.maxForce);

		// Calculate forces directly
		const force = flockLogic.calculateForces(boid, []);

		// Should have boundary force pushing right
		expect(force.length()).toBeGreaterThan(0);
		expect(force.x).toBeGreaterThan(0);
	});

	test('should respect boid type when calculating forces', () => {
		// Create a prey boid
		const prey = createMockBoid(0, 0, BoidVariant.PREY);
		const preyPos = vectorFactory.create(0, 0);
		const preyVel = vectorFactory.create(1, 0);
		vi.spyOn(prey, 'getBoidPosition').mockReturnValue(preyPos);
		vi.spyOn(prey, 'getBoidVelocity').mockReturnValue(preyVel);
		vi.spyOn(prey, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.boid.maxSpeed);
		vi.spyOn(prey, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.boid.maxForce);

		// Create a predator nearby
		const predator = createMockBoid(10, 0, BoidVariant.PREDATOR);
		const predatorPos = vectorFactory.create(10, 0);
		const predatorVel = vectorFactory.create(0, 1);
		vi.spyOn(predator, 'getBoidPosition').mockReturnValue(predatorPos);
		vi.spyOn(predator, 'getBoidVelocity').mockReturnValue(predatorVel);
		vi.spyOn(predator, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.predator.maxSpeed);
		vi.spyOn(predator, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.predator.maxForce);

		// Calculate forces for prey with predator neighbor
		const force = flockLogic.calculateForces(prey, [predator]);

		// Force should be minimal since predator is ignored for basic flocking
		// But some force is expected due to avoidance behavior
		expect(force.length()).toBeLessThanOrEqual(TEST_DEFAULTS.boid.maxForce * 1.5); // Allow for avoidance force
	});
});
