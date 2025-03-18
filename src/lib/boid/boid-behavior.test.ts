import { describe, it, expect, beforeEach } from 'vitest';
import { BoidBehavior } from '$boid/boid-behavior';
import { BoidVariant } from '$boid/types';
import { defaultTestDependencies } from '$tests/implementations';
import { TestVector } from '$tests/implementations/vector';
import type { IBoidDependencies } from '$interfaces/boid';

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
      expect(boid.getMaxSpeed()).toBe(100);
      expect(boid.getMaxForce()).toBe(1.0);
      expect(boid.getPerceptionRadius()).toBe(150);

      // And: Should have prey stats
      const stats = boid.getStats();
      expect(stats.health).toBe(100);
      expect(stats.stamina).toBe(100);
      expect(stats.speed).toBe(100);
      expect(stats.reproduction).toBe(0);
      expect(stats.level).toBe(1);
      expect('attack' in stats).toBe(false);
    });

    it('creates predator with default configuration', () => {
      // When: Creating a predator boid
      const boid = new BoidBehavior(deps, 100, 100, BoidVariant.PREDATOR);

      // Then: Should have correct initial state
      expect(boid.getVariant()).toBe(BoidVariant.PREDATOR);
      expect(boid.getMaxSpeed()).toBe(100);
      expect(boid.getMaxForce()).toBe(1.0);
      expect(boid.getPerceptionRadius()).toBe(150);

      // And: Should have predator stats with attack
      const stats = boid.getStats();
      expect(stats.health).toBe(100);
      expect(stats.stamina).toBe(100);
      expect(stats.speed).toBe(100);
      expect(stats.reproduction).toBe(0);
      expect(stats.level).toBe(1);
      expect('attack' in stats).toBe(true);
      if ('attack' in stats) {
        expect(stats.attack).toBe(10);
      }
    });

    it('creates boid with custom configuration', () => {
      // Given: Custom configuration
      const config = {
        maxSpeed: 150,
        maxForce: 2.0,
        perceptionRadius: 200
      };

      // When: Creating a boid with custom config
      const boid = new BoidBehavior(
        { ...deps, config },
        100,
        100,
        BoidVariant.PREY
      );

      // Then: Should use custom configuration
      expect(boid.getMaxSpeed()).toBe(config.maxSpeed);
      expect(boid.getMaxForce()).toBe(config.maxForce);
      expect(boid.getPerceptionRadius()).toBe(config.perceptionRadius);
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
      // Given: A boid with max speed
      const maxSpeed = 100;
      const boid = new BoidBehavior(
        { ...deps, config: { maxSpeed } },
        100,
        100,
        BoidVariant.PREY
      );

      // When: Applying excessive force
      const force = new TestVector(1000, 1000);
      boid.applyForce(force);
      boid.update(16); // One frame at 60fps

      // Then: Velocity should be capped
      const velocity = boid.getBoidVelocity();
      expect(velocity.length()).toBeLessThanOrEqual(maxSpeed);
    });

    it('applies forces proportionally to time delta', () => {
      // Given: A boid with constant force
      const boid = new BoidBehavior(deps, 100, 100, BoidVariant.PREY);
      const force = new TestVector(1, 1);

      // When: Applying force with different time deltas
      boid.applyForce(force);
      boid.update(16); // One frame
      const velocityAfterOneFrame = boid.getBoidVelocity().length();

      boid.applyForce(force);
      boid.update(32); // Two frames
      const velocityAfterTwoFrames = boid.getBoidVelocity().length();

      // Then: Velocity change should be proportional
      expect(velocityAfterTwoFrames).toBeGreaterThan(velocityAfterOneFrame);
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
    it('depletes stamina during sustained movement', () => {
      // Given: A boid moving at max speed
      const boid = new BoidBehavior(deps, 100, 100, BoidVariant.PREY);
      const maxSpeed = boid.getMaxSpeed();
      boid.setBoidVelocity(new TestVector(maxSpeed, 0));

      // When: Moving at max speed for multiple frames
      let framesUntilDepleted = 0;
      while (boid.getStats().stamina > 0 && framesUntilDepleted < 1000) {
        boid.update(16); // 60fps
        framesUntilDepleted++;
      }

      // Then: Stamina should be depleted
      expect(boid.getStats().stamina).toBe(0);
      expect(framesUntilDepleted).toBeLessThan(1000);
    });

    it('recovers stamina during rest', () => {
      // Given: A boid with depleted stamina
      const boid = new BoidBehavior(deps, 100, 100, BoidVariant.PREY);
      const stats = boid.getStats();
      stats.stamina = 0;

      // When: Resting (not moving)
      boid.setBoidVelocity(new TestVector(0, 0));
      for (let i = 0; i < 200; i++) {
        boid.update(16); // 60fps
      }

      // Then: Should recover stamina
      expect(boid.getStats().stamina).toBeGreaterThan(0);
    });
  });
});
