import type { IGameEventBus, GameEvents } from '$events/types';

/**
 * Test implementation of event bus
 */
export class TestEventBus implements IGameEventBus {
  private handlers = new Map<keyof GameEvents, Set<{ handler: (data: GameEvents[keyof GameEvents]) => void; context?: unknown }>>();
  private lastEmittedData = new Map<keyof GameEvents, GameEvents[keyof GameEvents]>();

  emit<K extends keyof GameEvents>(event: K, data: GameEvents[K]): boolean {
    const eventHandlers = this.handlers.get(event);
    this.lastEmittedData.set(event as keyof GameEvents, data);
    
    if (!eventHandlers || eventHandlers.size === 0) {
      return false;
    }

    eventHandlers.forEach(({ handler, context }) => {
      if (context) {
        handler.call(context, data);
      } else {
        handler(data);
      }
    });
    return true;
  }

  on<K extends keyof GameEvents>(event: K, handler: (data: GameEvents[K]) => void, context?: unknown): this {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)?.add({ handler, context });
    return this;
  }

  once<K extends keyof GameEvents>(event: K, handler: (data: GameEvents[K]) => void, context?: unknown): this {
    const onceHandler = (data: GameEvents[K]) => {
      if (context) {
        handler.call(context, data);
      } else {
        handler(data);
      }
      this.off(event, onceHandler);
    };
    return this.on(event, onceHandler, context);
  }

  off<K extends keyof GameEvents>(event: K, handler?: (data: GameEvents[K]) => void, context?: unknown): this {
    if (handler) {
      const handlers = this.handlers.get(event);
      if (handlers) {
        for (const entry of handlers) {
          if (entry.handler === handler && entry.context === context) {
            handlers.delete(entry);
            break;
          }
        }
      }
    } else {
      this.handlers.delete(event);
    }
    return this;
  }

  removeAllListeners<K extends keyof GameEvents>(event?: K): this {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }
    return this;
  }

  subscribe<K extends keyof GameEvents>(event: K, handler: (data: GameEvents[K]) => void, context?: unknown): void {
    this.on(event, handler, context);
  }

  unsubscribe<K extends keyof GameEvents>(event: K, handler?: (data: GameEvents[K]) => void, context?: unknown): void {
    this.off(event, handler, context);
  }

  unsubscribeAll(): void {
    this.removeAllListeners();
  }

  dispatch<K extends keyof GameEvents>(event: K, data: GameEvents[K]): void {
    this.emit(event, data);
  }

  hasListeners(event: keyof GameEvents): boolean {
    return (this.handlers.get(event)?.size ?? 0) > 0;
  }

  getLastEmittedData<K extends keyof GameEvents>(event: K): GameEvents[K] | undefined {
    return this.lastEmittedData.get(event) as GameEvents[K] | undefined;
  }

  destroy(): void {
    this.handlers.clear();
    this.lastEmittedData.clear();
  }
}
