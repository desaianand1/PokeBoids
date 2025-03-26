/**
 * Test constants for boid configuration
 */
export const TEST_BOID_CONFIG = {
  // Perception multipliers
  predatorFovMultiplier: { min: 0, max: 2, default: 0.7, step: 0.1 },
  preyFovMultiplier: { min: 0, max: 2, default: 1.3, step: 0.1 },
  predatorPerceptionMultiplier: { min: 0, max: 2, default: 1.3, step: 0.1 },
  preyPerceptionMultiplier: { min: 0, max: 2, default: 0.8, step: 0.1 },
  fieldOfViewAngle: { min: 0, max: Math.PI, default: Math.PI / 4, step: 0.1 },

  // Movement
  maxSpeed: { min: 0, max: 200, default: 100, step: 1 },
  maxForce: { min: 0, max: 2, default: 1.0, step: 0.1 },
  perceptionRadius: { min: 0, max: 300, default: 150, step: 1 },
  separationRadius: { min: 0, max: 100, default: 30, step: 1 },

  // Flocking weights
  alignmentWeight: { min: 0, max: 2, default: 1.0, step: 0.1 },
  cohesionWeight: { min: 0, max: 2, default: 1.0, step: 0.1 },
  separationWeight: { min: 0, max: 2, default: 1.5, step: 0.1 },

  // Boundaries
  boundaryMargin: { min: 0, max: 100, default: 50, step: 1 },
  boundaryForceMultiplier: { min: 0, max: 2, default: 1.0, step: 0.1 },
  boundaryForceRamp: { min: 0, max: 1, default: 0.5, step: 0.1 },

  // Obstacles
  obstaclePerceptionRadius: { min: 0, max: 200, default: 100, step: 1 },
  obstacleForceMultiplier: { min: 0, max: 4, default: 2.0, step: 0.1 }
} as const;

/**
 * Test constants for predator configuration
 */
export const TEST_PREDATOR_CONFIG = {
  ...TEST_BOID_CONFIG,
  maxSpeed: { min: 0, max: 300, default: 150, step: 1 },
  maxForce: { min: 0, max: 4, default: 2.0, step: 0.1 },
  perceptionRadius: { min: 0, max: 400, default: 200, step: 1 },
  attack: { min: 0, max: 20, default: 10, step: 1 }
} as const;

/**
 * Test constants for simulation configuration
 */
export const TEST_SIMULATION_CONFIG = {
  initialPreyCount: { min: 0, max: 100, default: 50, step: 1 },
  initialPredatorCount: { min: 0, max: 20, default: 5, step: 1 },
  obstacleCount: { min: 0, max: 10, default: 3, step: 1 },
  trackStats: { default: true },
  worldWidth: { min: 400, max: 1600, default: 800, step: 100 },
  worldHeight: { min: 300, max: 1200, default: 600, step: 100 }
} as const;

/**
 * Test constants for boid stats
 */
export const TEST_BOID_STATS = {
  health: 100,
  stamina: 100,
  speed: 100,
  reproduction: 0,
  level: 1,
  attack: 10 // For predators
} as const;

/**
 * Test constants for default values
 */
export const TEST_DEFAULTS = {
  boid: {
    maxSpeed: TEST_BOID_CONFIG.maxSpeed.default,
    maxForce: TEST_BOID_CONFIG.maxForce.default,
    perceptionRadius: TEST_BOID_CONFIG.perceptionRadius.default,
    fieldOfViewAngle: TEST_BOID_CONFIG.fieldOfViewAngle.default,
    predatorFovMultiplier: TEST_BOID_CONFIG.predatorFovMultiplier.default,
    preyFovMultiplier: TEST_BOID_CONFIG.preyFovMultiplier.default,
    predatorPerceptionMultiplier: TEST_BOID_CONFIG.predatorPerceptionMultiplier.default,
    preyPerceptionMultiplier: TEST_BOID_CONFIG.preyPerceptionMultiplier.default,
    separationRadius: TEST_BOID_CONFIG.separationRadius.default,
    alignmentWeight: TEST_BOID_CONFIG.alignmentWeight.default,
    cohesionWeight: TEST_BOID_CONFIG.cohesionWeight.default,
    separationWeight: TEST_BOID_CONFIG.separationWeight.default,
    boundaryMargin: TEST_BOID_CONFIG.boundaryMargin.default,
    boundaryForceMultiplier: TEST_BOID_CONFIG.boundaryForceMultiplier.default,
    boundaryForceRamp: TEST_BOID_CONFIG.boundaryForceRamp.default,
    obstaclePerceptionRadius: TEST_BOID_CONFIG.obstaclePerceptionRadius.default,
    obstacleForceMultiplier: TEST_BOID_CONFIG.obstacleForceMultiplier.default
  },
  predator: {
    maxSpeed: TEST_PREDATOR_CONFIG.maxSpeed.default,
    maxForce: TEST_PREDATOR_CONFIG.maxForce.default,
    perceptionRadius: TEST_PREDATOR_CONFIG.perceptionRadius.default,
    attack: TEST_PREDATOR_CONFIG.attack.default
  }
} as const;

/**
 * Test constants for spatial partitioning
 */
export const TEST_SPATIAL_CONFIG = {
  worldWidth: 1000,
  worldHeight: 1000,
  maxObjectsPerNode: 10,
  minNodeSize: 50
} as const;

/**
 * Test constants for vector operations
 */
export const TEST_VECTOR_CONFIG = {
  // Common test coordinates
  origin: { x: 0, y: 0 },
  unitX: { x: 1, y: 0 },
  unitY: { x: 0, y: 1 },
  
  // Common test angles (in radians)
  rightAngle: Math.PI / 2,
  fullCircle: Math.PI * 2,
  
  // Common test distances
  defaultTestRadius: 100,
  defaultTestMargin: 10
} as const;

/**
 * Test constants for time and performance
 */
export const TEST_TIME_CONFIG = {
  defaultFrameTime: 16, // ~60fps
  defaultTimeout: 1000,
  maxTestDuration: 5000
} as const;
