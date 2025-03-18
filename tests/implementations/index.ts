import { TestVectorFactory } from '$tests/implementations/vector';
import { TestTypedEventEmitter } from '$adapters/phaser-events';
import { TestRandomGenerator, TestTimeProvider, TestPhysics, TestDebugRenderer } from '$tests/implementations/system';
import type { AllDependencies } from '$interfaces';
import type {  } from '$boid/types';

/**
 * Default test dependencies for unit testing
 */
export const defaultTestDependencies: AllDependencies = {
  vectorFactory: TestVectorFactory,
  eventEmitter: new TestTypedEventEmitter<GameEvents>(),
  random: testRandom,
  time: testTime,
  physics: testPhysics,
  debug: testDebug
};

/**
 * Helper function to reset all test dependencies to their initial state
 */
export function resetTestDependencies(): void {
  testRandom.reset();
  testTime.reset();
  testDebug.reset();
  defaultTestDependencies.eventEmitter = new TestTypedEventEmitter<BoidEvents>();
}

/**
 * Helper function to create a fresh set of test dependencies
 * Useful when you need isolated dependencies for a specific test
 */
export function createFreshTestDependencies(): AllDependencies {
  return {
    vectorFactory: new TestVectorFactory(),
    eventEmitter: new TestTypedEventEmitter<BoidEvents>(),
    random: new TestRandomGenerator(),
    time: new TestTimeProvider(),
    physics: new TestPhysics(),
    debug: new TestDebugRenderer()
  };
}

// Re-export all test implementations
export * from './vector';
export * from './events';
export * from './system';

// Import types for createFreshTestDependencies
import { TestVectorFactory } from './vector';
import { TestRandomGenerator, TestTimeProvider, TestPhysics, TestDebugRenderer } from './system';import type { GameEvents } from '$adapters';

