import type { Scene } from 'phaser';
import { PhaserBoid } from './phaser-boid';
import type { IBoidDependencies, IBoidConfig } from '$lib/interfaces/boid';
import { BoidVariant } from './types';

/**
 * Factory for creating boids with consistent configuration
 */
export class BoidFactory {
  constructor(
    private scene: Scene,
    private deps: IBoidDependencies
  ) {}

  /**
   * Create a new boid with the given configuration
   */
  createBoid(
    x: number,
    y: number,
    variant: BoidVariant,
    config?: IBoidConfig
  ): PhaserBoid {
    // Create a new boid with merged configuration
    const boid = new PhaserBoid(
      this.scene,
      x,
      y,
      variant,
      {
        ...this.deps,
        config: {
          ...this.deps.config,
          ...config
        }
      }
    );

    // Add to scene
    this.scene.add.existing(boid);

    return boid;
  }

  /**
   * Create multiple boids with the same configuration
   */
  createBoids(
    count: number,
    variant: BoidVariant,
    config?: IBoidConfig & {
      minX?: number;
      maxX?: number;
      minY?: number;
      maxY?: number;
    }
  ): PhaserBoid[] {
    const {
      minX = 0,
      maxX = this.scene.scale.width,
      minY = 0,
      maxY = this.scene.scale.height,
      ...boidConfig
    } = config || {};

    return Array.from({ length: count }, () => {
      const x = this.deps.random.float(minX, maxX);
      const y = this.deps.random.float(minY, maxY);
      return this.createBoid(x, y, variant, boidConfig);
    });
  }

  /**
   * Create a predator boid
   */
  createPredator(
    x: number,
    y: number,
    config?: IBoidConfig
  ): PhaserBoid {
    return this.createBoid(x, y, BoidVariant.PREDATOR, {
      maxSpeed: 150,
      maxForce: 2.0,
      perceptionRadius: 200,
      ...config
    });
  }

  /**
   * Create multiple predator boids
   */
  createPredators(
    count: number,
    config?: IBoidConfig & {
      minX?: number;
      maxX?: number;
      minY?: number;
      maxY?: number;
    }
  ): PhaserBoid[] {
    return this.createBoids(count, BoidVariant.PREDATOR, {
      maxSpeed: 150,
      maxForce: 2.0,
      perceptionRadius: 200,
      ...config
    });
  }

  /**
   * Create a prey boid
   */
  createPrey(
    x: number,
    y: number,
    config?: IBoidConfig
  ): PhaserBoid {
    return this.createBoid(x, y, BoidVariant.PREY, {
      maxSpeed: 100,
      maxForce: 1.0,
      perceptionRadius: 150,
      ...config
    });
  }

  /**
   * Create multiple prey boids
   */
  createPreys(
    count: number,
    config?: IBoidConfig & {
      minX?: number;
      maxX?: number;
      minY?: number;
      maxY?: number;
    }
  ): PhaserBoid[] {
    return this.createBoids(count, BoidVariant.PREY, {
      maxSpeed: 100,
      maxForce: 1.0,
      perceptionRadius: 150,
      ...config
    });
  }
}
