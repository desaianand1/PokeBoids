import type { IEventSystem, EventHandler } from '$interfaces/events';
import type { GameEvents } from '$adapters/phaser-events';
import type { Scene } from 'phaser';

/**
 * Centralized event bus implementation for game-wide events.
 * This is the single source of truth for all events in the application,
 * handling both application-level events and Phaser scene events.
 */
class GameEventBus implements IEventSystem<GameEvents> {
  private handlers: Map<string, Set<EventHandler<unknown>>> = new Map();
  private wildcardHandlers: Set<(type: string, data: unknown) => void> = new Set();
  private connectedScenes: Set<Scene> = new Set();
  private debugEnabled = false;

  /**
   * Connect a Phaser scene to the event bus.
   * This allows the event bus to bridge between Phaser's event system and the application.
   */
  connectScene(scene: Scene): void {
    if (this.connectedScenes.has(scene)) return;

    // Add scene to connected scenes
    this.connectedScenes.add(scene);

    // Forward all scene events to the event bus
    scene.events.on('*', (event: string, data: unknown) => {
      if (this.debugEnabled) {
       // console.debug(`[EventBus] Scene event received: ${event}`, data);
      }
      this.emit(event as keyof GameEvents & string, data as GameEvents[keyof GameEvents]);
    });

    // Clean up when scene is destroyed
    scene.events.once('destroy', () => {
      this.disconnectScene(scene);
    });

    if (this.debugEnabled) {
      console.debug(`[EventBus] Connected scene: ${scene.scene.key}`);
    }
  }

  /**
   * Disconnect a Phaser scene from the event bus.
   */
  disconnectScene(scene: Scene): void {
    if (!this.connectedScenes.has(scene)) return;

    // Remove scene from connected scenes
    this.connectedScenes.delete(scene);
    
    // Clean up event listeners
    scene.events.removeAllListeners();

    if (this.debugEnabled) {
      console.debug(`[EventBus] Disconnected scene: ${scene.scene.key}`);
    }
  }

  /**
   * Enable or disable debug logging
   */
  setDebug(enabled: boolean): void {
    this.debugEnabled = enabled;
  }

  /**
   * Emit an event to all registered handlers and connected Phaser scenes
   */
  emit<K extends keyof GameEvents & string>(event: K, data: GameEvents[K]): boolean {
    if (this.debugEnabled) {
      //console.debug(`[EventBus] Emitting event: ${event}`, data);
    }

    let handled = false;

    // Notify all registered handlers
    const handlers = this.handlers.get(event);
    if (handlers && handlers.size > 0) {
      handlers.forEach(handler => handler(data));
      handled = true;
    }

    // Notify wildcard handlers
    if (this.wildcardHandlers.size > 0) {
      this.wildcardHandlers.forEach(handler => handler(event, data));
      handled = true;
    }

    // Forward event to all connected Phaser scenes
    if (this.connectedScenes.size > 0) {
      this.connectedScenes.forEach(scene => {
        scene.events.emit(event, data);
      });
      handled = true;
    }

    return handled;
  }

  /**
   * Subscribe to all events
   * @param handler Handler that receives event type and data
   */
  onAny(handler: (type: string, data: unknown) => void): void {
    this.wildcardHandlers.add(handler);
  }

  /**
   * Unsubscribe from all events
   * @param handler Handler to remove
   */
  offAny(handler: (type: string, data: unknown) => void): void {
    this.wildcardHandlers.delete(handler);
  }

  on<K extends keyof GameEvents & string>(
    event: K,
    handler: (data: GameEvents[K]) => void,
    context?: unknown
  ): this {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    
    const boundHandler = context ? handler.bind(context) : handler;
    this.handlers.get(event)?.add(boundHandler as EventHandler<unknown>);
    return this;
  }

  once<K extends keyof GameEvents & string>(
    event: K,
    handler: (data: GameEvents[K]) => void,
    context?: unknown
  ): this {
    const onceHandler = (data: GameEvents[K]) => {
      handler.call(context, data);
      this.off(event, onceHandler, context);
    };
    return this.on(event, onceHandler, context);
  }

  off<K extends keyof GameEvents & string>(
    event: K,
    handler?: (data: GameEvents[K]) => void,
    context?: unknown
  ): this {
    if (!handler) {
      this.handlers.delete(event);
    } else {
      const handlers = this.handlers.get(event);
      if (handlers) {
        const boundHandler = context ? handler.bind(context) : handler;
        handlers.delete(boundHandler as EventHandler<unknown>);
        if (handlers.size === 0) {
          this.handlers.delete(event);
        }
      }
    }
    return this;
  }

  removeAllListeners(event?: keyof GameEvents & string): this {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }
    return this;
  }

  subscribe<K extends keyof GameEvents & string>(
    event: K,
    handler: (data: GameEvents[K]) => void,
    context?: unknown
  ): void {
    this.on(event, handler, context);
  }

  unsubscribe<K extends keyof GameEvents & string>(
    event: K,
    handler?: (data: GameEvents[K]) => void,
    context?: unknown
  ): void {
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
    this.handlers.clear();
    this.wildcardHandlers.clear();
    this.connectedScenes.clear();
  }
}

// Export a singleton instance
export const EventBus = new GameEventBus();
