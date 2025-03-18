import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BoidFactory } from './boid-factory';
import { BoidVariant } from './types';
import { defaultTestDependencies } from '../../../tests/implementations';
import type { Scene } from 'phaser';

describe('BoidFactory', () => {
  let mockScene: Scene;
  let factory: BoidFactory;

  beforeEach(() => {
    // Create mock scene
    mockScene = {
      add: {
        existing: vi.fn().mockReturnThis()
      },
      physics: {
        add: {
          existing: vi.fn()
        }
      },
      scale: {
        width: 800,
        height: 600
      }
    } as unknown as Scene;

    factory = new BoidFactory(mockScene, defaultTestDependencies);
  });

  describe('Single Boid Creation', () => {
    it('creates a prey boid with default configuration', () => {
      // When: Creating a prey boid
      const boid = factory.createPrey(100, 100);

      // Then: Should have correct properties
      expect(boid.getVariant()).toBe(BoidVariant.PREY);
      expect(boid.getMaxSpeed()).toBe(100);
      expect(boid.getMaxForce()).toBe(1.0);
      expect(boid.getPerceptionRadius()).toBe(150);

      // And: Should be added to scene and physics system
      expect(mockScene.add.existing).toHaveBeenCalledWith(boid);
      expect(mockScene.physics.add.existing).toHaveBeenCalledWith(boid);
    });

    it('creates a predator boid with default configuration', () => {
      // When: Creating a predator boid
      const boid = factory.createPredator(100, 100);

      // Then: Should have correct properties
      expect(boid.getVariant()).toBe(BoidVariant.PREDATOR);
      expect(boid.getMaxSpeed()).toBe(150);
      expect(boid.getMaxForce()).toBe(2.0);
      expect(boid.getPerceptionRadius()).toBe(200);

      // And: Should be added to scene and physics system
      expect(mockScene.add.existing).toHaveBeenCalledWith(boid);
      expect(mockScene.physics.add.existing).toHaveBeenCalledWith(boid);
    });

    it('creates a boid with custom configuration', () => {
      // Given: Custom configuration
      const config = {
        maxSpeed: 200,
        maxForce: 3.0,
        perceptionRadius: 250
      };

      // When: Creating a boid with custom config
      const boid = factory.createPrey(100, 100, config);

      // Then: Should use custom configuration
      expect(boid.getMaxSpeed()).toBe(config.maxSpeed);
      expect(boid.getMaxForce()).toBe(config.maxForce);
      expect(boid.getPerceptionRadius()).toBe(config.perceptionRadius);

      // And: Should be added to scene and physics system
      expect(mockScene.add.existing).toHaveBeenCalledWith(boid);
      expect(mockScene.physics.add.existing).toHaveBeenCalledWith(boid);
    });
  });

  describe('Multiple Boid Creation', () => {
    it('creates multiple prey boids', () => {
      // When: Creating multiple prey boids
      const count = 5;
      const boids = factory.createPreys(count);

      // Then: Should create correct number of boids
      expect(boids).toHaveLength(count);

      // And: All should be prey boids with correct setup
      boids.forEach(boid => {
        expect(boid.getVariant()).toBe(BoidVariant.PREY);
        expect(mockScene.add.existing).toHaveBeenCalledWith(boid);
        expect(mockScene.physics.add.existing).toHaveBeenCalledWith(boid);
      });
    });

    it('creates multiple predator boids', () => {
      // When: Creating multiple predator boids
      const count = 3;
      const boids = factory.createPredators(count);

      // Then: Should create correct number of boids
      expect(boids).toHaveLength(count);

      // And: All should be predator boids with correct setup
      boids.forEach(boid => {
        expect(boid.getVariant()).toBe(BoidVariant.PREDATOR);
        expect(mockScene.add.existing).toHaveBeenCalledWith(boid);
        expect(mockScene.physics.add.existing).toHaveBeenCalledWith(boid);
      });
    });

    it('creates boids within specified bounds', () => {
      // Given: Custom bounds
      const bounds = {
        minX: 100,
        maxX: 200,
        minY: 150,
        maxY: 250
      };

      // When: Creating boids within bounds
      const boids = factory.createPreys(10, bounds);

      // Then: All boids should be within bounds
      boids.forEach(boid => {
        expect(boid.x).toBeGreaterThanOrEqual(bounds.minX);
        expect(boid.x).toBeLessThanOrEqual(bounds.maxX);
        expect(boid.y).toBeGreaterThanOrEqual(bounds.minY);
        expect(boid.y).toBeLessThanOrEqual(bounds.maxY);
        expect(mockScene.physics.add.existing).toHaveBeenCalledWith(boid);
      });
    });

    it('creates boids with custom configuration', () => {
      // Given: Custom configuration
      const config = {
        maxSpeed: 200,
        maxForce: 3.0,
        perceptionRadius: 250,
        minX: 0,
        maxX: 800,
        minY: 0,
        maxY: 600
      };

      // When: Creating multiple boids with config
      const boids = factory.createPreys(5, config);

      // Then: All boids should use custom configuration
      boids.forEach(boid => {
        expect(boid.getMaxSpeed()).toBe(config.maxSpeed);
        expect(boid.getMaxForce()).toBe(config.maxForce);
        expect(boid.getPerceptionRadius()).toBe(config.perceptionRadius);
        expect(mockScene.physics.add.existing).toHaveBeenCalledWith(boid);
      });
    });
  });
});
