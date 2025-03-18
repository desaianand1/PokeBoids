import { describe, test, expect, beforeEach, vi } from 'vitest';
import { SeparationBehavior } from './separation-behavior';
import { TestVectorFactory } from '../../../../tests/implementations/vector';
import { BoidVariant } from '$lib/boid/types';
import { createMockBoid } from '../../../../tests/utils/mock-boid';

describe('SeparationBehavior', () => {
  let vectorFactory: TestVectorFactory;
  let separationBehavior: SeparationBehavior;
  const separationRadius = 30;
  
  beforeEach(() => {
    vectorFactory = new TestVectorFactory();
    separationBehavior = new SeparationBehavior(vectorFactory, 1.0, separationRadius);
  });
  
  test('should return zero force with no neighbors', () => {
    const boid = createMockBoid(100, 100, BoidVariant.PREY);
    const force = separationBehavior.calculate(boid, []);
    
    expect(force.x).toBe(0);
    expect(force.y).toBe(0);
  });
  
  test('should steer away from close neighbors', () => {
    // Create a boid at (0, 0)
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const boidPos = vectorFactory.create(0, 0);
    vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
    
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
    vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
    
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
    vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
    
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
    expect(Math.abs(closeForce.x)).toBeGreaterThan(Math.abs(farForce.x));
  });
  
  test('should respect max force limit', () => {
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const maxForce = 0.1;
    vi.spyOn(boid, 'getMaxForce').mockReturnValue(maxForce);
    const boidPos = vectorFactory.create(0, 0);
    vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
    
    // Create a very close neighbor to generate large force
    const neighbor = createMockBoid(1, 0, BoidVariant.PREY);
    const neighborPos = vectorFactory.create(1, 0);
    vi.spyOn(neighbor, 'getBoidPosition').mockReturnValue(neighborPos);
    
    const force = separationBehavior.calculate(boid, [neighbor]);
    
    // Force magnitude should not exceed max force
    expect(force.length()).toBeLessThanOrEqual(maxForce * 1.000001); // Allow for floating point imprecision
  });
  
  test('should apply weight to steering force', () => {
    const weight = 0.5;
    separationBehavior = new SeparationBehavior(vectorFactory, weight, separationRadius);
    
    // Create a boid at (0, 0)
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const boidPos = vectorFactory.create(0, 0);
    vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
    
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
  
  test('should handle multiple neighbors', () => {
    // Create a boid at (0, 0)
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const boidPos = vectorFactory.create(0, 0);
    vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
    
    // Create neighbors in a circle around the boid
    const neighbors = [];
    const numNeighbors = 8;
    const radius = 10;
    
    for (let i = 0; i < numNeighbors; i++) {
      const angle = (i / numNeighbors) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      const neighbor = createMockBoid(x, y, BoidVariant.PREY);
      const neighborPos = vectorFactory.create(x, y);
      vi.spyOn(neighbor, 'getBoidPosition').mockReturnValue(neighborPos);
      neighbors.push(neighbor);
    }
    
    const force = separationBehavior.calculate(boid, neighbors);
    
    // With evenly distributed neighbors, net force should be near zero
    expect(force.length()).toBeLessThan(0.0001);
  });
});
