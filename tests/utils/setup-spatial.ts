import { TestVectorFactory } from '$tests/implementations/vector';
import { QuadTreePartitioning } from '$boid/spatial/quad-tree';
import { TEST_SPATIAL_CONFIG, TEST_DEFAULTS } from '$tests/utils/constants';
import { createMockBoid } from '$tests/utils/mock-boid';
import type { IBoid } from '$interfaces/boid';
import { BoidVariant } from '$boid/types';
import { TestEventBus } from '$tests/implementations/events';
import { vi } from 'vitest';

const vectorFactory = new TestVectorFactory();

/**
 * Creates a test setup for spatial partitioning tests
 */
export function createSpatialTestContext() {
  const eventBus = new TestEventBus();
  return {
    vectorFactory: new TestVectorFactory(),
    eventBus,
    partitioning: new QuadTreePartitioning(
      eventBus
    )
  };
}

/**
 * Sets up common boid mocks
 */
function setupBoidMocks(boid: IBoid, variant: BoidVariant, x: number, y: number) {
  const pos = vectorFactory.create(x, y);
  const vel = vectorFactory.create(0, 0);
  vi.spyOn(boid, 'getBoidPosition').mockReturnValue(pos);
  vi.spyOn(boid, 'getBoidVelocity').mockReturnValue(vel);
  vi.spyOn(boid, 'getMaxSpeed').mockReturnValue(
    variant === BoidVariant.PREDATOR 
      ? TEST_DEFAULTS.predator.maxSpeed 
      : TEST_DEFAULTS.boid.maxSpeed
  );
  vi.spyOn(boid, 'getMaxForce').mockReturnValue(
    variant === BoidVariant.PREDATOR 
      ? TEST_DEFAULTS.predator.maxForce 
      : TEST_DEFAULTS.boid.maxForce
  );
  return boid;
}

/**
 * Creates a grid of test boids
 * @param rows Number of rows in the grid
 * @param cols Number of columns in the grid
 * @param variant Type of boids to create
 * @returns Array of boids positioned in a grid
 */
export function createBoidGrid(rows: number, cols: number, variant: BoidVariant): IBoid[] {
  const boids: IBoid[] = [];
  const cellWidth = TEST_SPATIAL_CONFIG.worldWidth / cols;
  const cellHeight = TEST_SPATIAL_CONFIG.worldHeight / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = (col + 0.5) * cellWidth;
      const y = (row + 0.5) * cellHeight;
      const boid = createMockBoid(x, y, variant);
      setupBoidMocks(boid, variant, x, y);
      boids.push(boid);
    }
  }

  return boids;
}

/**
 * Creates a random distribution of boids
 * @param count Number of boids to create
 * @param variant Type of boids to create
 * @returns Array of randomly positioned boids
 */
export function createRandomBoids(count: number, variant: BoidVariant): IBoid[] {
  const boids: IBoid[] = [];

  for (let i = 0; i < count; i++) {
    const x = Math.random() * TEST_SPATIAL_CONFIG.worldWidth;
    const y = Math.random() * TEST_SPATIAL_CONFIG.worldHeight;
    const boid = createMockBoid(x, y, variant);
    setupBoidMocks(boid, variant, x, y);
    boids.push(boid);
  }

  return boids;
}

/**
 * Creates a cluster of boids around a center point
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 * @param count Number of boids in cluster
 * @param radius Radius of cluster
 * @param variant Type of boids to create
 * @returns Array of boids clustered around center point
 */
export function createBoidCluster(
  centerX: number,
  centerY: number,
  count: number,
  radius: number,
  variant: BoidVariant
): IBoid[] {
  const boids: IBoid[] = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    const boid = createMockBoid(x, y, variant);
    setupBoidMocks(boid, variant, x, y);
    boids.push(boid);
  }

  return boids;
}

/**
 * Measures performance of spatial operations
 * @param operation Function to measure
 * @returns Duration in milliseconds
 */
export function measurePerformance(operation: () => void): number {
  const startTime = performance.now();
  operation();
  return performance.now() - startTime;
}
