import { PhaserVectorFactory } from '$adapters/phaser-vector';
import { PhaserEventAdapter, type IGameEventBus } from '$adapters/phaser-events';
import {
	PhaserRandomGenerator,
	PhaserPhysics,
	PhaserTimeProvider,
	PhaserDebugRenderer
} from '$lib/adapters/phaser-system';
import type { AllDependencies } from '$lib/interfaces';

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
	const eventBus: IGameEventBus = {
		emit: (event, data) => {
			scene.events.emit(event, data);
			return true;
		},
		on: (event, handler, context) => {
			scene.events.on(event, handler, context);
			return eventBus;
		},
		once: (event, handler, context) => {
			scene.events.once(event, handler, context);
			return eventBus;
		},
		off: (event, handler, context) => {
			scene.events.off(event, handler, context);
			return eventBus;
		},
		removeAllListeners: (event) => {
			scene.events.removeAllListeners(event);
			return eventBus;
		},
		subscribe: (event, handler, context) => {
			scene.events.on(event, handler, context);
		},
		unsubscribe: (event, handler, context) => {
			scene.events.off(event, handler, context);
		},
		unsubscribeAll: () => {
			scene.events.removeAllListeners();
		},
		dispatch: (event, data) => {
			scene.events.emit(event, data);
		},
		hasListeners: (event) => {
			return scene.events.listenerCount(event) > 0;
		}
	};

	return {
		time: new PhaserTimeProvider(scene),
		debug: new PhaserDebugRenderer(scene),
		eventEmitter: new PhaserEventAdapter(scene, eventBus),
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
