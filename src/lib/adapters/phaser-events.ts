import type { Scene } from 'phaser';
import type { IEventSystem, EventHandler } from '$lib/interfaces/events';
import type { IBoid } from '$lib/interfaces/boid';
import type { BoidConfig, SimulationConfig } from '$config/simulation-signals.svelte';

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
  'boid-damaged': { boid: IBoid; damage: number; remainingHealth: number };
  'boid-leveled-up': { boid: IBoid; level: number };
  'boid-stamina-depleted': { boid: IBoid };
  'boid-stamina-recovered': { boid: IBoid };

  // Flocking behavior events
  'alignment-updated': { boid: IBoid; neighbors: IBoid[]; strength: number };
  'coherence-updated': { boid: IBoid; center: { x: number; y: number }; strength: number };
  'separation-updated': {
    boid: IBoid;
    avoidance: { x: number; y: number };
    strength: number;
    nearbyCount: number;
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
 * Adapter that bridges between Phaser's event system and our typed event system
 */
export class PhaserEventAdapter implements IEventSystem<GameEvents> {
  private handlers: Map<string, Set<EventHandler<unknown>>> = new Map();

  constructor(
    private scene: Scene,
    private eventBus: IGameEventBus
  ) {}

  emit<K extends keyof GameEvents & string>(event: K, data: GameEvents[K]): boolean {
    this.scene.events.emit(event, data);
    return this.eventBus.emit(event, data);
  }

  on<K extends keyof GameEvents & string>(event: K, handler: (data: GameEvents[K]) => void, context?: unknown): this {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)?.add(handler as EventHandler<unknown>);
    this.scene.events.on(event, handler, context);
    return this;
  }

  once<K extends keyof GameEvents & string>(event: K, handler: (data: GameEvents[K]) => void, context?: unknown): this {
    const onceHandler = (data: GameEvents[K]) => {
      handler.call(context, data);
      this.off(event, onceHandler, context);
    };
    return this.on(event, onceHandler, context);
  }

  off<K extends keyof GameEvents & string>(event: K, handler?: (data: GameEvents[K]) => void, context?: unknown): this {
    if (handler) {
      this.handlers.get(event)?.delete(handler as EventHandler<unknown>);
      this.scene.events.off(event, handler, context);
    } else {
      this.handlers.delete(event);
      this.scene.events.off(event);
    }
    return this;
  }

  removeAllListeners<K extends keyof GameEvents & string>(event?: K): this {
    if (event) {
      this.handlers.delete(event);
      this.scene.events.removeAllListeners(event);
    } else {
      this.handlers.clear();
      this.scene.events.removeAllListeners();
    }
    return this;
  }

  subscribe<K extends keyof GameEvents & string>(event: K, handler: (data: GameEvents[K]) => void, context?: unknown): void {
    this.on(event, handler, context);
  }

  unsubscribe<K extends keyof GameEvents & string>(event: K, handler?: (data: GameEvents[K]) => void, context?: unknown): void {
    this.off(event, handler, context);
  }

  unsubscribeAll(): void {
    this.removeAllListeners();
  }

  dispatch<K extends keyof GameEvents & string>(event: K, data: GameEvents[K]): void {
    this.emit(event, data);
  }

  hasListeners(event: string): boolean {
    return (this.handlers.get(event)?.size ?? 0) > 0;
  }

  destroy(): void {
    this.unsubscribeAll();
  }
}
