import { describe, it, expect, beforeEach } from 'vitest';
import { BoidBehavior } from '$boid/boid-behavior';
import { BoidVariant } from '$boid/types';
import { defaultTestDependencies } from '$tests/implementations';
import { TestVector } from '$tests/implementations/vector';
import type { IBoidDependencies } from '$interfaces/boid';
import { TEST_BOID_STATS, TEST_DEFAULTS, TEST_TIME_CONFIG } from '$tests/utils/constants';

describe('BoidBehavior', () => {
  let deps: IBoidDependencies;

  beforeEach(() => {
    deps = defaultTestDependencies;
  });

  describe('Creation', () => {
    it('creates prey with default configuration', () => {
      // When: Creating a prey boid
      const boid = new BoidBehavior(deps, 100, 100, BoidVariant.PREY);

      // Then: Should have correct initial state
      expect(boid.getVariant()).toBe(BoidVariant.PREY);
      expect(boid.getMaxSpeed()).toBe(TEST_DEFAULTS.boid.maxSpeed);
      expect(boid.getMaxForce()).toBe(TEST_DEFAULTS.boid.maxForce);
      expect(boid.getPerceptionRadius()).toBe(TEST_DEFAULTS.boid.perceptionRadius);

      // And: Should have prey stats
      const stats = boid.getStats();
      expect(stats.health).toBe(TEST_BOID_STATS.health);
      expect(stats.stamina).toBe(TEST_BOID_STATS.stamina);
      expect(stats.speed).toBe(TEST_DEFAULTS.boid.maxSpeed);
      expect(stats.reproduction).toBe(0);
      expect(stats.level).toBe(1);
      expect('attack' in stats).toBe(false);
    });

    it('creates predator with default configuration', () => {
      // When: Creating a predator boid
      const boid = new BoidBehavior(deps, 100, 100, BoidVariant.PREDATOR);

      // Then: Should have correct initial state
      expect(boid.getVariant()).toBe(BoidVariant.PREDATOR);
      expect(boid.getMaxSpeed()).toBe(TEST_DEFAULTS.boid.maxSpeed); // Base speed is same for all boids
      expect(boid.getMaxForce()).toBe(TEST_DEFAULTS.boid.maxForce); // Base force is same for all boids
      expect(boid.getPerceptionRadius()).toBe(TEST_DEFAULTS.boid.perceptionRadius); // Base perception is same for all boids

      // And: Should have predator stats with attack
      const stats = boid.getStats();
      expect(stats.health).toBe(TEST_BOID_STATS.health);
      expect(stats.stamina).toBe(TEST_BOID_STATS.stamina);
      expect(stats.speed).toBe(TEST_DEFAULTS.boid.maxSpeed); // Initial speed matches base speed
      expect(stats.reproduction).toBe(TEST_BOID_STATS.reproduction);
      expect(stats.level).toBe(TEST_BOID_STATS.level);
      expect('attack' in stats).toBe(true);
      if ('attack' in stats) {
        expect(stats.attack).toBe(TEST_BOID_STATS.attack);
      }
    });

    it('creates boid with custom configuration', () => {
      // Given: Custom configuration with higher values
      const config = {
        maxSpeed: { 
          min: 0, 
          max: TEST_DEFAULTS.predator.maxSpeed * 4, 
          default: TEST_DEFAULTS.predator.maxSpeed * 2,
          step: 1 
        },
        maxForce: { 
          min: 0, 
          max: TEST_DEFAULTS.predator.maxForce * 4, 
          default: TEST_DEFAULTS.predator.maxForce * 2,
          step: 0.1 
        },
        perceptionRadius: { 
          min: 0, 
          max: TEST_DEFAULTS.predator.perceptionRadius * 4, 
          default: TEST_DEFAULTS.predator.perceptionRadius * 2,
          step: 1 
        }
      };

      // When: Creating a boid with custom config
      const boid = new BoidBehavior(
        { ...deps, config },
        100,
        100,
        BoidVariant.PREY
      );

      // Then: Should use custom configuration
      expect(boid.getMaxSpeed()).toBe(config.maxSpeed.default);
      expect(boid.getMaxForce()).toBe(config.maxForce.default);
      expect(boid.getPerceptionRadius()).toBe(config.perceptionRadius.default);
    });
  });

  describe('Movement', () => {
    it('updates position based on velocity', () => {
      // Given: A boid with known velocity
      const boid = new BoidBehavior(deps, 100, 100, BoidVariant.PREY);
      const velocity = new TestVector(10, 5);
      boid.setBoidVelocity(velocity);

      // When: Updating for one second
      boid.update(1000);

      // Then: Position should change proportionally
      const position = boid.getBoidPosition();
      expect(position.x).toBeCloseTo(110);
      expect(position.y).toBeCloseTo(105);
    });

    it('limits velocity to max speed', () => {
      // Given: A boid with default max speed
      const boid = new BoidBehavior(deps, 100, 100, BoidVariant.PREY);
      const maxSpeed = TEST_DEFAULTS.boid.maxSpeed;

      // When: Applying excessive force
      const force = new TestVector(1000, 1000);
      boid.applyForce(force);
      boid.update(TEST_TIME_CONFIG.defaultFrameTime); // One frame at 60fps

      // Then: Velocity should be capped
      const velocity = boid.getBoidVelocity();
      expect(velocity.length()).toBeLessThanOrEqual(maxSpeed*1.01); // Allow for slight overshoot
    });

    it('responds to applied forces', () => {
      // Given: A boid with no initial velocity
      const boid = new BoidBehavior(deps, 100, 100, BoidVariant.PREY);
      boid.setBoidVelocity(new TestVector(0, 0));
      const initialVelocity = boid.getBoidVelocity().length();
      expect(initialVelocity).toBe(0);

      // When: Applying a force
      const force = new TestVector(1, 0);
      boid.applyForce(force);
      boid.update(TEST_TIME_CONFIG.defaultFrameTime);

      // Then: Boid should move in force direction
      const velocity = boid.getBoidVelocity();
      expect(velocity.x).toBeGreaterThan(0);
      expect(velocity.y).toBe(0);
    });
  });

  describe('Health System', () => {
    it('handles damage correctly', () => {
      // Given: A healthy boid
      const boid = new BoidBehavior(deps, 100, 100, BoidVariant.PREY);
      const initialHealth = boid.getStats().health;

      // When: Taking non-lethal damage
      const isDeadFromPartialDamage = boid.takeDamage(initialHealth / 2);

      // Then: Should survive with reduced health
      expect(isDeadFromPartialDamage).toBe(false);
      expect(boid.getStats().health).toBe(initialHealth / 2);

      // When: Taking lethal damage
      const isDeadFromLethalDamage = boid.takeDamage(initialHealth);

      // Then: Should die
      expect(isDeadFromLethalDamage).toBe(true);
      expect(boid.getStats().health).toBe(0);
    });

    it('cannot have negative health', () => {
      // Given: A healthy boid
      const boid = new BoidBehavior(deps, 100, 100, BoidVariant.PREY);
      const initialHealth = boid.getStats().health;

      // When: Taking massive damage
      boid.takeDamage(initialHealth * 2);

      // Then: Health should be zero, not negative
      expect(boid.getStats().health).toBe(0);
    });
  });

  describe('Stamina System', () => {
    it('loses stamina when moving', () => {
      // Given: A boid with full stamina
      const boid = new BoidBehavior(deps, 100, 100, BoidVariant.PREY);
      const initialStamina = boid.getStats().stamina;
      expect(initialStamina).toBeGreaterThan(0);

      // When: Moving at max speed
      boid.setBoidVelocity(new TestVector(TEST_DEFAULTS.boid.maxSpeed, 0));
      boid.update(TEST_TIME_CONFIG.defaultFrameTime);

      // Then: Stamina should decrease
      expect(boid.getStats().stamina).toBeLessThan(initialStamina);
    });

    it('recovers stamina during rest', () => {
      // Given: A boid with depleted stamina
      const boid = new BoidBehavior(deps, 100, 100, BoidVariant.PREY);
      const stats = boid.getStats();
      stats.stamina = 0;

      // When: Resting (not moving)
      boid.setBoidVelocity(new TestVector(0, 0));
      for (let i = 0; i < TEST_TIME_CONFIG.defaultTimeout / TEST_TIME_CONFIG.defaultFrameTime; i++) {
        boid.update(TEST_TIME_CONFIG.defaultFrameTime); // 60fps
      }

      // Then: Should recover stamina
      expect(boid.getStats().stamina).toBeGreaterThan(0);
    });
  });
});
