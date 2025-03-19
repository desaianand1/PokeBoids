import type { Scene } from 'phaser';
import type { IEventSystem } from '$interfaces/events';
import type { IBoid } from '$interfaces/boid';
import type { BoidConfig, SimulationConfig } from '$config/simulation-signals.svelte';
import type { BoidStats, BoidVariant } from '$boid/types';

/**
 * Type-safe event definitions for Svelte-Phaser communication
 */
export type GameEvents = {
  // Scene lifecycle
  'scene-ready': { scene: Scene };
  'game-started': void;
  'game-reset': void;

  // Boid events
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

  // Flocking behavior events
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

  // Flock events
  'flock-updated': { count: number };
  'predator-count-updated': { count: number };
  'prey-count-updated': { count: number };

  // Simulation state
  'simulation-resumed': void;
  'simulation-paused': void;
  'simulation-reset': void;
  'simulation-speed-changed': { value: number };

  // Configuration - Boid
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
  'boid-config-changed': { config: BoidConfig };

  // Configuration - Simulation
  'initial-prey-count-changed': { value: number };
  'initial-predator-count-changed': { value: number };
  'obstacle-count-changed': { value: number };
  'track-stats-changed': { value: boolean };
  'simulation-config-changed': { config: SimulationConfig };

  // Debug
  'debug-toggle': { enabled: boolean };

  // Collision events
  'boundary-collision': { boid: IBoid; boundary: 'left' | 'right' | 'top' | 'bottom' };

  // Index signature to satisfy Record<string, unknown>
  [key: string]: unknown;
};

/**
 * Type for event bus that can emit GameEvents
 */
export interface IGameEventBus extends IEventSystem<GameEvents> {
  emit: <K extends keyof GameEvents & string>(event: K, data: GameEvents[K]) => boolean;
}

/**
 * Adapter that provides a thin bridge between Phaser's event system and our centralized event bus.
 * This adapter is primarily responsible for ensuring type safety and proper event forwarding.
 */
export class PhaserEventAdapter implements IEventSystem<GameEvents> {
  constructor(
    private scene: Scene,
    private eventBus: IGameEventBus
  ) {}

  emit<K extends keyof GameEvents & string>(event: K, data: GameEvents[K]): boolean {
    return this.eventBus.emit(event, data);
  }

  on<K extends keyof GameEvents & string>(event: K, handler: (data: GameEvents[K]) => void, context?: unknown): this {
    this.eventBus.on(event, handler, context);
    return this;
  }

  once<K extends keyof GameEvents & string>(event: K, handler: (data: GameEvents[K]) => void, context?: unknown): this {
    this.eventBus.once(event, handler, context);
    return this;
  }

  off<K extends keyof GameEvents & string>(event: K, handler?: (data: GameEvents[K]) => void, context?: unknown): this {
    this.eventBus.off(event, handler, context);
    return this;
  }

  removeAllListeners<K extends keyof GameEvents & string>(event?: K): this {
    this.eventBus.removeAllListeners(event);
    return this;
  }

  subscribe<K extends keyof GameEvents & string>(event: K, handler: (data: GameEvents[K]) => void, context?: unknown): void {
    this.eventBus.subscribe(event, handler, context);
  }

  unsubscribe<K extends keyof GameEvents & string>(event: K, handler?: (data: GameEvents[K]) => void, context?: unknown): void {
    this.eventBus.unsubscribe(event, handler, context);
  }

  unsubscribeAll(): void {
    this.eventBus.unsubscribeAll();
  }

  dispatch<K extends keyof GameEvents & string>(event: K, data: GameEvents[K]): void {
    this.eventBus.dispatch(event, data);
  }

  hasListeners(event: string): boolean {
    return this.eventBus.hasListeners(event);
  }

  destroy(): void {
    this.unsubscribeAll();
  }
}
