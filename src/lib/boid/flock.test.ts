import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Flock } from '$boid/flock';
import { BoidVariant } from '$boid';
import { EventBus } from '$game/event-bus';
import { DEFAULT_BOID_CONFIG, createPhaserMocks, createMockBoid } from '../../../setup-tests';

describe('Flock', () => {
  const { mockScene, mockDistances } = createPhaserMocks();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(EventBus, 'emit');
    vi.spyOn(EventBus, 'on');
    vi.spyOn(EventBus, 'off');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    EventBus.removeAllListeners();
  });

  /**
   * Basic initialization and configuration tests
   */
  describe('Initialization', () => {
    it('should initialize with default or custom config', () => {
      // Default config
      const flock1 = new Flock(mockScene);
      expect(flock1).toBeDefined();
      expect(flock1.boids).toEqual([]);
      
      // Custom config
      const customConfig = {
        alignmentWeight: 0.5,
        cohesionWeight: 1.5
      };
      const flock2 = new Flock(mockScene, customConfig);
      expect(flock2).toBeDefined();
      
      // Should set up event listeners for config params
      expect(EventBus.on).toHaveBeenCalled();
    });
  });

  /**
   * Boid management tests
   */
  describe('Boid management', () => {
    it('should add, track, and remove boids with correct counts', () => {
      // Arrange
      const flock = new Flock(mockScene);
      const prey = createMockBoid(mockScene, 100, 100, BoidVariant.PREY);
      const predator = createMockBoid(mockScene, 200, 200, BoidVariant.PREDATOR);
      
      // Act - Add boids
      flock.addBoid(prey);
      flock.addBoid(predator);
      
      // Assert - After adding
      expect(flock.boids.length).toBe(2);
      expect(EventBus.emit).toHaveBeenCalledWith('prey-count-updated', { count: 1 });
      expect(EventBus.emit).toHaveBeenCalledWith('predator-count-updated', { count: 1 });
      expect(EventBus.emit).toHaveBeenCalledWith('flock-updated', { count: 2 });
      
      // Act - Remove boid
      vi.clearAllMocks(); // Reset event tracking
      flock.removeBoid(prey);
      
      // Assert - After removal
      expect(flock.boids.length).toBe(1);
      expect(EventBus.emit).toHaveBeenCalledWith('prey-count-updated', { count: 0 });
      expect(EventBus.emit).toHaveBeenCalledWith('flock-updated', { count: 1 });
      
      // Edge case - removing non-existent boid
      const count = flock.boids.length;
      flock.removeBoid(prey); // Already removed
      expect(flock.boids.length).toBe(count); // Should not change
    });
  });
  
  /**
   * Obstacle management tests
   */
  describe('Obstacle management', () => {
    it('should add, remove, and clear obstacles', () => {
      // Arrange
      const flock = new Flock(mockScene);
      const obstacle1 = { id: 'obstacle1', body: { position: { x: 100, y: 100 } } };
      const obstacle2 = { id: 'obstacle2', body: { position: { x: 200, y: 200 } } };
      
      // Act - Add obstacles
      flock.addObstacle(obstacle1 as any);
      flock.addObstacle(obstacle2 as any);
      
      // Assert - Events emitted
      expect(EventBus.emit).toHaveBeenCalledWith('obstacle-added', { obstacle: obstacle1 });
      expect(EventBus.emit).toHaveBeenCalledWith('obstacle-added', { obstacle: obstacle2 });
      
      // Act - Remove obstacle
      vi.clearAllMocks();
      flock.removeObstacle(obstacle1 as any);
      
      // Assert
      expect(EventBus.emit).toHaveBeenCalledWith('obstacle-removed', { obstacle: obstacle1 });
      
      // Act - Clear all
      vi.clearAllMocks();
      flock.clearAllObstacles();
      
      // Assert - Indirectly test by adding again and checking events
      flock.addObstacle(obstacle1 as any);
      expect(EventBus.emit).toHaveBeenCalledTimes(1); // Only one add event
    });
  });

  /**
   * Flocking behavior tests - consolidated with parameterization
   */
  describe('Flocking behaviors', () => {
    // Helper to create a basic flock with two boids for testing behaviors
    function createTestFlock(distance = 25) {
      const flock = new Flock(mockScene);
      const boid1 = createMockBoid(mockScene, 100, 100, BoidVariant.PREY);
      const boid2 = createMockBoid(mockScene, 120, 120, BoidVariant.PREY);
      
      flock.addBoid(boid1);
      flock.addBoid(boid2);
      
      // Set up distances between boids
      mockDistances({
        '100,100-120,120': distance, // Distance between the two boids
      });
      
      return { flock, boid1, boid2 };
    }
    
    it.each([
      { behavior: 'alignment', eventType: 'alignment-updated', distance: 25 },
      { behavior: 'coherence', eventType: 'coherence-updated', distance: 25 },
      { behavior: 'separation', eventType: 'separation-updated', distance: 5 }
    ])('should calculate $behavior forces', ({ behavior, eventType, distance }) => {
      // Arrange
      const { flock, boid1, boid2 } = createTestFlock(distance);
      
      // Spy on force application
      vi.spyOn(boid1, 'applyForce');
      vi.spyOn(boid2, 'applyForce');
      
      // Act
      flock.run();
      
      // Assert
      // Forces should be applied to both boids
      expect(boid1.applyForce).toHaveBeenCalled();
      expect(boid2.applyForce).toHaveBeenCalled();
      
      // Event should be emitted for the behavior
      expect(EventBus.emit).toHaveBeenCalledWith(eventType, expect.anything());
    });
    
    it('should calculate boundary forces for boids near edges', () => {
      // Arrange
      const flock = new Flock(mockScene);
      const nearLeftEdge = createMockBoid(mockScene, 10, 100, BoidVariant.PREY);
      flock.addBoid(nearLeftEdge);
      
      // Act
      flock.run();
      
      // Assert
      // Should emit boundary approached event
      expect(EventBus.emit).toHaveBeenCalledWith('boundary-approached', expect.objectContaining({
        boundary: 'left'
      }));
    });
  });

  /**
   * Predator-prey interactions
   */
  describe('Predator-prey dynamics', () => {
    it('should handle prey avoidance of predators', () => {
      // Arrange
      const flock = new Flock(mockScene);
      const prey = createMockBoid(mockScene, 100, 100, BoidVariant.PREY);
      const predator = createMockBoid(mockScene, 120, 120, BoidVariant.PREDATOR);
      
      flock.addBoid(prey);
      flock.addBoid(predator);
      
      // Set up distances to be close
      mockDistances({
        '100,100-120,120': 25 // Close enough to trigger avoidance
      });
      
      // Spy on force application
      vi.spyOn(prey, 'applyForce');
      
      // Act
      flock.run();
      
      // Assert
      // Prey should have forces applied to avoid predator
      expect(prey.applyForce).toHaveBeenCalled();
      // Called multiple times for different forces
      expect(prey.applyForce).toHaveBeenCalledTimes(expect.any(Number));
    });
    
    it('should handle predator hunting behavior', () => {
      // Arrange
      const flock = new Flock(mockScene);
      const prey = createMockBoid(mockScene, 100, 100, BoidVariant.PREY);
      const predator = createMockBoid(mockScene, 150, 150, BoidVariant.PREDATOR);
      
      flock.addBoid(prey);
      flock.addBoid(predator);
      
      // Set up distances for hunting range
      mockDistances({
        '150,150-100,100': 40 // Close enough for hunting
      });
      
      // Spy on force application
      vi.spyOn(predator, 'applyForce');
      
      // Act
      flock.run();
      
      // Assert
      // Predator should have forces applied for hunting
      expect(predator.applyForce).toHaveBeenCalled();
    });
    
    it('should handle predator attacks when very close to prey', () => {
      // Arrange
      const flock = new Flock(mockScene);
      const prey = createMockBoid(mockScene, 100, 100, BoidVariant.PREY);
      const predator = createMockBoid(mockScene, 105, 105, BoidVariant.PREDATOR);
      
      // Spy on prey's takeDamage
      vi.spyOn(prey, 'takeDamage');
      
      flock.addBoid(prey);
      flock.addBoid(predator);
      
      // Set up distances to be very close
      mockDistances({
        '105,105-100,100': 5 // Very close, should trigger attack
      });
      
      // Act
      flock.run();
      
      // Assert
      // Predator should damage prey
      expect(prey.takeDamage).toHaveBeenCalled();
    });
  });

  /**
   * Test reproduction mechanics
   */
  describe('Reproduction mechanics', () => {
    it('should handle reproduction between compatible boids', () => {
      // Arrange
      const flock = new Flock(mockScene);
      const scene = mockScene;
      
      // Add to scene.add to handle new boid creation
      scene.add.existing = vi.fn();
      
      // Create male and female boids
      const maleBoid = createMockBoid(mockScene, 100, 100, BoidVariant.PREY, {
        getStats: vi.fn().mockReturnValue({
          sex: 'male',
          reproduction: 95 // Almost ready to reproduce
        })
      });
      
      const femaleBoid = createMockBoid(mockScene, 105, 105, BoidVariant.PREY, {
        getStats: vi.fn().mockReturnValue({
          sex: 'female'
        })
      });
      
      // Mock reproduction readiness
      vi.spyOn(maleBoid, 'increaseReproduction').mockReturnValue(true);
      
      flock.addBoid(maleBoid);
      flock.addBoid(femaleBoid);
      
      // Set up distances to be very close for reproduction
      mockDistances({
        '100,100-105,105': 10 // Very close
      });
      
      // Act
      flock.run();
      
      // Assert
      // Should emit reproduction event
      expect(EventBus.emit).toHaveBeenCalledWith('boid-reproduced', expect.anything());
    });
  });
  
  /**
   * Test clean up
   */
  describe('Cleanup', () => {
    it('should remove event listeners on destroy', () => {
      // Arrange
      const flock = new Flock(mockScene);
      
      // Act
      flock.destroy();
      
      // Assert
      // Should call off for all event listeners
      expect(EventBus.off).toHaveBeenCalled();
    });
  });
});