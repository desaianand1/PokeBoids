import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from '$game/event-bus';
import * as phaserSignals from '$game/phaser-signals.svelte';

// Mock createGame function
vi.mock('$game', () => ({
  createGame: vi.fn().mockReturnValue({
    destroy: vi.fn()
  })
}));

describe('Phaser Signals', () => {
  beforeEach(() => {
    vi.spyOn(EventBus, 'emit');
    vi.spyOn(EventBus, 'on');
    vi.spyOn(EventBus, 'off');
    
    // Mock setInterval and clearInterval
    vi.useFakeTimers();
    
    // Reset state between tests
    phaserSignals.destroy();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });
  
  /**
   * Test initialization
   */
  describe('Initialization', () => {
    it('should initialize game with container ID', () => {
      // Arrange
      const containerId = 'test-container';
      const { createGame } = require('$game');
      
      // Act
      phaserSignals.initialize(containerId);
      
      // Assert
      expect(createGame).toHaveBeenCalledWith(containerId);
      expect(phaserSignals.phaserGameRef.game).not.toBeNull();
      expect(phaserSignals.phaserGameRef.isReady).toBe(false);
      
      // Should set up event listeners
      expect(EventBus.on).toHaveBeenCalledWith('scene-ready', expect.any(Function));
      expect(EventBus.on).toHaveBeenCalledWith('flock-updated', expect.any(Function));
      expect(EventBus.on).toHaveBeenCalledWith('prey-count-updated', expect.any(Function));
      expect(EventBus.on).toHaveBeenCalledWith('predator-count-updated', expect.any(Function));
      expect(EventBus.on).toHaveBeenCalledWith('boid-reproduced', expect.any(Function));
      expect(EventBus.on).toHaveBeenCalledWith('boid-removed', expect.any(Function));
      expect(EventBus.on).toHaveBeenCalledWith('game-reset', expect.any(Function));
    });
    
    it('should only initialize once with multiple calls', () => {
      // Arrange
      const { createGame } = require('$game');
      createGame.mockClear();
      
      // Act
      phaserSignals.initialize('container1');
      phaserSignals.initialize('container2'); // Should be ignored
      
      // Assert
      expect(createGame).toHaveBeenCalledTimes(1);
      expect(createGame).toHaveBeenCalledWith('container1');
    });
    
    it('should handle initialization errors', () => {
      // Arrange
      const { createGame } = require('$game');
      const error = new Error('Game initialization failed');
      createGame.mockImplementationOnce(() => {
        throw error;
      });
      
      // Act
      phaserSignals.initialize('test-container');
      
      // Assert
      expect(phaserSignals.phaserGameRef.error).toBe(error);
      expect(phaserSignals.phaserGameRef.game).toBeNull();
    });
  });

  /**
   * Test event handling for game state
   */
  describe('Game state events', () => {
    it('should update game reference on scene-ready event', () => {
      // Arrange
      phaserSignals.initialize('test-container');
      const mockScene = { key: 'test-scene' };
      
      // Act
      EventBus.emit('scene-ready', { scene: mockScene });
      
      // Assert
      expect(phaserSignals.phaserGameRef.scene).toBe(mockScene);
      expect(phaserSignals.phaserGameRef.isReady).toBe(true);
      
      // Should start runtime timer
      expect(phaserSignals.getRuntimeDuration()).toBe(0); // Just started
    });
    
    it('should update statistics on various game events', () => {
      // Arrange
      phaserSignals.initialize('test-container');
      
      // Act - Update boid counts
      EventBus.emit('flock-updated', { count: 150 });
      EventBus.emit('prey-count-updated', { count: 120 });
      EventBus.emit('predator-count-updated', { count: 30 });
      
      // Assert
      expect(phaserSignals.gameStats.totalBoids).toBe(150);
      expect(phaserSignals.gameStats.preyCount).toBe(120);
      expect(phaserSignals.gameStats.predatorCount).toBe(30);
      
      // Act - Update event counters
      EventBus.emit('boid-reproduced', {});
      EventBus.emit('boid-reproduced', {});
      EventBus.emit('boid-removed', {});
      
      // Assert
      expect(phaserSignals.gameStats.reproductionEvents).toBe(2);
      expect(phaserSignals.gameStats.deathEvents).toBe(1);
    });
    
    it('should reset statistics on game-reset event', () => {
      // Arrange
      phaserSignals.initialize('test-container');
      
      // Add some stats
      EventBus.emit('boid-reproduced', {});
      EventBus.emit('boid-reproduced', {});
      EventBus.emit('boid-removed', {});
      expect(phaserSignals.gameStats.reproductionEvents).toBe(2);
      expect(phaserSignals.gameStats.deathEvents).toBe(1);
      
      // Act
      EventBus.emit('game-reset', undefined);
      
      // Assert
      expect(phaserSignals.gameStats.reproductionEvents).toBe(0);
      expect(phaserSignals.gameStats.deathEvents).toBe(0);
    });
  });

  /**
   * Test runtime tracking
   */
  describe('Runtime tracking', () => {
    it('should track game runtime duration', () => {
      // Arrange
      phaserSignals.initialize('test-container');
      
      // Trigger runtime timer to start
      EventBus.emit('scene-ready', { scene: {} });
      
      // Act - advance time by 5 seconds
      vi.advanceTimersByTime(5000);
      
      // Assert
      expect(phaserSignals.getRuntimeDuration()).toBe(5);
      
      // Act - advance more time
      vi.advanceTimersByTime(10000);
      
      // Assert
      expect(phaserSignals.getRuntimeDuration()).toBe(15);
    });
    
    it('should reset runtime timer on destroy', () => {
      // Arrange
      phaserSignals.initialize('test-container');
      EventBus.emit('scene-ready', { scene: {} });
      vi.advanceTimersByTime(5000);
      
      expect(phaserSignals.getRuntimeDuration()).toBe(5);
      
      // Act
      phaserSignals.destroy();
      
      // Assert
      expect(phaserSignals.getRuntimeDuration()).toBe(0);
    });
  });

  /**
   * Test resource management
   */
  describe('Resource management', () => {
    it('should reset stats correctly', () => {
      // Arrange
      phaserSignals.initialize('test-container');
      
      // Set some non-zero stats
      phaserSignals.gameStats.reproductionEvents = 10;
      phaserSignals.gameStats.deathEvents = 5;
      
      // Act
      phaserSignals.resetStats();
      
      // Assert
      expect(phaserSignals.gameStats.reproductionEvents).toBe(0);
      expect(phaserSignals.gameStats.deathEvents).toBe(0);
      
      // Should not affect other stats
      expect(phaserSignals.gameStats.totalBoids).toBe(0); // Default value
    });
    
    it('should clean up resources on destroy', () => {
      // Arrange
      phaserSignals.initialize('test-container');
      const mockGame = phaserSignals.phaserGameRef.game;
      
      // Act
      phaserSignals.destroy();
      
      // Assert
      expect(mockGame?.destroy).toHaveBeenCalled();
      expect(phaserSignals.phaserGameRef.game).toBeNull();
      expect(phaserSignals.phaserGameRef.scene).toBeNull();
      expect(phaserSignals.phaserGameRef.isReady).toBe(false);
      expect(phaserSignals.phaserGameRef.error).toBeNull();
      
      // Should remove event listeners
      expect(EventBus.off).toHaveBeenCalledWith('scene-ready');
      expect(EventBus.off).toHaveBeenCalledWith('flock-updated');
      expect(EventBus.off).toHaveBeenCalledWith('prey-count-updated');
      expect(EventBus.off).toHaveBeenCalledWith('predator-count-updated');
      expect(EventBus.off).toHaveBeenCalledWith('boid-reproduced');
      expect(EventBus.off).toHaveBeenCalledWith('boid-removed');
      expect(EventBus.off).toHaveBeenCalledWith('game-reset');
    });
  });
});