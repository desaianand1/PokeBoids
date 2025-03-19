/**
 * Generic event handler type
 */
export type EventHandler<T = unknown> = (data: T) => void;

/**
 * Base event emitter interface for untyped events
 */
export interface IBaseEventEmitter {
  emit(event: string, data?: unknown): boolean;
  on(event: string, handler: EventHandler<unknown>, context?: unknown): this;
  once(event: string, handler: EventHandler<unknown>, context?: unknown): this;
  off(event: string, handler?: EventHandler<unknown>, context?: unknown): this;
  removeAllListeners(event?: string): this;
}

/**
 * Type-safe event emitter interface for typed events
 */
export interface ITypedEventEmitter<T extends Record<string, unknown>> {
  emit<K extends keyof T & string>(event: K, data: T[K]): boolean;
  on<K extends keyof T & string>(event: K, handler: (data: T[K]) => void, context?: unknown): this;
  once<K extends keyof T & string>(event: K, handler: (data: T[K]) => void, context?: unknown): this;
  off<K extends keyof T & string>(event: K, handler?: (data: T[K]) => void, context?: unknown): this;
  removeAllListeners(event?: keyof T & string): this;
}

/**
 * Combined interface that supports both typed and untyped events
 */
export type IEventEmitter = IBaseEventEmitter;

/**
 * Interface for event subscription management
 */
export interface IEventSubscriber<T extends Record<string, unknown>> {
  subscribe<K extends keyof T & string>(event: K, handler: (data: T[K]) => void, context?: unknown): void;
  unsubscribe<K extends keyof T & string>(event: K, handler?: (data: T[K]) => void, context?: unknown): void;
  unsubscribeAll(): void;
}

/**
 * Interface for event dispatch functionality
 */
export interface IEventDispatcher<T extends Record<string, unknown>> {
  dispatch<K extends keyof T & string>(event: K, data: T[K]): void;
  hasListeners(event: string): boolean;
}

/**
 * Combined interface for full event system functionality
 */
export interface IEventSystem<T extends Record<string, unknown>> extends ITypedEventEmitter<T>, IEventSubscriber<T>, IEventDispatcher<T> {
  destroy(): void;
}
