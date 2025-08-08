import type { IBoid } from '$interfaces/boid';
import type { BoidVariant, BoidStats } from '$boid/types';
import type { IVector2 } from '$interfaces/vector';
import { TestVectorFactory } from '$tests/implementations/vector';
import { TEST_BOID_CONFIG, TEST_PREDATOR_CONFIG, TEST_BOID_STATS } from '$tests/utils/constants';
import { vi } from 'vitest';
import { generatePrefixedId } from '$utils/uuid';

/**
 * Creates a mock boid for testing
 */
export function createMockBoid(x: number, y: number, variant: BoidVariant): IBoid {
	const vectorFactory = new TestVectorFactory();
	const position = vectorFactory.create(x, y);
	const velocity = vectorFactory
		.create(Math.random() * 2 - 1, Math.random() * 2 - 1)
		.normalize()
		.scale(
			variant === 'predator'
				? TEST_PREDATOR_CONFIG.maxSpeed.default
				: TEST_BOID_CONFIG.maxSpeed.default
		);

	return {
		getId: vi.fn().mockReturnValue(generatePrefixedId('mock-boid')),
		getVariant: vi.fn().mockReturnValue(variant),
		getGroupId: vi.fn().mockReturnValue(generatePrefixedId(`mock-group-${variant}`)),

		getBoidPosition: vi.fn().mockReturnValue(position),
		setBoidPosition: vi.fn().mockImplementation((pos: IVector2) => {
			position.copy(pos);
		}),

		getBoidVelocity: vi.fn().mockReturnValue(velocity),
		setBoidVelocity: vi.fn().mockImplementation((vel: IVector2) => {
			velocity.copy(vel);
		}),

		applyForce: vi.fn(),

		getMaxSpeed: vi
			.fn()
			.mockReturnValue(
				variant === 'predator' ? TEST_PREDATOR_CONFIG.maxSpeed : TEST_BOID_CONFIG.maxSpeed
			),
		setMaxSpeed: vi.fn(),

		getMaxForce: vi
			.fn()
			.mockReturnValue(
				variant === 'predator' ? TEST_PREDATOR_CONFIG.maxForce : TEST_BOID_CONFIG.maxForce
			),
		setMaxForce: vi.fn(),

		getPerceptionRadius: vi
			.fn()
			.mockReturnValue(
				variant === 'predator'
					? TEST_PREDATOR_CONFIG.perceptionRadius
					: TEST_BOID_CONFIG.perceptionRadius
			),
		setPerceptionRadius: vi.fn(),

		getFieldOfViewAngle: vi.fn().mockReturnValue(Math.PI / 3),
		isInFieldOfView: vi.fn().mockReturnValue(true),
		showCollisionEffect: vi.fn(),

		getStats: vi.fn().mockReturnValue({
			...TEST_BOID_STATS,
			speed:
				variant === 'predator'
					? TEST_PREDATOR_CONFIG.maxSpeed.default
					: TEST_BOID_CONFIG.maxSpeed.default,
			sex: Math.random() > 0.5 ? 'male' : 'female',
			...(variant === 'predator' ? { attack: TEST_PREDATOR_CONFIG.attack.default } : {})
		} as BoidStats),

		takeDamage: vi.fn().mockReturnValue(false),
		increaseReproduction: vi.fn().mockReturnValue(false),
		levelUp: vi.fn(),

		update: vi.fn(),
		destroy: vi.fn()
	};
}
