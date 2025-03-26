import type { Scene } from 'phaser';
import { PhaserBoid } from '$boid/phaser-boid';
import type { IBoidDependencies, IBoidConfig } from '$interfaces/boid';
import { BoidVariant } from '$boid/types';

/**
 * Factory for creating boids with consistent configuration
 */
export class BoidFactory {
  constructor(
    private scene: Scene,
    private deps: Omit<IBoidDependencies, 'config'>
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
    // Create a new boid with provided configuration
    const boid = new PhaserBoid(
      this.scene,
      x,
      y,
      variant,
      {
        ...this.deps,
        config
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
    return this.createBoid(x, y, BoidVariant.PREDATOR, config);
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
    return this.createBoids(count, BoidVariant.PREDATOR, config);
  }

  /**
   * Create a prey boid
   */
  createPrey(
    x: number,
    y: number,
    config?: IBoidConfig
  ): PhaserBoid {
    return this.createBoid(x, y, BoidVariant.PREY, config);
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
    return this.createBoids(count, BoidVariant.PREY, config);
  }
}
