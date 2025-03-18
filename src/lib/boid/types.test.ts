import { describe, it, expect } from 'vitest';
import { BoidVariant, isPredator } from '$boid/types';
import type { BoidStats, PreyStats, PredatorStats } from '$boid/types';
import type { IBoid } from '$interfaces/boid';
import type { GameEvents } from '$adapters/phaser-events';
import { TestVector } from '$tests/implementations/vector';

// Create mock boid factory
const createMockBoid = (variant: BoidVariant, stats: BoidStats): IBoid => ({
  getId: () => 'test-boid',
  getVariant: () => variant,
  getBoidPosition: () => new TestVector(0, 0),
  setBoidPosition: () => {},
  getBoidVelocity: () => new TestVector(0, 0),
  setBoidVelocity: () => {},
  applyForce: () => {},
  getMaxSpeed: () => 100,
  setMaxSpeed: () => {},
  getMaxForce: () => 1.0,
  setMaxForce: () => {},
  getPerceptionRadius: () => 150,
  setPerceptionRadius: () => {},
  getStats: () => stats,
  takeDamage: () => false,
  increaseReproduction: () => false,
  levelUp: () => {},
  update: () => {},
  destroy: () => {}
});

describe('Boid Types', () => {
  describe('BoidVariant', () => {
    it('has correct variants', () => {
      expect(BoidVariant.PREY).toBe('prey');
      expect(BoidVariant.PREDATOR).toBe('predator');
    });
  });

  describe('isPredator', () => {
    it('correctly identifies predator variant', () => {
      expect(isPredator(BoidVariant.PREDATOR)).toBe(true);
      expect(isPredator(BoidVariant.PREY)).toBe(false);
    });
  });

  describe('Stats Type Guards', () => {
    it('correctly types prey stats', () => {
      const stats: PreyStats = {
        health: 100,
        stamina: 100,
        speed: 100,
        reproduction: 0,
        level: 1,
        sex: 'male'
      };

      // Type check: PreyStats should not have attack property
      const hasAttack = 'attack' in stats;
      expect(hasAttack).toBe(false);
    });

    it('correctly types predator stats', () => {
      const stats: PredatorStats = {
        health: 100,
        stamina: 100,
        speed: 100,
        reproduction: 0,
        level: 1,
        sex: 'female',
        attack: 10
      };

      // Type check: PredatorStats should have attack property
      const hasAttack = 'attack' in stats;
      expect(hasAttack).toBe(true);
      expect(stats.attack).toBe(10);
    });
  });

  describe('Event Type Checks', () => {
    it('validates boid-damaged event type', () => {
      const mockBoid = createMockBoid(BoidVariant.PREY, {
        health: 100,
        stamina: 100,
        speed: 100,
        reproduction: 0,
        level: 1,
        sex: 'male'
      });

      const event: GameEvents['boid-damaged'] = {
        boid: mockBoid,
        damage: 10,
        remainingHealth: 90
      };

      expect(event.damage).toBeTypeOf('number');
      expect(event.remainingHealth).toBeTypeOf('number');
    });

    it('validates boid-stamina-depleted event type', () => {
      const mockBoid = createMockBoid(BoidVariant.PREY, {
        health: 100,
        stamina: 0,
        speed: 100,
        reproduction: 0,
        level: 1,
        sex: 'male'
      });

      const event: GameEvents['boid-stamina-depleted'] = {
        boid: mockBoid
      };

      expect('boid' in event).toBe(true);
    });

    it('validates boid-stamina-recovered event type', () => {
      const mockBoid = createMockBoid(BoidVariant.PREY, {
        health: 100,
        stamina: 100,
        speed: 100,
        reproduction: 0,
        level: 1,
        sex: 'male'
      });

      const event: GameEvents['boid-stamina-recovered'] = {
        boid: mockBoid
      };

      expect('boid' in event).toBe(true);
    });

    it('validates boid-leveled-up event type', () => {
      const mockBoid = createMockBoid(BoidVariant.PREY, {
        health: 100,
        stamina: 100,
        speed: 100,
        reproduction: 0,
        level: 2,
        sex: 'male'
      });

      const event: GameEvents['boid-leveled-up'] = {
        boid: mockBoid,
        level: 2
      };

      expect(event.level).toBeTypeOf('number');
    });

    it('validates max-speed-changed event type', () => {
      const event: GameEvents['max-speed-changed'] = {
        value: 150
      };

      expect(event.value).toBeTypeOf('number');
    });

    it('validates max-force-changed event type', () => {
      const event: GameEvents['max-force-changed'] = {
        value: 2.0
      };

      expect(event.value).toBeTypeOf('number');
    });

    it('validates perception-radius-changed event type', () => {
      const event: GameEvents['perception-radius-changed'] = {
        value: 200
      };

      expect(event.value).toBeTypeOf('number');
    });
  });

  describe('Stats Type Compatibility', () => {
    it('allows assignment of predator stats to boid stats', () => {
      const predatorStats: PredatorStats = {
        health: 100,
        stamina: 100,
        speed: 100,
        reproduction: 0,
        level: 1,
        sex: 'male',
        attack: 10
      };

      const boidStats: BoidStats = predatorStats;
      expect(boidStats.health).toBe(100);
      expect('attack' in boidStats).toBe(true);
    });

    it('allows assignment of prey stats to boid stats', () => {
      const preyStats: PreyStats = {
        health: 100,
        stamina: 100,
        speed: 100,
        reproduction: 0,
        level: 1,
        sex: 'female'
      };

      const boidStats: BoidStats = preyStats;
      expect(boidStats.health).toBe(100);
      expect('attack' in boidStats).toBe(false);
    });
  });
});
