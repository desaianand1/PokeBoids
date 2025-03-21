import type { AllDependencies } from '$interfaces';
import { TestVectorFactory } from '$tests/implementations/vector';
import { TestEventBus } from '$tests/implementations/events';
import {
  TestRandomGenerator,
  TestTimeProvider,
  TestPhysics,
  TestDebugRenderer,
  testRandom,
  testTime,
  testPhysics,
  testDebug
} from '$tests/implementations/system';

/**
 * Default test dependencies for unit testing
 */
export const defaultTestDependencies: AllDependencies = {
  vectorFactory: new TestVectorFactory(),
  eventEmitter: new TestEventBus(),
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
  defaultTestDependencies.eventEmitter = new TestEventBus();
}

/**
 * Helper function to create a fresh set of test dependencies
 * Useful when you need isolated dependencies for a specific test
 */
export function createFreshTestDependencies(): AllDependencies {
  return {
    vectorFactory: new TestVectorFactory(),
    eventEmitter: new TestEventBus(),
    random: new TestRandomGenerator(),
    time: new TestTimeProvider(),
    physics: new TestPhysics(),
    debug: new TestDebugRenderer()
  };
}

// Re-export all test implementations
export {
  TestVectorFactory,
  TestEventBus,
  TestRandomGenerator,
  TestTimeProvider,
  TestPhysics,
  TestDebugRenderer,
  // Singleton instances
  testRandom,
  testTime,
  testPhysics,
  testDebug
};

// Re-export implementation files
export * from '$tests/implementations/vector';
export * from '$tests/implementations/events';
export * from '$tests/implementations/system';
