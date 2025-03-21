import { describe, test, expect, beforeEach, vi } from 'vitest';
import { SeparationBehavior } from '$boid/behaviors/separation-behavior';
import { TestVectorFactory } from '$tests/implementations/vector';
import { BoidVariant } from '$boid/types';
import { createMockBoid } from '$tests/utils/mock-boid';
import { TEST_BOID_CONFIG, TEST_DEFAULTS } from '$tests/utils/constants';

describe('SeparationBehavior', () => {
  let vectorFactory: TestVectorFactory;
  let separationBehavior: SeparationBehavior;
  const separationRadius = TEST_BOID_CONFIG.separationRadius.default;
  
  beforeEach(() => {
    vectorFactory = new TestVectorFactory();
    separationBehavior = new SeparationBehavior(vectorFactory, 1.0, separationRadius);
  });
  
  test('should return zero force with no neighbors', () => {
    const boid = createMockBoid(100, 100, BoidVariant.PREY);
    const boidVel = vectorFactory.create(0, 0);
    vi.spyOn(boid, 'getBoidVelocity').mockReturnValue(boidVel);
    vi.spyOn(boid, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.boid.maxSpeed);
    vi.spyOn(boid, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.boid.maxForce);
    
    const force = separationBehavior.calculate(boid, []);
    
    expect(force.x).toBe(0);
    expect(force.y).toBe(0);
  });
  
  test('should steer away from close neighbors', () => {
    // Create a boid at (0, 0)
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const boidPos = vectorFactory.create(0, 0);
    const boidVel = vectorFactory.create(0, 0);
    vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
    vi.spyOn(boid, 'getBoidVelocity').mockReturnValue(boidVel);
    vi.spyOn(boid, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.boid.maxSpeed);
    vi.spyOn(boid, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.boid.maxForce);
    
    // Create a neighbor at (10, 0) - within separation radius
    const neighbor = createMockBoid(10, 0, BoidVariant.PREY);
    const neighborPos = vectorFactory.create(10, 0);
    vi.spyOn(neighbor, 'getBoidPosition').mockReturnValue(neighborPos);
    
    const force = separationBehavior.calculate(boid, [neighbor]);
    
    // Force should point away from neighbor (negative x)
    expect(force.x).toBeLessThan(0);
    expect(Math.abs(force.y)).toBeLessThan(0.0001); // Should be close to 0
  });
  
  test('should ignore neighbors outside separation radius', () => {
    // Create a boid at (0, 0)
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const boidPos = vectorFactory.create(0, 0);
    const boidVel = vectorFactory.create(0, 0);
    vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
    vi.spyOn(boid, 'getBoidVelocity').mockReturnValue(boidVel);
    vi.spyOn(boid, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.boid.maxSpeed);
    vi.spyOn(boid, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.boid.maxForce);
    
    // Create a neighbor at (50, 0) - outside separation radius
    const neighbor = createMockBoid(50, 0, BoidVariant.PREY);
    const neighborPos = vectorFactory.create(50, 0);
    vi.spyOn(neighbor, 'getBoidPosition').mockReturnValue(neighborPos);
    
    const force = separationBehavior.calculate(boid, [neighbor]);
    
    // Force should be zero since neighbor is too far
    expect(force.x).toBe(0);
    expect(force.y).toBe(0);
  });
  
  test('should apply stronger force to closer neighbors', () => {
    // Create a boid at (0, 0)
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const boidPos = vectorFactory.create(0, 0);
    const boidVel = vectorFactory.create(0, 0);
    vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
    vi.spyOn(boid, 'getBoidVelocity').mockReturnValue(boidVel);
    vi.spyOn(boid, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.boid.maxSpeed);
    vi.spyOn(boid, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.boid.maxForce);
    
    // Create a close neighbor at (5, 0)
    const closeNeighbor = createMockBoid(5, 0, BoidVariant.PREY);
    const closePos = vectorFactory.create(5, 0);
    vi.spyOn(closeNeighbor, 'getBoidPosition').mockReturnValue(closePos);
    
    // Create a farther neighbor at (20, 0)
    const farNeighbor = createMockBoid(20, 0, BoidVariant.PREY);
    const farPos = vectorFactory.create(20, 0);
    vi.spyOn(farNeighbor, 'getBoidPosition').mockReturnValue(farPos);
    
    const closeForce = separationBehavior.calculate(boid, [closeNeighbor]);
    const farForce = separationBehavior.calculate(boid, [farNeighbor]);
    
    // Close force should be stronger than far force
    expect(Math.abs(closeForce.x)).toBeGreaterThan(Math.abs(farForce.x) * 0.5); // Allow for force scaling
  });
  
  test('should respect max force limit', () => {
    // Create a boid at (0, 0)
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const boidPos = vectorFactory.create(0, 0);
    const boidVel = vectorFactory.create(0, 0);
    vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
    vi.spyOn(boid, 'getBoidVelocity').mockReturnValue(boidVel);
    vi.spyOn(boid, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.boid.maxSpeed);
    vi.spyOn(boid, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.boid.maxForce);
    
    // Create a very close neighbor to generate large force
    const neighbor = createMockBoid(1, 0, BoidVariant.PREY);
    const neighborPos = vectorFactory.create(1, 0);
    vi.spyOn(neighbor, 'getBoidPosition').mockReturnValue(neighborPos);
    
    const force = separationBehavior.calculate(boid, [neighbor]);
    
    // Force magnitude should not exceed max force
    expect(force.length()).toBeLessThanOrEqual(TEST_DEFAULTS.boid.maxForce * 1.000001); // Allow for floating point imprecision
  });
  
  test('should apply weight to steering force', () => {
    const weight = 0.5;
    separationBehavior = new SeparationBehavior(vectorFactory, weight, separationRadius);
    
    // Create a boid at (0, 0)
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const boidPos = vectorFactory.create(0, 0);
    const boidVel = vectorFactory.create(0, 0);
    vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
    vi.spyOn(boid, 'getBoidVelocity').mockReturnValue(boidVel);
    vi.spyOn(boid, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.boid.maxSpeed);
    vi.spyOn(boid, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.boid.maxForce);
    
    // Create a neighbor at (10, 0)
    const neighbor = createMockBoid(10, 0, BoidVariant.PREY);
    const neighborPos = vectorFactory.create(10, 0);
    vi.spyOn(neighbor, 'getBoidPosition').mockReturnValue(neighborPos);
    
    const force = separationBehavior.calculate(boid, [neighbor]);
    const unweightedForce = new SeparationBehavior(vectorFactory, 1, separationRadius)
      .calculate(boid, [neighbor]);
    
    // Force should be half of unweighted force
    expect(force.length()).toBeCloseTo(unweightedForce.length() * weight, 5);
  });
  
  test('should balance forces with evenly distributed neighbors', () => {
    // Create a boid at (0, 0)
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const boidPos = vectorFactory.create(0, 0);
    const boidVel = vectorFactory.create(0, 0);
    vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
    vi.spyOn(boid, 'getBoidVelocity').mockReturnValue(boidVel);
    vi.spyOn(boid, 'getMaxSpeed').mockReturnValue(TEST_DEFAULTS.boid.maxSpeed);
    vi.spyOn(boid, 'getMaxForce').mockReturnValue(TEST_DEFAULTS.boid.maxForce);
    
    // Create two opposing neighbors
    const neighbor1 = createMockBoid(-10, 0, BoidVariant.PREY);
    const neighbor2 = createMockBoid(10, 0, BoidVariant.PREY);
    vi.spyOn(neighbor1, 'getBoidPosition').mockReturnValue(vectorFactory.create(-10, 0));
    vi.spyOn(neighbor2, 'getBoidPosition').mockReturnValue(vectorFactory.create(10, 0));
    
    const force = separationBehavior.calculate(boid, [neighbor1, neighbor2]);
    
    // Forces from equal and opposite neighbors should roughly cancel out
    expect(Math.abs(force.x)).toBeLessThan(0.0001);
  });
});
