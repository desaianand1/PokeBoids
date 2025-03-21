import { describe, it, expect, beforeEach } from 'vitest';
import { QuadTreePartitioning } from './quad-tree';
import { createMockBoid } from '$tests/utils/mock-boid';
import { TestVectorFactory } from '$tests/implementations/vector';
import { BoidVariant } from '$boid/types';

describe('QuadTreePartitioning', () => {
  let partitioning: QuadTreePartitioning;
  let vectorFactory: TestVectorFactory;
  
  beforeEach(() => {
    vectorFactory = new TestVectorFactory();
    partitioning = new QuadTreePartitioning(1000, 1000);
  });
  
  it('should insert and find boids', () => {
    // Create test boids
    const boid1 = createMockBoid(100, 100, BoidVariant.PREY);
    const boid2 = createMockBoid(200, 200, BoidVariant.PREY);
    const boid3 = createMockBoid(500, 500, BoidVariant.PREY);
    
    // Insert boids
    partitioning.insert(boid1);
    partitioning.insert(boid2);
    partitioning.insert(boid3);
    
    // Find nearby boids
    const nearby = partitioning.findNearby(vectorFactory.create(150, 150), 100);
    
    // Should find boids 1 and 2, but not 3
    expect(nearby).toHaveLength(2);
    expect(nearby).toContain(boid1);
    expect(nearby).toContain(boid2);
    expect(nearby).not.toContain(boid3);
  });
  
  it('should update with new boids', () => {
    // Create test boids
    const boid1 = createMockBoid(100, 100, BoidVariant.PREY);
    const boid2 = createMockBoid(200, 200, BoidVariant.PREY);
    
    // Insert initial boids
    partitioning.insert(boid1);
    partitioning.insert(boid2);
    
    // Create new boids
    const boid3 = createMockBoid(300, 300, BoidVariant.PREY);
    const boid4 = createMockBoid(400, 400, BoidVariant.PREY);
    
    // Update with new boids
    partitioning.update([boid3, boid4]);
    
    // Find nearby boids
    const nearby = partitioning.findNearby(vectorFactory.create(350, 350), 100);
    
    // Should find boids 3 and 4, but not 1 and 2
    expect(nearby).toHaveLength(2);
    expect(nearby).toContain(boid3);
    expect(nearby).toContain(boid4);
    expect(nearby).not.toContain(boid1);
    expect(nearby).not.toContain(boid2);
  });
  
  it('should update bounds correctly', () => {
    // Create test boids
    const boid1 = createMockBoid(100, 100, BoidVariant.PREY);
    const boid2 = createMockBoid(1100, 1100, BoidVariant.PREY); // Outside initial bounds
    
    // Insert boids
    partitioning.insert(boid1);
    partitioning.insert(boid2); // This should not be inserted (outside bounds)
    
    // Find nearby boids
    let nearby = partitioning.findNearby(vectorFactory.create(100, 100), 50);
    
    // Should only find boid1
    expect(nearby).toHaveLength(1);
    expect(nearby).toContain(boid1);
    
    // Update bounds
    partitioning.updateBounds(2000, 2000);
    
    // Insert boids again
    partitioning.clear();
    partitioning.insert(boid1);
    partitioning.insert(boid2); // Now should be inserted
    
    // Find nearby boids
    nearby = partitioning.findNearby(vectorFactory.create(1100, 1100), 50);
    
    // Should find boid2
    expect(nearby).toHaveLength(1);
    expect(nearby).toContain(boid2);
  });
  
  it('should handle large numbers of boids efficiently', () => {
    // Create many boids
    const boids = [];
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 1000;
      const y = Math.random() * 1000;
      boids.push(createMockBoid(x, y, BoidVariant.PREY));
    }
    
    // Measure time to update and query
    const startTime = performance.now();
    
    // Update with all boids
    partitioning.update(boids);
    
    // Perform multiple queries
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 1000;
      const y = Math.random() * 1000;
      partitioning.findNearby(vectorFactory.create(x, y), 100);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time (adjust threshold as needed)
    expect(duration).toBeLessThan(1000); // 1 second
  });
  
  it('should clear all boids', () => {
    // Create test boids
    const boid1 = createMockBoid(100, 100, BoidVariant.PREY);
    const boid2 = createMockBoid(200, 200, BoidVariant.PREY);
    
    // Insert boids
    partitioning.insert(boid1);
    partitioning.insert(boid2);
    
    // Clear
    partitioning.clear();
    
    // Find nearby boids
    const nearby = partitioning.findNearby(vectorFactory.create(150, 150), 100);
    
    // Should find no boids
    expect(nearby).toHaveLength(0);
  });
});
