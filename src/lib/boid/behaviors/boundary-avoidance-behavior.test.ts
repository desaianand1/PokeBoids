import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BoundaryAvoidanceBehavior } from '$boid/behaviors/boundary-avoidance-behavior';
import { TestVectorFactory } from '$tests/implementations/vector';
import { TestEventBus } from '$tests/implementations/events';
import { BoidVariant } from '$boid/types';
import { createMockBoid } from '$tests/utils/mock-boid';
import { TEST_BOID_CONFIG, TEST_DEFAULTS } from '$tests/utils/constants';

describe('BoundaryAvoidanceBehavior', () => {
	let vectorFactory: TestVectorFactory;
	let eventBus: TestEventBus;
	let behavior: BoundaryAvoidanceBehavior;

	beforeEach(() => {
		vectorFactory = new TestVectorFactory();
		eventBus = new TestEventBus();

		behavior = new BoundaryAvoidanceBehavior(
			vectorFactory,
			TEST_BOID_CONFIG.boundaryForceMultiplier.default,
			TEST_BOID_CONFIG.boundaryForceRamp.default,
			TEST_BOID_CONFIG.boundaryMargin.default,
			'collidable',
			3000,
			eventBus
		);
	});

	test('should apply force when boid approaches boundary', () => {
		const boid = createMockBoid(10, 10, BoidVariant.PREY);
		const boidPos = vectorFactory.create(10, 10); // Near top-left corner
		const boidVel = vectorFactory.create(1, 1); // Moving toward corner
		vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
		vi.spyOn(boid, 'getBoidVelocity').mockReturnValue(boidVel);
		vi.spyOn(boid, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.boid.maxSpeed);
		vi.spyOn(boid, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.boid.maxForce);

		const force = behavior.calculate(boid, [], eventBus);

		// Should have non-zero force
		expect(force.length()).toBeGreaterThan(0);
		// Force should point away from corner (positive x and y components)
		expect(force.x).toBeGreaterThan(0);
		expect(force.y).toBeGreaterThan(0);
	});

	test('should not apply force when boid is far from boundaries', () => {
		const boid = createMockBoid(1500, 1500, BoidVariant.PREY); // Center of world
		const boidPos = vectorFactory.create(1500, 1500);
		const boidVel = vectorFactory.create(1, 0);
		vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
		vi.spyOn(boid, 'getBoidVelocity').mockReturnValue(boidVel);
		vi.spyOn(boid, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.boid.maxSpeed);
		vi.spyOn(boid, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.boid.maxForce);

		const force = behavior.calculate(boid, [], eventBus);

		// Should have zero force
		expect(force.length()).toBe(0);
	});

	test('should emit collision event when boid hits boundary', () => {
		const boid = createMockBoid(0, 100, BoidVariant.PREY); // At left boundary
		const boidPos = vectorFactory.create(0, 100);
		const boidVel = vectorFactory.create(-1, 0); // Moving left
		vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
		vi.spyOn(boid, 'getBoidVelocity').mockReturnValue(boidVel);
		vi.spyOn(boid, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.boid.maxSpeed);
		vi.spyOn(boid, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.boid.maxForce);
		vi.spyOn(eventBus, 'emit');

		behavior.calculate(boid, [], eventBus);

		// Should emit collision event
		expect(eventBus.emit).toHaveBeenCalledWith('boundary-collision', {
			boid,
			boundary: 'left'
		});
	});

	test('should apply appropriate forces in corners', () => {
		const boid = createMockBoid(0, 0, BoidVariant.PREY); // At top-left corner
		const boidPos = vectorFactory.create(0, 0);
		const boidVel = vectorFactory.create(-1, -1); // Moving toward corner
		vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
		vi.spyOn(boid, 'getBoidVelocity').mockReturnValue(boidVel);
		vi.spyOn(boid, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.boid.maxSpeed);
		vi.spyOn(boid, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.boid.maxForce);

		const cornerForce = behavior.calculate(boid, [], eventBus);

		// Corner force should push away from both boundaries
		expect(cornerForce.x).toBeGreaterThan(0); // Push right from left boundary
		expect(cornerForce.y).toBeGreaterThan(0); // Push down from top boundary

		// Move boid to just the left boundary
		const boidPosLeft = vectorFactory.create(0, 100);
		vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPosLeft);
		const boundaryForce = behavior.calculate(boid, [], eventBus);

		// Single boundary force should primarily affect x-axis
		expect(boundaryForce.x).toBeGreaterThan(0); // Push right from left boundary
		expect(Math.abs(boundaryForce.x)).toBeGreaterThan(Math.abs(boundaryForce.y)); // Stronger x than y component
	});

	test('should update world bounds through events', () => {
		const newWidth = 2000;
		const newHeight = 1500;

		// Emit world bounds event
		eventBus.emit('world-bounds-changed', { width: newWidth, height: newHeight });

		// Test boid at new boundary
		const boid = createMockBoid(newWidth, 100, BoidVariant.PREY);
		const boidPos = vectorFactory.create(newWidth, 100);
		const boidVel = vectorFactory.create(1, 0); // Moving right
		vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
		vi.spyOn(boid, 'getBoidVelocity').mockReturnValue(boidVel);
		vi.spyOn(boid, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.boid.maxSpeed);
		vi.spyOn(boid, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.boid.maxForce);
		vi.spyOn(eventBus, 'emit');

		behavior.calculate(boid, [], eventBus);

		// Should emit collision event at new boundary
		expect(eventBus.emit).toHaveBeenCalledWith('boundary-collision', {
			boid,
			boundary: 'right'
		});
	});
});
