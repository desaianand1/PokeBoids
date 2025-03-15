import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from '$game/event-bus';
import { Boid, BoidVariant } from '$boid';
import { Flock } from '$boid/flock';
import * as simulationSignals from '$config/simulation-signals.svelte';
import { createPhaserMocks, createMockBoid } from '../../../setup-tests';

/**
 * Integration tests that verify interactions between multiple components
 */
describe('Simulation Integration', () => {
  const { mockScene, mockDistances } = createPhaserMocks();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(EventBus, 'emit');
    vi.spyOn(EventBus, 'on');
    vi.spyOn(EventBus, 'off');
    
    // Reset simulation signals to defaults
    simulationSignals.resetToDefaults();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
    EventBus.removeAllListeners();
  });
  
  /**
   * Test config propagation
   */
  describe('Configuration propagation', () => {
    it('should propagate config changes from signals to components', () => {
      // Arrange
      const boid = new Boid(mockScene, 100, 100);
      const maxSpeedSpy = vi.spyOn(boid, 'getMaxSpeed');
      const initialSpeed = boid.getMaxSpeed();
      
      // Create a new value different from the default
      const newSpeed = initialSpeed + 50;
      
      // Act - update config via signals
      simulationSignals.updateBoidConfig('maxSpeed', newSpeed);
      
      // Manually emit the event that would be triggered by the effect
      EventBus.emit('max-speed-changed', { value: newSpeed });
      
      // Assert
      // The boid's maxSpeed should be updated
      expect(boid.getMaxSpeed()).toBe(newSpeed);
    });
  });

  /**
   * Test predator-prey dynamics
   */
  describe('Predator-prey interactions', () => {
    it('should properly handle predator pursuit and prey damage', () => {
      // Arrange
      const prey = createMockBoid(mockScene, 100, 100, BoidVariant.PREY);
      const predator = createMockBoid(mockScene, 105, 105, BoidVariant.PREDATOR);
      
      // Spy on takeDamage method
      vi.spyOn(prey, 'takeDamage');
      
      // Create a flock with both boids
      const flock = new Flock(mockScene);
      flock.addBoid(prey);
      flock.addBoid(predator);
      
      // Set up very close distance to trigger attack
      mockDistances({
        '105,105-100,100': 5 // Very close
      });
      
      // Act - run flock simulation
      flock.run();
      
      // Assert
      // Predator should damage prey
      expect(prey.takeDamage).toHaveBeenCalled();
    });
    
    it('should propagate death events when prey is killed', () => {
      // Arrange
      const prey = createMockBoid(mockScene, 100, 100, BoidVariant.PREY);
      const flock = new Flock(mockScene);
      flock.addBoid(prey);
      
      // Set up a mock listener for removal
      const deathListener = vi.fn();
      EventBus.on('boid-removed', deathListener);
      
      // Make takeDamage return true (death)
      vi.spyOn(prey, 'takeDamage').mockReturnValue(true);
      
      // Act
      // Simulate what happens when a predator kills prey
      prey.takeDamage(100);
      flock.removeBoid(prey);
      
      // Assert
      expect(deathListener).toHaveBeenCalledWith({ boid: prey });
    });
  });

  /**
   * Test simulation state controls
   */
  describe('Simulation state control', () => {
    it('should synchronize play/pause state across components', () => {
      // Arrange
      // Initial state is playing
      expect(simulationSignals.isSimulationPlaying()).toBe(true);
      
      // Create a listener for the events
      const pauseListener = vi.fn();
      const startListener = vi.fn();
      EventBus.on('simulation-paused', pauseListener);
      EventBus.on('simulation-started', startListener);
      
      // Act - toggle pause
      simulationSignals.togglePlayPause();
      
      // Assert
      expect(simulationSignals.isSimulationPlaying()).toBe(false);
      expect(pauseListener).toHaveBeenCalledTimes(1);
      
      // Act - toggle again to resume
      simulationSignals.togglePlayPause();
      
      // Assert
      expect(simulationSignals.isSimulationPlaying()).toBe(true);
      expect(startListener).toHaveBeenCalledTimes(1);
    });
    
    it('should propagate simulation speed changes', () => {
      // Arrange
      const initialSpeed = simulationSignals.getCurrentSimulationSpeed();
      
      // Create a listener for speed change events
      const speedListener = vi.fn();
      EventBus.on('simulation-speed-changed', speedListener);
      
      // Act - speed up
      simulationSignals.advanceSimulationSpeed();
      
      // Assert
      const newSpeed = simulationSignals.getCurrentSimulationSpeed();
      expect(newSpeed).toBeGreaterThan(initialSpeed);
      expect(speedListener).toHaveBeenCalledWith({ value: newSpeed });
    });
  });

  /**
   * Test boid statistics tracking
   */
  describe('Statistics tracking', () => {
    it('should track population statistics through events', () => {
      // Arrange
      const flock = new Flock(mockScene);
      
      // Create listeners for population events
      const preyListener = vi.fn();
      const predatorListener = vi.fn();
      const totalListener = vi.fn();
      
      EventBus.on('prey-count-updated', preyListener);
      EventBus.on('predator-count-updated', predatorListener);
      EventBus.on('flock-updated', totalListener);
      
      // Act - add boids of different types
      flock.addBoid(createMockBoid(mockScene, 100, 100, BoidVariant.PREY));
      flock.addBoid(createMockBoid(mockScene, 200, 200, BoidVariant.PREDATOR));
      flock.addBoid(createMockBoid(mockScene, 300, 300, BoidVariant.PREY));
      
      // Assert
      expect(preyListener).toHaveBeenCalledWith({ count: 2 });
      expect(predatorListener).toHaveBeenCalledWith({ count: 1 });
      expect(totalListener).toHaveBeenCalledWith({ count: 3 });
    });
  });

  /**
   * Test reproduction mechanics
   */
  describe('Reproduction mechanics', () => {
    it('should trigger reproduction when conditions are met', () => {
      // Arrange
      const flock = new Flock(mockScene);
      const maleBoid = createMockBoid(mockScene, 100, 100, BoidVariant.PREY, {
        getStats: vi.fn().mockReturnValue({
          sex: 'male',
          reproduction: 95 // Almost ready
        }),
        increaseReproduction: vi.fn().mockReturnValue(true) // Ready to reproduce
      });
      
      const femaleBoid = createMockBoid(mockScene, 105, 105, BoidVariant.PREY, {
        getStats: vi.fn().mockReturnValue({
          sex: 'female'
        })
      });
      
      // Create listener for reproduction events
      const reproductionListener = vi.fn();
      EventBus.on('boid-reproduced', reproductionListener);
      
      // Add boids
      flock.addBoid(maleBoid);
      flock.addBoid(femaleBoid);
      
      // Set up very close distance
      mockDistances({
        '100,100-105,105': 10 // Close enough for reproduction
      });
      
      // Mock scene.add.existing to capture new boids
      mockScene.add.existing = vi.fn();
      
      // Act
      flock.run();
      
      // Assert
      expect(reproductionListener).toHaveBeenCalled();
    });
  });
});