import type { IGameEventBus } from '$adapters/phaser-events';

/**
 * Test implementation of event bus
 */
export class TestEventBus implements IGameEventBus {
  private handlers = new Map<string, Set<{ handler: (data: unknown) => void; context?: unknown }>>();
  private lastEmittedData = new Map<string, unknown>();

  emit<K extends string>(event: K, data: unknown): boolean {
    const eventHandlers = this.handlers.get(event);
    this.lastEmittedData.set(event, data);
    
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

  on<K extends string>(event: K, handler: (data: unknown) => void, context?: unknown): this {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)?.add({ handler, context });
    return this;
  }

  once<K extends string>(event: K, handler: (data: unknown) => void, context?: unknown): this {
    const onceHandler = (data: unknown) => {
      if (context) {
        handler.call(context, data);
      } else {
        handler(data);
      }
      this.off(event, onceHandler);
    };
    return this.on(event, onceHandler, context);
  }

  off<K extends string>(event: K, handler?: (data: unknown) => void, context?: unknown): this {
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

  removeAllListeners<K extends string>(event?: K): this {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }
    return this;
  }

  subscribe<K extends string>(event: K, handler: (data: unknown) => void, context?: unknown): void {
    this.on(event, handler, context);
  }

  unsubscribe<K extends string>(event: K, handler?: (data: unknown) => void, context?: unknown): void {
    this.off(event, handler, context);
  }

  unsubscribeAll(): void {
    this.removeAllListeners();
  }

  dispatch<K extends string>(event: K, data: unknown): void {
    this.emit(event, data);
  }

  hasListeners(event: string): boolean {
    return (this.handlers.get(event)?.size ?? 0) > 0;
  }

  getLastEmittedData(event: string): unknown {
    return this.lastEmittedData.get(event);
  }

  destroy(): void {
    this.handlers.clear();
    this.lastEmittedData.clear();
  }
}
