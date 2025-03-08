import { Events } from 'phaser';
import type { Boid } from '$lib/boid';
import type { BoidConfig, SimulationConfig } from '$config/index.svelte';

/**
 * Core event types for Phaser-Svelte communication
 */
export interface EventMap {
	// Scene lifecycle events
	'scene-ready': { scene: Phaser.Scene };
	'scene-paused': { scene: Phaser.Scene };
	'scene-resumed': { scene: Phaser.Scene };

	// Game state events
	'game-started': void;
	'game-paused': void;
	'game-resumed': void;
	'game-reset': void;

	// Boid simulation events
	'boid-added': { boid: Boid };
	'boid-removed': { boid: Boid };
	'flock-updated': { count: number };
	'predator-count-updated': { count: number };
	'prey-count-updated': { count: number };

	// Core flocking behavior events
	'alignment-updated': { boid: Boid; neighbors: Boid[]; strength: number };
	'coherence-updated': { boid: Boid; center: Phaser.Math.Vector2; strength: number };
	'separation-updated': {
		boid: Boid;
		avoidance: Phaser.Math.Vector2;
		strength: number;
		nearbyCount: number;
	};

	// Boundary handling events
	'boundary-approached': {
		boid: Boid;
		boundary: 'left' | 'right' | 'top' | 'bottom';
		distance: number;
		force: number;
	};
	'boundary-collision': { boid: Boid; boundary: 'left' | 'right' | 'top' | 'bottom' };

	// Obstacle events
	'obstacle-added': { obstacle: Phaser.GameObjects.GameObject };
	'obstacle-removed': { obstacle: Phaser.GameObjects.GameObject };
	'obstacle-approached': {
		boid: Boid;
		obstacle: Phaser.GameObjects.GameObject;
		distance: number;
		force: number;
	};

	// UI events
	'simulation-started': void;
	'simulation-paused': void;
	'simulation-reset': void;
	'simulation-speed-changed': { value: number };

	// Boid UI events
	'boid-leveled-up': {
		boid: Boid;
		level: number;
	};
	'boid-damaged': {
		boid: Boid;
		amount: number;
		remainingHealth: number;
	};
	'boid-stamina-recovered': { boid: Boid };
	'boid-stamina-depleted': { boid: Boid };
	'boid-reproduced': {
		parent1: Boid;
		parent2: Boid;
		offspring: Boid;
	};

	// Configuration events - individual parameters
	'alignment-weight-changed': { value: number };
	'cohesion-weight-changed': { value: number };
	'separation-weight-changed': { value: number };
	'perception-radius-changed': { value: number };
	'separation-radius-changed': { value: number };
	'boundary-margin-changed': { value: number };
	'boundary-force-changed': { value: number };
	'boundary-force-ramp-changed': { value: number };
	'obstacle-perception-radius-changed': { value: number };
	'obstacle-force-changed': { value: number };
	'max-speed-changed': { value: number };
	'max-force-changed': { value: number };
	'initial-prey-count-changed': { value: number };
	'initial-predator-count-changed': { value: number };
	'obstacle-count-changed': { value: number };
	'track-stats-changed': { value: boolean };

	// Configuration events - composite
	'boid-config-changed': { config: BoidConfig };
	'simulation-config-changed': { config: SimulationConfig };

	// Debug events
	'debug-toggle': { enabled: boolean };
	'debug-visuals-toggle': { enabled: boolean };
}

/**
 * Type-safe event bus for Phaser-Svelte communication
 */
class TypedEventBus extends Events.EventEmitter {
	emit<T extends keyof EventMap>(event: T, data?: EventMap[T]): boolean {
		return super.emit(event, data);
	}

	on<T extends keyof EventMap>(
		event: T,
		callback: (data: EventMap[T]) => void,
		context?: unknown
	): this {
		return super.on(event, callback, context);
	}

	once<T extends keyof EventMap>(
		event: T,
		callback: (data: EventMap[T]) => void,
		context?: unknown
	): this {
		return super.once(event, callback, context);
	}

	off<T extends keyof EventMap>(
		event: T,
		callback?: (data: EventMap[T]) => void,
		context?: unknown
	): this {
		return super.off(event, callback, context);
	}

	removeAllListeners<T extends keyof EventMap>(event?: T): this {
		return super.removeAllListeners(event);
	}
}

/**
 * Global event bus instance for Phaser-Svelte communication
 *
 * Usage:
 *
 * // Emitting events
 * EventBus.emit('scene-ready', { scene: currentScene });
 *
 * // Listening to events
 * EventBus.on('boid-added', ({ boid }) => {
 *   // Handle new boid
 * });
 *
 * // Core flocking behavior example:
 * EventBus.on('alignment-updated', ({ boid, neighbors, strength }) => {
 *   // Update boid alignment based on neighbors and strength
 * });
 *
 * // Boundary handling example:
 * EventBus.on('boundary-approached', ({ boid, boundary, distance, force }) => {
 *   // Adjust boid steering to avoid boundary
 * });
 */
export const EventBus = new TypedEventBus();
