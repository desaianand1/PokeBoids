import type { Scene } from 'phaser';
import type { IBoid } from '$interfaces/boid';
import type { BoidConfig, BoundaryMode, SimulationConfig } from '$config/types';
import type { BoidStats, BoidVariant } from '$boid/types';
import type { IEventSystem } from '$interfaces/events';

/**
 * Scene lifecycle events
 */
export type SceneEvents = {
	'scene-ready': { scene: Scene };
	'game-started': void;
	'game-reset': void;
	'world-bounds-initialized': { width: number; height: number };
	'world-bounds-changed': { width: number; height: number };
};
/** Boid lifecycle events */
export type BoidEvents = {
	'boid-added': { boid: IBoid };
	'boid-removed': { boid: IBoid };
	'boid-damaged': {
		boid: IBoid;
		damage: number;
		remainingHealth: number;
		debug?: {
			position: { x: number; y: number };
			velocity: { x: number; y: number };
			stats: BoidStats;
		};
	};
	'boid-leveled-up': {
		boid: IBoid;
		level: number;
		debug?: {
			position: { x: number; y: number };
			stats: BoidStats;
			variant: BoidVariant;
		};
	};
	'boid-stamina-depleted': {
		boid: IBoid;
		debug?: {
			position: { x: number; y: number };
			velocity: { x: number; y: number };
			stats: BoidStats;
		};
	};
	'boid-stamina-recovered': {
		boid: IBoid;
		debug?: {
			position: { x: number; y: number };
			velocity: { x: number; y: number };
			stats: BoidStats;
		};
	};
	'boundary-collision': { boid: IBoid; boundary: 'left' | 'right' | 'top' | 'bottom' };
	'boundary-wrapped': { boid: IBoid; position: { x: number; y: number } };
	'boid-unstuck': {
		boid: IBoid;
		boundary: 'left' | 'right' | 'top' | 'bottom';
		stuckDuration: number;
	};
};
/** Simulation state events */
export type SimulationEvents = {
	'simulation-resumed': void;
	'simulation-paused': void;
	'simulation-reset': void;
	'simulation-speed-changed': { value: number };
};
/** Flocking & Flock behavior events */
export type FlockingEvents = {
	'alignment-updated': {
		boid: IBoid;
		neighbors: IBoid[];
		strength: number;
		debug?: {
			position: { x: number; y: number };
			velocity: { x: number; y: number };
			averageVelocity: { x: number; y: number };
			neighborCount: number;
			force: { x: number; y: number };
		};
	};
	'coherence-updated': {
		boid: IBoid;
		center: { x: number; y: number };
		strength: number;
		debug?: {
			position: { x: number; y: number };
			velocity: { x: number; y: number };
			centerOfMass: { x: number; y: number };
			neighborCount: number;
			force: { x: number; y: number };
		};
	};
	'separation-updated': {
		boid: IBoid;
		avoidance: { x: number; y: number };
		strength: number;
		nearbyCount: number;
		debug?: {
			position: { x: number; y: number };
			velocity: { x: number; y: number };
			nearestNeighborDistance: number;
			force: { x: number; y: number };
		};
	};

	'flock-updated': { count: number };
	'predator-count-updated': { count: number };
	'prey-count-updated': { count: number };
};
/** Configuration events for Boids and the Simulation itself */
export type ConfigEvents = {
	// Configuration - Boid
	'alignment-weight-changed': { value: number };
	'cohesion-weight-changed': { value: number };
	'separation-weight-changed': { value: number };
	'perception-radius-changed': { value: number };
	'separation-radius-changed': { value: number };
	'field-of-view-angle-changed': { value: number };
	'predator-fov-multiplier-changed': { value: number };
	'prey-fov-multiplier-changed': { value: number };
	'predator-perception-multiplier-changed': { value: number };
	'prey-perception-multiplier-changed': { value: number };
	'boundary-margin-changed': { value: number };
	'boundary-force-changed': { value: number };
	'boundary-force-ramp-changed': { value: number };
	'obstacle-perception-radius-changed': { value: number };
	'obstacle-force-changed': { value: number };
	'max-speed-changed': { value: number };
	'max-force-changed': { value: number };
	'boid-config-changed': { config: BoidConfig };

	// Configuration - Simulation
	'initial-prey-count-changed': { value: number };
	'initial-predator-count-changed': { value: number };
	'obstacle-count-changed': { value: number };
	'track-stats-changed': { value: boolean };
	'simulation-config-changed': { config: SimulationConfig };
	'boundary-mode-changed': { value: BoundaryMode };
	'boundary-stuck-threshold-changed': { value: number };
};
/** Debug events for developer UX */
export type DebugEvents = {
	'debug-toggle': { enabled: boolean };
};

/**
 * Type-safe event definitions for Svelte-Phaser communication
 */
export type GameEvents = SceneEvents &
	BoidEvents &
	SimulationEvents &
	FlockingEvents &
	ConfigEvents &
	DebugEvents & { [key: string]: unknown };

/**
 * Type for event bus that can emit GameEvents
 */
export interface IGameEventBus extends IEventSystem<GameEvents> {
	emit: <K extends keyof GameEvents & string>(event: K, data: GameEvents[K]) => boolean;
}
