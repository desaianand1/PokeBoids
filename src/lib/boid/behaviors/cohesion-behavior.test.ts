import { describe, test, expect, beforeEach, vi } from 'vitest';
import { CohesionBehavior } from './cohesion-behavior';
import { TestVectorFactory } from '../../../../tests/implementations/vector';
import { BoidVariant } from '$lib/boid/types';
import { createMockBoid } from '../../../../tests/utils/mock-boid';

describe('CohesionBehavior', () => {
  let vectorFactory: TestVectorFactory;
  let cohesionBehavior: CohesionBehavior;
  
  beforeEach(() => {
    vectorFactory = new TestVectorFactory();
    cohesionBehavior = new CohesionBehavior(vectorFactory, 1.0);
  });
  
  test('should return zero force with no neighbors', () => {
    const boid = createMockBoid(100, 100, BoidVariant.PREY);
    const force = cohesionBehavior.calculate(boid, []);
    
    expect(force.x).toBe(0);
    expect(force.y).toBe(0);
  });
  
  test('should steer towards center of neighbors of same type', () => {
    // Create a boid at (0, 0)
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const boidPos = vectorFactory.create(0, 0);
    vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
    
    // Create two neighbors at (10, 0) and (-10, 0)
    const neighbor1 = createMockBoid(10, 0, BoidVariant.PREY);
    const neighbor1Pos = vectorFactory.create(10, 0);
    vi.spyOn(neighbor1, 'getBoidPosition').mockReturnValue(neighbor1Pos);
    
    const neighbor2 = createMockBoid(-10, 0, BoidVariant.PREY);
    const neighbor2Pos = vectorFactory.create(-10, 0);
    vi.spyOn(neighbor2, 'getBoidPosition').mockReturnValue(neighbor2Pos);
    
    // Calculate cohesion force
    const force = cohesionBehavior.calculate(boid, [neighbor1, neighbor2]);
    
    // Center is at (0, 0), so force should be minimal
    expect(force.length()).toBeLessThan(0.0001);
  });
  
  test('should ignore neighbors of different type', () => {
    // Create a prey boid at (0, 0)
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const boidPos = vectorFactory.create(0, 0);
    vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
    
    // Create a predator neighbor at (10, 0)
    const predator = createMockBoid(10, 0, BoidVariant.PREDATOR);
    const predatorPos = vectorFactory.create(10, 0);
    vi.spyOn(predator, 'getBoidPosition').mockReturnValue(predatorPos);
    
    // Calculate cohesion force
    const force = cohesionBehavior.calculate(boid, [predator]);
    
    // Force should be zero since predator is ignored
    expect(force.x).toBe(0);
    expect(force.y).toBe(0);
  });
  
  test('should respect max force limit', () => {
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const maxForce = 0.1;
    vi.spyOn(boid, 'getMaxForce').mockReturnValue(maxForce);
    const boidPos = vectorFactory.create(0, 0);
    vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
    
    // Create a distant neighbor to generate large force
    const neighbor = createMockBoid(1000, 0, BoidVariant.PREY);
    const neighborPos = vectorFactory.create(1000, 0);
    vi.spyOn(neighbor, 'getBoidPosition').mockReturnValue(neighborPos);
    
    const force = cohesionBehavior.calculate(boid, [neighbor]);
    
    // Force magnitude should not exceed max force
    expect(force.length()).toBeLessThanOrEqual(maxForce * 1.000001); // Allow for floating point imprecision
  });
  
  test('should apply weight to steering force', () => {
    const weight = 0.5;
    cohesionBehavior = new CohesionBehavior(vectorFactory, weight);
    
    // Create a boid at (0, 0)
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const boidPos = vectorFactory.create(0, 0);
    vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
    
    // Create a neighbor at (10, 0)
    const neighbor = createMockBoid(10, 0, BoidVariant.PREY);
    const neighborPos = vectorFactory.create(10, 0);
    vi.spyOn(neighbor, 'getBoidPosition').mockReturnValue(neighborPos);
    
    const force = cohesionBehavior.calculate(boid, [neighbor]);
    const unweightedForce = new CohesionBehavior(vectorFactory, 1).calculate(boid, [neighbor]);
    
    // Force should be half of unweighted force
    expect(force.length()).toBeCloseTo(unweightedForce.length() * weight, 5);
  });
  
  test('should steer towards average position of multiple neighbors', () => {
    // Create a boid at (0, 0)
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const boidPos = vectorFactory.create(0, 0);
    vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
    
    // Create three neighbors in a triangle
    const neighbor1 = createMockBoid(10, 0, BoidVariant.PREY);
    const neighbor1Pos = vectorFactory.create(10, 0);
    vi.spyOn(neighbor1, 'getBoidPosition').mockReturnValue(neighbor1Pos);
    
    const neighbor2 = createMockBoid(-5, 8.66, BoidVariant.PREY); // 120 degrees
    const neighbor2Pos = vectorFactory.create(-5, 8.66);
    vi.spyOn(neighbor2, 'getBoidPosition').mockReturnValue(neighbor2Pos);
    
    const neighbor3 = createMockBoid(-5, -8.66, BoidVariant.PREY); // 240 degrees
    const neighbor3Pos = vectorFactory.create(-5, -8.66);
    vi.spyOn(neighbor3, 'getBoidPosition').mockReturnValue(neighbor3Pos);
    
    const force = cohesionBehavior.calculate(boid, [neighbor1, neighbor2, neighbor3]);
    
    // Center of triangle is at (0, 0), so force should be minimal
    expect(force.length()).toBeLessThan(0.0001);
  });
});
