import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Boid, BoidVariant } from '$boid';
import { EventBus } from '$game/event-bus';
import { Math as PhaserMath } from 'phaser';
import { DEFAULT_BOID_CONFIG, createPhaserMocks } from '../../../setup-tests';

describe('Boid', () => {
  const { mockScene } = createPhaserMocks();
  
  beforeEach(() => {
    vi.spyOn(EventBus, 'emit');
    vi.spyOn(EventBus, 'on');
    vi.spyOn(EventBus, 'off');
    
    // Reset random seed for deterministic tests
    vi.spyOn(global.Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    EventBus.removeAllListeners();
  });

  /**
   * Test boid creation with different variants and configurations
   */
  it.each([
    { variant: BoidVariant.PREY, config: {} },
    { variant: BoidVariant.PREDATOR, config: {} },
    { variant: BoidVariant.PREY, config: { maxSpeed: 150, perceptionRadius: 200 } }
  ])('should create a $variant boid with appropriate configuration', ({ variant, config }) => {
    // Arrange & Act
    const boid = new Boid(mockScene, 100, 100, variant, config);
    
    // Assert
    expect(boid).toBeDefined();
    expect(boid.getVariant()).toBe(variant);
    expect(boid.getId()).toBe('test-uuid'); // Mocked UUID
    
    // Verify expected values based on default config or overrides
    expect(boid.getMaxSpeed()).toBe(config.maxSpeed || DEFAULT_BOID_CONFIG.maxSpeed);
    expect(boid.getPerceptionRadius()).toBe(config.perceptionRadius || DEFAULT_BOID_CONFIG.perceptionRadius);
    
    // Predators should have attack stat
    const stats = boid.getStats();
    if (variant === BoidVariant.PREDATOR) {
      expect(stats.attack).toBeDefined();
      expect(stats.attack).toBeGreaterThan(0);
    } else {
      expect(stats.attack).toBeUndefined();
    }
  });

  /**
   * Test core boid functionality like movement and force application
   */
  describe('Core mechanics', () => {
    it('should update position based on velocity in preUpdate', () => {
      // Arrange
      const boid = new Boid(mockScene, 100, 100);
      const initialX = boid.x;
      const initialY = boid.y;
      
      // Get velocity and set to a known value
      const velocity = boid.getVelocity();
      const testVelocity = { x: 10, y: 5 };
      
      // Mock the velocity getter to return our test velocity
      vi.spyOn(boid, 'getVelocity').mockReturnValue(testVelocity);
      
      const delta = 1000; // 1 second in ms
      
      // Act
      boid.preUpdate(0, delta);
      
      // Assert - position should change by velocity * time
      const expectedX = initialX + testVelocity.x * (delta / 1000);
      const expectedY = initialY + testVelocity.y * (delta / 1000);
      
      expect(boid.x).toBeCloseTo(expectedX);
      expect(boid.y).toBeCloseTo(expectedY);
    });
    
    it('should limit velocity to maxSpeed', () => {
      // Arrange
      const maxSpeed = 100;
      const boid = new Boid(mockScene, 100, 100, BoidVariant.PREY, { maxSpeed });
      
      // Create a force that would exceed maxSpeed
      const hugeForce = new PhaserMath.Vector2(1000, 1000);
      
      // Act
      boid.applyForce(hugeForce);
      boid.preUpdate(0, 16); // Update at 60fps
      
      // Assert
      const velocity = boid.getVelocity();
      const speed = velocity.length();
      
      // Should be capped at maxSpeed
      expect(speed).toBeLessThanOrEqual(maxSpeed);
    });
  });

  /**
   * Test boid health and damage system
   */
  describe('Health and damage', () => {
    it('should take damage and return correct death status', () => {
      // Arrange
      const boid = new Boid(mockScene, 100, 100);
      const initialHealth = boid.getStats().health;
      
      // Act & Assert - partial damage
      const result1 = boid.takeDamage(initialHealth / 2);
      expect(result1).toBe(false); // Not dead
      expect(boid.getStats().health).toBe(initialHealth - initialHealth / 2);
      
      // Act & Assert - lethal damage
      const result2 = boid.takeDamage(initialHealth);
      expect(result2).toBe(true); // Dead
      expect(boid.getStats().health).toBe(0);
      
      // Verify event
      expect(EventBus.emit).toHaveBeenCalledWith('boid-damaged', expect.anything());
    });
  });

  /**
   * Test boid stamina system
   */
  describe('Stamina', () => {
    it('should deplete and recover stamina correctly', () => {
      // Arrange
      const boid = new Boid(mockScene, 100, 100);
      
      // Mock velocity to be at max speed
      vi.spyOn(boid, 'getVelocity').mockReturnValue({
        x: DEFAULT_BOID_CONFIG.maxSpeed,
        y: 0,
        length: () => DEFAULT_BOID_CONFIG.maxSpeed
      });
      
      // Act - deplete stamina
      // Run for enough frames to deplete stamina but don't hardcode exact number
      let staminaDepleted = false;
      for (let i = 0; i < 1000 && !staminaDepleted; i++) {
        boid.preUpdate(0, 16);
        if (boid.getStats().stamina === 0) {
          staminaDepleted = true;
        }
      }
      
      // Assert stamina is depleted
      expect(staminaDepleted).toBe(true);
      expect(boid.getStats().stamina).toBe(0);
      
      // Verify depleted event
      expect(EventBus.emit).toHaveBeenCalledWith('boid-stamina-depleted', expect.anything());
      
      // Act - recovery phase
      vi.spyOn(boid, 'getStats').mockReturnValue({
        ...boid.getStats(),
        stamina: 50 // Partially recovered
      });
      
      // Trigger a frame update after "recovery time"
      boid.preUpdate(0, 16);
      
      // Verify recovery moving properly
      expect(EventBus.emit).toHaveBeenCalledWith('boid-stamina-recovered', expect.anything());
    });
  });

  /**
   * Test boid reproduction system
   */
  describe('Reproduction', () => {
    it('should handle reproduction points and readiness status', () => {
      // Arrange
      const boid = new Boid(mockScene, 100, 100);
      
      // Act - add some reproduction points
      const halfReady = boid.increaseReproduction(50);
      
      // Assert
      expect(halfReady).toBe(false);
      expect(boid.getStats().reproduction).toBe(50);
      
      // Act - add enough to be ready
      const ready = boid.increaseReproduction(50);
      
      // Assert
      expect(ready).toBe(true);
      // Reproduction counter should reset
      expect(boid.getStats().reproduction).toBe(0);
    });
    
    it('should enforce reproduction limits based on variant', () => {
      // Arrange
      const prey = new Boid(mockScene, 100, 100, BoidVariant.PREY);
      const predator = new Boid(mockScene, 100, 100, BoidVariant.PREDATOR);
      
      // Act - trigger reproduction for prey (limit: 3)
      const preyResults = [];
      for (let i = 0; i < 4; i++) {
        preyResults.push(prey.increaseReproduction(100));
      }
      
      // Act - trigger reproduction for predator (limit: 5)
      const predatorResults = [];
      for (let i = 0; i < 6; i++) {
        predatorResults.push(predator.increaseReproduction(100));
      }
      
      // Assert - prey
      expect(preyResults.slice(0, 3).every(Boolean)).toBe(true); // First 3 should succeed
      expect(preyResults[3]).toBe(false); // 4th should fail
      
      // Assert - predator
      expect(predatorResults.slice(0, 5).every(Boolean)).toBe(true); // First 5 should succeed
      expect(predatorResults[5]).toBe(false); // 6th should fail
    });
  });

  /**
   * Test event handling
   */
  describe('Event handling', () => {
    it('should register event listeners for config changes', () => {
      // Arrange & Act
      const boid = new Boid(mockScene, 100, 100);
      
      // Assert
      expect(EventBus.on).toHaveBeenCalledWith('max-speed-changed', expect.any(Function), boid);
      expect(EventBus.on).toHaveBeenCalledWith('max-force-changed', expect.any(Function), boid);
      expect(EventBus.on).toHaveBeenCalledWith('perception-radius-changed', expect.any(Function), boid);
    });
    
    it('should unregister event listeners on destroy', () => {
      // Arrange
      const boid = new Boid(mockScene, 100, 100);
      
      // Act
      boid.destroy();
      
      // Assert
      expect(EventBus.off).toHaveBeenCalledWith('max-speed-changed', undefined, boid);
      expect(EventBus.off).toHaveBeenCalledWith('max-force-changed', undefined, boid);
      expect(EventBus.off).toHaveBeenCalledWith('perception-radius-changed', undefined, boid);
    });
    
    it('should update properties when config events are received', () => {
      // Arrange
      const boid = new Boid(mockScene, 100, 100);
      const newMaxSpeed = 200;
      const newMaxForce = 2.0;
      
      // Capture the event handlers
      const maxSpeedHandler = vi.fn();
      const maxForceHandler = vi.fn();
      
      // Mock EventBus.on to capture handlers
      vi.mocked(EventBus.on).mockImplementation((event, handler) => {
        if (event === 'max-speed-changed') maxSpeedHandler.mockImplementation(handler);
        if (event === 'max-force-changed') maxForceHandler.mockImplementation(handler);
        return EventBus;
      });
      
      // Make sure handlers were captured
      expect(maxSpeedHandler).toBeDefined();
      expect(maxForceHandler).toBeDefined();
      
      // Act - Manually trigger the handlers
      maxSpeedHandler({ value: newMaxSpeed });
      maxForceHandler({ value: newMaxForce });
      
      // Assert
      expect(boid.getMaxSpeed()).toBe(newMaxSpeed);
      expect(boid.getMaxForce()).toBe(newMaxForce);
    });
  });
});