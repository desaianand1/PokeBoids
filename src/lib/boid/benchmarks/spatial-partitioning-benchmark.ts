import { FlockLogic } from '$boid/flock-logic';
import { TestVectorFactory } from '$tests/implementations/vector';
import { TestEventBus } from '$tests/implementations/events';
import { createMockBoid } from '$tests/utils/mock-boid';
import { BoidVariant } from '$boid/types';

/**
 * Simple benchmark to compare performance with and without spatial partitioning
 */
export function runBenchmark(): void {
  const vectorFactory = new TestVectorFactory();
  const eventBus = new TestEventBus();
  
  // Create test configuration
  const config = {
    alignmentWeight: 1.0,
    cohesionWeight: 1.0,
    separationWeight: 1.5,
    perceptionRadius: 150,
    separationRadius: 50
  };
  
  // Create flock logic
  const flockLogic = new FlockLogic(vectorFactory, eventBus, config);
  
  // Emit world bounds
  eventBus.emit('world-bounds-initialized', { width: 2000, height: 2000 });
  
  // Create test boids
  const boids = [];
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * 2000;
    const y = Math.random() * 2000;
    boids.push(createMockBoid(x, y, BoidVariant.PREY));
  }
  
  // Run benchmark
  console.time('Update 500 boids');
  for (let i = 0; i < 100; i++) {
    flockLogic.update(boids);
    
    // Move boids randomly to simulate real movement
    for (const boid of boids) {
      const pos = boid.getBoidPosition();
      const newX = pos.x + (Math.random() * 10 - 5);
      const newY = pos.y + (Math.random() * 10 - 5);
      boid.setBoidPosition(vectorFactory.create(newX, newY));
    }
  }
  console.timeEnd('Update 500 boids');
  
  // Clean up
  flockLogic.destroy();
}

/**
 * Run the benchmark and return results
 */
export function getBenchmarkResults(): { 
  totalTime: number;
  averageFrameTime: number;
  boidsCount: number;
  framesCount: number;
} {
  const startTime = performance.now();
  
  const vectorFactory = new TestVectorFactory();
  const eventBus = new TestEventBus();
  
  const config = {
    alignmentWeight: 1.0,
    cohesionWeight: 1.0,
    separationWeight: 1.5,
    perceptionRadius: 150,
    separationRadius: 50
  };
  
  const flockLogic = new FlockLogic(vectorFactory, eventBus, config);
  eventBus.emit('world-bounds-initialized', { width: 2000, height: 2000 });
  
  const boids = [];
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * 2000;
    const y = Math.random() * 2000;
    boids.push(createMockBoid(x, y, BoidVariant.PREY));
  }
  
  const frames = 100;
  const frameTimes: number[] = [];
  
  for (let i = 0; i < frames; i++) {
    const frameStart = performance.now();
    
    flockLogic.update(boids);
    
    // Move boids randomly
    for (const boid of boids) {
      const pos = boid.getBoidPosition();
      const newX = pos.x + (Math.random() * 10 - 5);
      const newY = pos.y + (Math.random() * 10 - 5);
      boid.setBoidPosition(vectorFactory.create(newX, newY));
    }
    
    frameTimes.push(performance.now() - frameStart);
  }
  
  flockLogic.destroy();
  
  const totalTime = performance.now() - startTime;
  const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frames;
  
  return {
    totalTime,
    averageFrameTime,
    boidsCount: boids.length,
    framesCount: frames
  };
}
