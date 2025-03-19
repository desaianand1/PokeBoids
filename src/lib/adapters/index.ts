import { PhaserVectorFactory } from '$adapters/phaser-vector';
import { PhaserEventAdapter } from '$adapters/phaser-events';
import {
	PhaserRandomGenerator,
	PhaserPhysics,
	PhaserTimeProvider,
	PhaserDebugRenderer
} from '$lib/adapters/phaser-system';
import type { AllDependencies } from '$lib/interfaces';
import { EventBus } from '$events/event-bus';

/**
 * Create default Phaser-based dependencies
 * Note: Scene-specific dependencies (time, debug) must be added separately
 */
export const defaultPhaserDependencies: Partial<AllDependencies> = {
	vectorFactory: new PhaserVectorFactory(),
	random: new PhaserRandomGenerator()
};

/**
 * Create scene-specific dependencies
 * @param scene Phaser scene to create dependencies for
 * @returns Scene-specific dependencies
 */
export function createSceneDependencies(scene: Phaser.Scene): Partial<AllDependencies> {
	// Connect the scene to the centralized event bus
	EventBus.connectScene(scene);

	return {
		time: new PhaserTimeProvider(scene),
		debug: new PhaserDebugRenderer(scene),
		eventEmitter: new PhaserEventAdapter(scene, EventBus),
		physics: new PhaserPhysics(scene)
	};
}

/**
 * Helper function to create complete dependencies for a scene
 * @param scene Phaser scene to create dependencies for
 * @returns Complete dependencies including both default and scene-specific
 */
export function createCompleteDependencies(scene: Phaser.Scene): AllDependencies {
	return {
		...defaultPhaserDependencies,
		...createSceneDependencies(scene)
	} as AllDependencies;
}

// Re-export all adapters
export * from '$lib/adapters/phaser-vector';
export * from '$lib/adapters/phaser-events';
export * from '$lib/adapters/phaser-system';
