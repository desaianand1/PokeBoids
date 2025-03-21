import { describe, it, expect, beforeEach } from 'vitest';
import { BoidVariant } from '$boid/types';
import { TEST_SPATIAL_CONFIG, TEST_TIME_CONFIG, TEST_VECTOR_CONFIG } from '$tests/utils/constants';
import {
  createSpatialTestContext,
  createRandomBoids,
  createBoidCluster,
  measurePerformance
} from '$tests/utils/setup-spatial';

describe('QuadTreePartitioning', () => {
  const context = createSpatialTestContext();
  
  beforeEach(() => {
    // Reset context before each test
    Object.assign(context, createSpatialTestContext());
  });
  
  it('should find nearby boids', () => {
    // Create a cluster of boids
    const cluster = createBoidCluster(100, 100, 5, 20, BoidVariant.PREY);
    cluster.forEach(boid => context.partitioning.insert(boid));
    
    // Query near the cluster center
    const nearby = context.partitioning.findNearby(
      context.vectorFactory.create(100, 100),
      30 // Radius large enough to find cluster
    );
    
    // Should find all boids in cluster
    expect(nearby.length).toBe(5);
    cluster.forEach(boid => {
      expect(nearby).toContain(boid);
    });
  });
  
  it('should update with new boids', () => {
    // Create two clusters of boids
    const cluster1 = createBoidCluster(100, 100, 5, 50, BoidVariant.PREY);
    const cluster2 = createBoidCluster(300, 300, 5, 50, BoidVariant.PREY);
    
    // Insert first cluster
    cluster1.forEach(boid => context.partitioning.insert(boid));
    
    // Update with second cluster
    context.partitioning.update(cluster2);
    
    // Find nearby boids in second cluster
    const nearby = context.partitioning.findNearby(
      context.vectorFactory.create(300, 300),
      TEST_VECTOR_CONFIG.defaultTestRadius
    );
    
    // Should find only cluster2 boids
    expect(nearby).toHaveLength(5);
    cluster2.forEach(boid => {
      expect(nearby).toContain(boid);
    });
    cluster1.forEach(boid => {
      expect(nearby).not.toContain(boid);
    });
  });
  
  it('should update bounds through events', () => {
    // Create a cluster inside bounds
    const insideCluster = createBoidCluster(100, 100, 5, 50, BoidVariant.PREY);
    
    // Create a cluster outside bounds
    const outsideCluster = createBoidCluster(1100, 1100, 5, 50, BoidVariant.PREY);
    
    // Insert both clusters
    [...insideCluster, ...outsideCluster].forEach(boid => {
      context.partitioning.insert(boid);
    });
    
    // Check inside cluster
    let nearby = context.partitioning.findNearby(
      context.vectorFactory.create(100, 100),
      TEST_VECTOR_CONFIG.defaultTestRadius
    );
    
    // Should only find inside cluster
    expect(nearby).toHaveLength(5);
    insideCluster.forEach(boid => {
      expect(nearby).toContain(boid);
    });
    
    // Emit world bounds changed event
    context.eventBus.emit('world-bounds-changed', { width: 2000, height: 2000 });
    
    // Reinsert both clusters
    [...insideCluster, ...outsideCluster].forEach(boid => {
      context.partitioning.insert(boid);
    });
    
    // Check outside cluster
    nearby = context.partitioning.findNearby(
      context.vectorFactory.create(1100, 1100),
      TEST_VECTOR_CONFIG.defaultTestRadius
    );
    
    // Should find outside cluster
    expect(nearby).toHaveLength(5);
    outsideCluster.forEach(boid => {
      expect(nearby).toContain(boid);
    });
  });
  
  it('should handle large numbers of boids efficiently', () => {
    // Create random boids
    const boids = createRandomBoids(1000, BoidVariant.PREY);
    
    // Measure performance of update and queries
    const duration = measurePerformance(() => {
      // Update with all boids
      context.partitioning.update(boids);
      
      // Perform multiple queries
      for (let i = 0; i < 100; i++) {
        const queryPoint = context.vectorFactory.random()
          .scale(TEST_SPATIAL_CONFIG.worldWidth);
        
        context.partitioning.findNearby(
          queryPoint,
          TEST_VECTOR_CONFIG.defaultTestRadius
        );
      }
    });
    
    // Should complete within reasonable time
    expect(duration).toBeLessThan(TEST_TIME_CONFIG.maxTestDuration);
  });
  
  it('should clear all boids', () => {
    // Create and insert a cluster of boids
    const boids = createBoidCluster(150, 150, 5, 50, BoidVariant.PREY);
    boids.forEach(boid => context.partitioning.insert(boid));
    
    // Verify boids are inserted
    let nearby = context.partitioning.findNearby(
      context.vectorFactory.create(150, 150),
      TEST_VECTOR_CONFIG.defaultTestRadius
    );
    expect(nearby).toHaveLength(5);
    
    // Clear partitioning
    context.partitioning.clear();
    
    // Verify no boids remain
    nearby = context.partitioning.findNearby(
      context.vectorFactory.create(150, 150),
      TEST_VECTOR_CONFIG.defaultTestRadius
    );
    expect(nearby).toHaveLength(0);
  });

  it('should handle world bounds initialization', () => {
    const context = createSpatialTestContext();
    
    // Create a cluster at the edge of the default bounds
    const edgeCluster = createBoidCluster(
      TEST_SPATIAL_CONFIG.worldWidth - 50,
      TEST_SPATIAL_CONFIG.worldHeight - 50,
      5,
      30,
      BoidVariant.PREY
    );
    
    // Insert cluster
    edgeCluster.forEach(boid => context.partitioning.insert(boid));
    
    // Emit initialization event with smaller bounds
    context.eventBus.emit('world-bounds-initialized', { width: 800, height: 600 });
    
    // Query at the edge of new bounds
    const nearby = context.partitioning.findNearby(
      context.vectorFactory.create(750, 550),
      100
    );
    
    // Should not find any boids (they're now outside bounds)
    expect(nearby).toHaveLength(0);
  });
});
