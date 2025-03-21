import type { Scene } from 'phaser';
import type { IEventSystem } from '$interfaces/events';
import type { GameEvents, IGameEventBus } from '$events/types';

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
