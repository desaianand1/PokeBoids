import { testVectorFactory } from './vector';
import { TestTypedEventEmitter } from './events';
import { testRandom, testTime, testPhysics, testDebug } from './system';
import type { AllDependencies } from '$lib/interfaces';
import type { BoidEvents } from '$lib/boid/types';

/**
 * Default test dependencies for unit testing
 */
export const defaultTestDependencies: AllDependencies = {
  vectorFactory: testVectorFactory,
  eventEmitter: new TestTypedEventEmitter<BoidEvents>(),
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
import { TestRandomGenerator, TestTimeProvider, TestPhysics, TestDebugRenderer } from './system';
