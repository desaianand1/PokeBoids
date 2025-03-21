import type { ISpatialPartitioning } from '$interfaces/spatial-partitioning';
import type { IBoid } from '$interfaces/boid';
import type { IVector2 } from '$interfaces/vector';
import { TestVectorFactory } from '$tests/implementations/vector';

/**
 * Mock implementation of spatial partitioning for testing
 */
export class TestSpatialPartitioning implements ISpatialPartitioning {
  private boids: IBoid[] = [];
  private vectorFactory = new TestVectorFactory();
  private width: number;
  private height: number;

  constructor(width: number = 1000, height: number = 1000) {
    this.width = width;
    this.height = height;
  }

  insert(boid: IBoid): void {
    this.boids.push(boid);
  }

  findNearby(position: IVector2, radius: number): IBoid[] {
    const radiusSquared = radius * radius;
    return this.boids.filter(boid => {
      const boidPos = boid.getBoidPosition();
      const dx = boidPos.x - position.x;
      const dy = boidPos.y - position.y;
      const distSquared = dx * dx + dy * dy;
      return distSquared < radiusSquared;
    });
  }

  update(boids: IBoid[]): void {
    this.boids = [...boids];
  }

  clear(): void {
    this.boids = [];
  }

  updateBounds(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
}
