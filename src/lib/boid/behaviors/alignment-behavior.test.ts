import { describe, test, expect, beforeEach, vi } from 'vitest';
import { AlignmentBehavior } from './alignment-behavior';
import { TestVectorFactory } from '../../../../tests/implementations/vector';
import { BoidVariant } from '$lib/boid/types';
import { createMockBoid } from '../../../../tests/utils/mock-boid';

describe('AlignmentBehavior', () => {
  let vectorFactory: TestVectorFactory;
  let alignmentBehavior: AlignmentBehavior;
  
  beforeEach(() => {
    vectorFactory = new TestVectorFactory();
    alignmentBehavior = new AlignmentBehavior(vectorFactory, 1.0);
  });
  
  test('should return zero force with no neighbors', () => {
    const boid = createMockBoid(100, 100, BoidVariant.PREY);
    const force = alignmentBehavior.calculate(boid, []);
    
    expect(force.x).toBe(0);
    expect(force.y).toBe(0);
  });
  
  test('should align with neighbors of same type', () => {
    // Create a boid with velocity (1, 0)
    const boid = createMockBoid(100, 100, BoidVariant.PREY);
    const boidVelocity = vectorFactory.create(1, 0);
    vi.spyOn(boid, 'getBoidVelocity').mockReturnValue(boidVelocity);
    
    // Create neighbors with velocity (0, 1)
    const neighbor1 = createMockBoid(120, 100, BoidVariant.PREY);
    const neighborVelocity = vectorFactory.create(0, 1);
    vi.spyOn(neighbor1, 'getBoidVelocity').mockReturnValue(neighborVelocity);
    
    const neighbor2 = createMockBoid(80, 100, BoidVariant.PREY);
    vi.spyOn(neighbor2, 'getBoidVelocity').mockReturnValue(neighborVelocity);
    
    // Calculate alignment force
    const force = alignmentBehavior.calculate(boid, [neighbor1, neighbor2]);
    
    // Force should point upward (toward average neighbor velocity)
    expect(force.x).toBeLessThanOrEqual(0);
    expect(force.y).toBeGreaterThan(0);
  });
  
  test('should ignore neighbors of different type', () => {
    // Create a prey boid with velocity (1, 0)
    const boid = createMockBoid(100, 100, BoidVariant.PREY);
    const boidVelocity = vectorFactory.create(1, 0);
    vi.spyOn(boid, 'getBoidVelocity').mockReturnValue(boidVelocity);
    
    // Create a predator neighbor with different velocity (0, 1)
    const predator = createMockBoid(120, 100, BoidVariant.PREDATOR);
    const predatorVelocity = vectorFactory.create(0, 1);
    vi.spyOn(predator, 'getBoidVelocity').mockReturnValue(predatorVelocity);
    
    // Calculate alignment force
    const force = alignmentBehavior.calculate(boid, [predator]);
    
    // Force should be zero since predator is ignored
    expect(force.x).toBe(0);
    expect(force.y).toBe(0);
  });
  
  test('should respect max force limit', () => {
    const boid = createMockBoid(100, 100, BoidVariant.PREY);
    const maxForce = 0.1;
    vi.spyOn(boid, 'getMaxForce').mockReturnValue(maxForce);
    
    // Create neighbors with high velocity to generate large force
    const neighbor = createMockBoid(120, 100, BoidVariant.PREY);
    const highVelocity = vectorFactory.create(10, 10);
    vi.spyOn(neighbor, 'getBoidVelocity').mockReturnValue(highVelocity);
    
    const force = alignmentBehavior.calculate(boid, [neighbor]);
    
    // Force magnitude should not exceed max force
    expect(force.length()).toBeLessThanOrEqual(maxForce * 1.000001); // Allow for floating point imprecision
  });
  
  test('should apply weight to steering force', () => {
    const weight = 0.5;
    alignmentBehavior = new AlignmentBehavior(vectorFactory, weight);
    
    const boid = createMockBoid(100, 100, BoidVariant.PREY);
    const boidVelocity = vectorFactory.create(1, 0);
    vi.spyOn(boid, 'getBoidVelocity').mockReturnValue(boidVelocity);
    
    const neighbor = createMockBoid(120, 100, BoidVariant.PREY);
    const neighborVelocity = vectorFactory.create(0, 1);
    vi.spyOn(neighbor, 'getBoidVelocity').mockReturnValue(neighborVelocity);
    
    const force = alignmentBehavior.calculate(boid, [neighbor]);
    const unweightedForce = new AlignmentBehavior(vectorFactory, 1).calculate(boid, [neighbor]);
    
    // Force should be half of unweighted force
    expect(force.length()).toBeCloseTo(unweightedForce.length() * weight, 5);
  });
});
