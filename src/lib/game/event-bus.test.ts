import { describe, it, expect, vi, afterEach } from 'vitest';
import { EventBus } from '$game/event-bus';

describe('EventBus', () => {
  // Clean up after each test
  afterEach(() => {
    EventBus.removeAllListeners();
  });

  /**
   * Basic event handling tests - reduced redundancy
   */
  describe('Basic functionality', () => {
    it('should emit and receive events with correct data', () => {
      // Arrange
      const mockCallback = vi.fn();
      const eventName = 'test-event';
      const eventData = { value: 42 };
      
      // Act
      EventBus.on(eventName, mockCallback);
      EventBus.emit(eventName, eventData);
      
      // Assert
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(eventData);
    });
  
    it('should handle multiple events and listeners correctly', () => {
      // Arrange
      const mockCallback1 = vi.fn();
      const mockCallback2 = vi.fn();
      const event1 = 'test-event-1';
      const event2 = 'test-event-2';
      const data1 = { type: 'event1-data' };
      const data2 = { type: 'event2-data' };
      
      // Act - Set up listeners
      EventBus.on(event1, mockCallback1);
      EventBus.on(event2, mockCallback2);
      
      // Multiple listeners for event1
      EventBus.on(event1, mockCallback2);
      
      // Emit events
      EventBus.emit(event1, data1);
      EventBus.emit(event2, data2);
      
      // Assert
      // First listener for event1
      expect(mockCallback1).toHaveBeenCalledTimes(1);
      expect(mockCallback1).toHaveBeenCalledWith(data1);
      
      // Second listener for event1 + listener for event2
      expect(mockCallback2).toHaveBeenCalledTimes(2);
      expect(mockCallback2).toHaveBeenCalledWith(data1);
      expect(mockCallback2).toHaveBeenCalledWith(data2);
      
      // Should not trigger listeners for unrelated events
      EventBus.emit('boundary-force-changed', {value: -1});
      expect(mockCallback1).toHaveBeenCalledTimes(1); // No change
    });
  });

  /**
   * Test listener management
   */
  describe('Listener management', () => {
    it('should properly remove specific listeners', () => {
      // Arrange
      const mockCallback = vi.fn();
      const eventName = 'test-event';
      
      // Act
      EventBus.on(eventName, mockCallback);
      EventBus.off(eventName, mockCallback);
      EventBus.emit(eventName, { value: 42 });
      
      // Assert
      expect(mockCallback).not.toHaveBeenCalled();
    });
  
    it('should handle one-time event listeners', () => {
      // Arrange
      const mockCallback = vi.fn();
      const eventName = 'test-event';
      const eventData = { value: 42 };
      
      // Act
      EventBus.once(eventName, mockCallback);
      EventBus.emit(eventName, eventData); // Should trigger
      EventBus.emit(eventName, eventData); // Should not trigger
      
      // Assert
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(eventData);
    });
    
    it('should handle removing all listeners for an event', () => {
      // Arrange
      const mockCallback1 = vi.fn();
      const mockCallback2 = vi.fn();
      const eventName = 'test-event';
      
      // Act
      EventBus.on(eventName, mockCallback1);
      EventBus.on(eventName, mockCallback2);
      EventBus.removeAllListeners(eventName);
      EventBus.emit(eventName, { value: 42 });
      
      // Assert
      expect(mockCallback1).not.toHaveBeenCalled();
      expect(mockCallback2).not.toHaveBeenCalled();
    });
    
    it('should handle removing all listeners globally', () => {
      // Arrange
      const mockCallback1 = vi.fn();
      const mockCallback2 = vi.fn();
      const event1 = 'test-event-1';
      const event2 = 'test-event-2';
      
      // Act
      EventBus.on(event1, mockCallback1);
      EventBus.on(event2, mockCallback2);
      EventBus.removeAllListeners();
      EventBus.emit(event1, { value: 42 });
      EventBus.emit(event2, { value: 42 });
      
      // Assert
      expect(mockCallback1).not.toHaveBeenCalled();
      expect(mockCallback2).not.toHaveBeenCalled();
    });
  });

  /**
   * Test special cases
   */
  describe('Special cases', () => {
    it('should handle events with context', () => {
      // Arrange
      const context = { id: 'test-context' };
      const mockCallback = vi.fn(function(this: typeof context) {
        return this.id;
      });
      const eventName = 'test-event';
      
      // Act
      EventBus.on(eventName, mockCallback, context);
      EventBus.emit(eventName, { value: 42 });
      
      // Assert
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback.mock.instances[0]).toBe(context);
    });
    
    it('should return boolean indicating if event had listeners', () => {
      // Arrange
      const mockCallback = vi.fn();
      const eventName = 'test-event';
      
      // Act & Assert - No listeners
      const result1 = EventBus.emit(eventName, { value: 42 });
      expect(result1).toBe(false);
      
      // Act & Assert - With listener
      EventBus.on(eventName, mockCallback);
      const result2 = EventBus.emit(eventName, { value: 42 });
      expect(result2).toBe(true);
    });
  });
});