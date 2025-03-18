import { describe, test, expect, beforeEach, vi } from 'vitest';
import { CompositeBehavior } from './composite-behavior';
import { TestVectorFactory } from '../../../../tests/implementations/vector';
import { BoidVariant } from '$lib/boid/types';
import { createMockBoid } from '../../../../tests/utils/mock-boid';
import type { IFlockingBehavior } from '$lib/interfaces/flocking';
import type { IVector2 } from '$lib/interfaces/vector';

describe('CompositeBehavior', () => {
  let vectorFactory: TestVectorFactory;
  let compositeBehavior: CompositeBehavior;
  let mockBehavior1: IFlockingBehavior;
  let mockBehavior2: IFlockingBehavior;
  
  beforeEach(() => {
    vectorFactory = new TestVectorFactory();
    
    // Create mock behaviors that return predictable forces
    mockBehavior1 = {
      calculate: vi.fn().mockImplementation((): IVector2 => {
        return vectorFactory.create(1, 0); // Unit vector along x-axis
      })
    };
    
    mockBehavior2 = {
      calculate: vi.fn().mockImplementation((): IVector2 => {
        return vectorFactory.create(0, 1); // Unit vector along y-axis
      })
    };
    
    compositeBehavior = new CompositeBehavior(
      [mockBehavior1, mockBehavior2],
      vectorFactory
    );
  });
  
  test('should combine forces from all behaviors', () => {
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const neighbors = [createMockBoid(10, 10, BoidVariant.PREY)];
    
    const force = compositeBehavior.calculate(boid, neighbors);
    
    // Combined force should be (1,1) before normalization
    expect(force.x).toBeGreaterThan(0);
    expect(force.y).toBeGreaterThan(0);
    expect(force.x).toBeCloseTo(force.y, 5); // Should be equal due to unit vectors
  });
  
  test('should call calculate on all behaviors', () => {
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const neighbors = [createMockBoid(10, 10, BoidVariant.PREY)];
    
    compositeBehavior.calculate(boid, neighbors);
    
    expect(mockBehavior1.calculate).toHaveBeenCalledWith(boid, neighbors);
    expect(mockBehavior2.calculate).toHaveBeenCalledWith(boid, neighbors);
  });
  
  test('should respect max force limit', () => {
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const maxForce = 0.1;
    vi.spyOn(boid, 'getMaxForce').mockReturnValue(maxForce);
    
    // Create behaviors that return large forces
    const strongBehavior1: IFlockingBehavior = {
      calculate: () => vectorFactory.create(10, 0)
    };
    
    const strongBehavior2: IFlockingBehavior = {
      calculate: () => vectorFactory.create(0, 10)
    };
    
    const strongCompositeBehavior = new CompositeBehavior(
      [strongBehavior1, strongBehavior2],
      vectorFactory
    );
    
    const force = strongCompositeBehavior.calculate(boid, []);
    
    // Force magnitude should not exceed max force
    expect(force.length()).toBeLessThanOrEqual(maxForce * 1.000001); // Allow for floating point imprecision
  });
  
  test('should handle empty behavior list', () => {
    const emptyCompositeBehavior = new CompositeBehavior([], vectorFactory);
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    
    const force = emptyCompositeBehavior.calculate(boid, []);
    
    expect(force.x).toBe(0);
    expect(force.y).toBe(0);
  });
  
  test('should maintain force direction after normalization', () => {
    // Create behaviors that return forces in specific directions
    const behavior1: IFlockingBehavior = {
      calculate: () => vectorFactory.create(3, 0) // Strong force along x
    };
    
    const behavior2: IFlockingBehavior = {
      calculate: () => vectorFactory.create(0, 1) // Weaker force along y
    };
    
    const directedCompositeBehavior = new CompositeBehavior(
      [behavior1, behavior2],
      vectorFactory
    );
    
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const force = directedCompositeBehavior.calculate(boid, []);
    
    // X component should be larger than Y component after normalization
    expect(Math.abs(force.x)).toBeGreaterThan(Math.abs(force.y));
  });
  
  test('should handle single behavior', () => {
    const singleBehavior: IFlockingBehavior = {
      calculate: () => vectorFactory.create(1, 0)
    };
    
    const singleCompositeBehavior = new CompositeBehavior(
      [singleBehavior],
      vectorFactory
    );
    
    const boid = createMockBoid(0, 0, BoidVariant.PREY);
    const force = singleCompositeBehavior.calculate(boid, []);
    
    // Force should match the single behavior's output
    expect(force.x).toBeGreaterThan(0);
    expect(force.y).toBe(0);
  });
});
