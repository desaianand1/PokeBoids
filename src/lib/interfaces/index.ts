import type { IVector2, IVectorFactory } from '$interfaces/vector';
import type {
	IEventEmitter,
	IEventSubscriber,
	IEventDispatcher,
	IEventSystem,
	EventHandler
} from '$interfaces/events';
import type { IRandomGenerator, ITimeProvider, IPhysics, IDebugRenderer } from '$interfaces/system';
import type { IGameEventBus } from '$events/types';

// Re-export all interfaces
export type {
	// Vector interfaces
	IVector2,
	IVectorFactory,

	// Event interfaces
	IEventEmitter,
	IEventSubscriber,
	IEventDispatcher,
	IEventSystem,
	EventHandler,

	// System interfaces
	IRandomGenerator,
	ITimeProvider,
	IPhysics,
	IDebugRenderer
};

// Core dependencies interface
export interface CoreDependencies {
	vectorFactory: IVectorFactory;
	eventEmitter: IGameEventBus;
	random: IRandomGenerator;
	time: ITimeProvider;
	physics: IPhysics;
}

// Render dependencies interface
export interface RenderDependencies {
	debug: IDebugRenderer;
}

// Combined dependencies interface
export interface AllDependencies extends CoreDependencies, RenderDependencies {}

// Default implementations (to be provided by adapters)
export const defaultDependencies: Partial<AllDependencies> = {};

/**
 * Helper function to create dependencies with defaults
 * @param dependencies Partial dependencies to merge with defaults
 * @returns Complete dependencies object
 */
export function createDependencies(
	dependencies: Partial<AllDependencies>
): Partial<AllDependencies> {
	return { ...defaultDependencies, ...dependencies };
}

/**
 * Type guard to check if dependencies are complete
 * @param dependencies Dependencies to check
 * @returns True if all required dependencies are present
 */
export function hasRequiredDependencies(
	dependencies: Partial<AllDependencies>
): dependencies is AllDependencies {
	const required: (keyof CoreDependencies)[] = [
		'vectorFactory',
		'eventEmitter',
		'random',
		'time',
		'physics'
	];

	return required.every((key) => dependencies[key] !== undefined);
}
