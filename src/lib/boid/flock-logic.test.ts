import { describe, test, expect, beforeEach, vi } from 'vitest';
import { FlockLogic } from './flock-logic';
import { TestVectorFactory } from '../../../tests/implementations/vector';
import { TestEventBus } from '../../../tests/implementations/events';
import { BoidVariant } from './types';
import { createMockBoid } from '../../../tests/utils/mock-boid';

describe('FlockLogic', () => {
  let vectorFactory: TestVectorFactory;
  let eventBus: TestEventBus;
  let flockLogic: FlockLogic;
  
  beforeEach(() => {
    vectorFactory = new TestVectorFactory();
    eventBus = new TestEventBus();
    
    flockLogic = new FlockLogic(vectorFactory, eventBus, {
      alignmentWeight: 1.0,
      cohesionWeight: 1.0,
      separationWeight: 1.5,
      perceptionRadius: 50,
      separationRadius: 30
    });
  });
  
  test('should calculate forces for a boid with neighbors', () => {
    // Create a boid at (0, 0)
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const boidPos = vectorFactory.create(0, 0);
    vi.spyOn(boid, 'getBoidPosition').mockReturnValue(boidPos);
    
    // Create neighbors in a triangle formation
    const neighbor1 = createMockBoid(10, 0, BoidVariant.PREY);
    const neighbor1Pos = vectorFactory.create(10, 0);
    vi.spyOn(neighbor1, 'getBoidPosition').mockReturnValue(neighbor1Pos);
    
    const neighbor2 = createMockBoid(-5, 8.66, BoidVariant.PREY);
    const neighbor2Pos = vectorFactory.create(-5, 8.66);
    vi.spyOn(neighbor2, 'getBoidPosition').mockReturnValue(neighbor2Pos);
    
    const neighbor3 = createMockBoid(-5, -8.66, BoidVariant.PREY);
    const neighbor3Pos = vectorFactory.create(-5, -8.66);
    vi.spyOn(neighbor3, 'getBoidPosition').mockReturnValue(neighbor3Pos);
    
    const force = flockLogic.calculateForces(boid, [neighbor1, neighbor2, neighbor3]);
    
    // Force should be non-zero
    expect(force.length()).toBeGreaterThan(0);
  });
  
  test('should update all boids in the flock', () => {
    // Create test boids
    const boid1 = createMockBoid(0, 0, BoidVariant.PREY);
    const boid2 = createMockBoid(10, 10, BoidVariant.PREY);
    const boid3 = createMockBoid(-10, 10, BoidVariant.PREY);
    
    // Mock applyForce method
    vi.spyOn(boid1, 'applyForce');
    vi.spyOn(boid2, 'applyForce');
    vi.spyOn(boid3, 'applyForce');
    
    // Update flock
    flockLogic.update([boid1, boid2, boid3]);
    
    // Verify forces were applied to all boids
    expect(boid1.applyForce).toHaveBeenCalled();
    expect(boid2.applyForce).toHaveBeenCalled();
    expect(boid3.applyForce).toHaveBeenCalled();
  });
  
  test('should handle empty flock', () => {
    // Update with no boids
    flockLogic.update([]);
    
    // No errors should be thrown
    expect(true).toBe(true);
  });
  
  test('should handle single boid', () => {
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    vi.spyOn(boid, 'applyForce');
    
    flockLogic.update([boid]);
    
    // Force should be applied but should be zero (no neighbors)
    expect(boid.applyForce).toHaveBeenCalled();
    const appliedForce = (boid.applyForce as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(appliedForce.length()).toBe(0);
  });
  
  test('should respect boid type when calculating forces', () => {
    // Create a prey boid
    const prey = createMockBoid(0, 0, BoidVariant.PREY);
    const preyPos = vectorFactory.create(0, 0);
    vi.spyOn(prey, 'getBoidPosition').mockReturnValue(preyPos);
    
    // Create a predator nearby
    const predator = createMockBoid(10, 0, BoidVariant.PREDATOR);
    const predatorPos = vectorFactory.create(10, 0);
    vi.spyOn(predator, 'getBoidPosition').mockReturnValue(predatorPos);
    
    // Calculate forces for prey with predator neighbor
    const force = flockLogic.calculateForces(prey, [predator]);
    
    // Force should be minimal since predator is ignored for basic flocking
    expect(force.length()).toBeLessThan(0.0001);
  });
});
