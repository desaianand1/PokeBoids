import { describe, test, expect, beforeEach } from 'vitest';
import { TestEventBus } from '$tests/implementations/events';

describe('TestEventBus', () => {
  let eventBus: TestEventBus;

  beforeEach(() => {
    eventBus = new TestEventBus();
  });

  test('should emit and receive events', () => {
    let receivedData: unknown;
    eventBus.on('simulation-speed-changed', data => {
      receivedData = data;
    });

    const testData = { value: 42 };
    eventBus.emit('simulation-speed-changed', testData);

    expect(receivedData).toEqual(testData);
  });

  test('should handle once listeners', () => {
    let callCount = 0;
    eventBus.once('boid-removed', () => {
      callCount++;
    });

    eventBus.emit('boid-removed', undefined);
    eventBus.emit('boid-removed', undefined);

    expect(callCount).toBe(1);
  });

  test('should remove specific listeners', () => {
    let callCount = 0;
    const handler = () => {
      callCount++;
    };

    eventBus.on('game-started', handler);
    eventBus.emit('game-started', undefined);
    eventBus.off('game-started', handler);
    eventBus.emit('game-started', undefined);

    expect(callCount).toBe(1);
  });

  test('should remove all listeners', () => {
    let callCount = 0;
    const handler = () => {
      callCount++;
    };

    eventBus.on('game-reset', handler);
    eventBus.removeAllListeners();
    eventBus.emit('game-reset', undefined);

    expect(callCount).toBe(0);
  });

  test('should handle context binding', () => {
    const context = { value: 0 };
    const handler = function(this: typeof context) {
      this.value++;
    };

    eventBus.on('simulation-resumed', handler, context);
    eventBus.emit('simulation-resumed', undefined);

    expect(context.value).toBe(1);
  });

  test('should track last emitted data', () => {
    const testData = { value: 42 };
    eventBus.emit('simulation-speed-changed', testData);

    const lastData = eventBus.getLastEmittedData('simulation-speed-changed');
    expect(lastData).toEqual(testData);
  });

  test('should return false when no listeners', () => {
    const result = eventBus.emit('debug-toggle', { enabled: true });
    expect(result).toBe(false);
  });

  test('should return true when listeners exist', () => {
    eventBus.on('debug-toggle', () => {});
    const result = eventBus.emit('debug-toggle', { enabled: true });
    expect(result).toBe(true);
  });
});
