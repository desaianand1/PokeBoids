// Re-export all test utilities
export * from './assertions';
export * from './setup';

// Export common test configurations
export const TEST_CONFIG = {
  // Common test dimensions
  WINDOW_WIDTH: 800,
  WINDOW_HEIGHT: 600,
  
  // Common test timeouts
  FRAME_TIME: 16, // 60fps
  ANIMATION_DURATION: 300,
  TRANSITION_DURATION: 150,
  
  // Common test values
  DEFAULT_PRECISION: 0.0001,
  DEFAULT_SEED: 1,
  
  // Common test colors
  COLORS: {
    PREY: 0x00ff7f,
    PREDATOR: 0xff8c00,
    DEBUG: 0xff0000,
    BOUNDARY: 0xffffff
  }
} as const;

// Export common test types
export interface TestContext<T = unknown> {
  deps: AllDependencies;
  data?: T;
}

// Import types
import type { AllDependencies } from '$lib/interfaces';
