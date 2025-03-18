import type { GameEvents } from '$adapters/phaser-events';

export interface BoidConfig {
  // Core flocking behavior
  alignmentWeight: number;
  cohesionWeight: number;
  separationWeight: number;

  // Perception
  perceptionRadius: number;
  separationRadius: number;

  // Boundary handling
  boundaryMargin: number;
  boundaryForceMultiplier: number;
  boundaryForceRamp: number;

  // Obstacle avoidance
  obstaclePerceptionRadius: number;
  obstacleForceMultiplier: number;

  // Movement
  maxSpeed: number;
  maxForce: number;
}

export interface SimulationConfig {
  // Simulation settings
  initialPreyCount: number;
  initialPredatorCount: number;

  // Environment settings
  obstacleCount: number;

  // Statistics tracking
  trackStats: boolean;
}

const simulationSpeeds = [0.2, 0.5, 1.0, 1.5, 2.0, 3.0] as const;
export type SimulationSpeed = (typeof simulationSpeeds)[number];

// Default configuration
const DEFAULT_BOID_CONFIG: BoidConfig = {
  alignmentWeight: 1.0,
  cohesionWeight: 1.0,
  separationWeight: 1.5,
  perceptionRadius: 100,
  separationRadius: 50,
  boundaryMargin: 150,
  boundaryForceMultiplier: 5.0,
  boundaryForceRamp: 2.5,
  obstaclePerceptionRadius: 150,
  obstacleForceMultiplier: 4.0,
  maxSpeed: 100,
  maxForce: 5.0
};

const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  initialPreyCount: 50,
  initialPredatorCount: 10,
  obstacleCount: 0,
  trackStats: true
};

// Create state for configuration
let boidConfig = $state<BoidConfig>({ ...DEFAULT_BOID_CONFIG });
let simulationConfig = $state<SimulationConfig>({ ...DEFAULT_SIMULATION_CONFIG });

// Simulation state
let isPlaying = $state(true);
let simulationSpeed = $state<SimulationSpeed>(1.0);
let debugMode = $state(false);

// Create event adapter for configuration changes
const configEventBus: { emit: <K extends keyof GameEvents & string>(event: K, data: GameEvents[K]) => boolean } = {
  emit: <K extends keyof GameEvents & string>(event: K, data: GameEvents[K]) => {
    // In a real implementation, this would communicate with Phaser
    // For now, just return true to indicate success
    console.debug('Emitting event:', event, data);
    return true;
  }
};

$effect.root(() => {
  // Set up effects to emit events when config changes
  $effect(() => {
    const config = boidConfig;

    // Emit individual config change events
    configEventBus.emit('alignment-weight-changed', { value: config.alignmentWeight });
    configEventBus.emit('cohesion-weight-changed', { value: config.cohesionWeight });
    configEventBus.emit('separation-weight-changed', { value: config.separationWeight });
    configEventBus.emit('perception-radius-changed', { value: config.perceptionRadius });
    configEventBus.emit('separation-radius-changed', { value: config.separationRadius });
    configEventBus.emit('boundary-margin-changed', { value: config.boundaryMargin });
    configEventBus.emit('boundary-force-changed', { value: config.boundaryForceMultiplier });
    configEventBus.emit('boundary-force-ramp-changed', { value: config.boundaryForceRamp });
    configEventBus.emit('obstacle-perception-radius-changed', { value: config.obstaclePerceptionRadius });
    configEventBus.emit('obstacle-force-changed', { value: config.obstacleForceMultiplier });
    configEventBus.emit('max-speed-changed', { value: config.maxSpeed });
    configEventBus.emit('max-force-changed', { value: config.maxForce });

    // Also emit a composite event for efficient handling
    configEventBus.emit('boid-config-changed', { config });
  });

  $effect(() => {
    const config = simulationConfig;

    // Emit individual config change events
    configEventBus.emit('initial-prey-count-changed', { value: config.initialPreyCount });
    configEventBus.emit('initial-predator-count-changed', { value: config.initialPredatorCount });
    configEventBus.emit('obstacle-count-changed', { value: config.obstacleCount });
    configEventBus.emit('track-stats-changed', { value: config.trackStats });

    // Also emit a composite event
    configEventBus.emit('simulation-config-changed', { config });
  });

  $effect(() => {
    if (isPlaying) {
      configEventBus.emit('simulation-resumed', undefined);
    } else {
      configEventBus.emit('simulation-paused', undefined);
    }
  });

  $effect(() => {
    configEventBus.emit('simulation-speed-changed', { value: simulationSpeed });
  });

  $effect(() => {
    configEventBus.emit('debug-toggle', { enabled: debugMode });
  });
});

// Functions to update configuration
function updateBoidConfig<K extends keyof BoidConfig>(key: K, value: BoidConfig[K]) {
  boidConfig = { ...boidConfig, [key]: value };
}

function getBoidConfig(): BoidConfig {
  return boidConfig;
}

function updateSimulationConfig<K extends keyof SimulationConfig>(
  key: K,
  value: SimulationConfig[K]
) {
  simulationConfig = { ...simulationConfig, [key]: value };
}

function getSimulationConfig(): SimulationConfig {
  return simulationConfig;
}

function resetToDefaults() {
  boidConfig = { ...DEFAULT_BOID_CONFIG };
  simulationConfig = { ...DEFAULT_SIMULATION_CONFIG };
}

function togglePlayPause() {
  isPlaying = !isPlaying;
}

function isSimulationPlaying(): boolean {
  return isPlaying;
}

function advanceSimulationSpeed(): void {
  const currentIndex = simulationSpeeds.indexOf(simulationSpeed);
  if (currentIndex < simulationSpeeds.length - 1) {
    simulationSpeed = simulationSpeeds[currentIndex + 1];
  }
}

function slowSimulationSpeed(): void {
  const currentIndex = simulationSpeeds.indexOf(simulationSpeed);
  if (currentIndex > 0) {
    simulationSpeed = simulationSpeeds[currentIndex - 1];
  }
}

function getCurrentSimulationSpeed(): SimulationSpeed {
  return simulationSpeed;
}

function getSimulationSpeedRange(): { min: number; max: number } {
  return { min: simulationSpeeds[0], max: simulationSpeeds[simulationSpeeds.length - 1] };
}

function toggleDebugMode() {
  debugMode = !debugMode;
}

function getDebugMode(): boolean {
  return debugMode;
}

function resetSimulation() {
  configEventBus.emit('simulation-reset', undefined);
}

// Export everything
export {
  isSimulationPlaying,
  getCurrentSimulationSpeed,
  getDebugMode,
  updateBoidConfig,
  getBoidConfig,
  updateSimulationConfig,
  getSimulationConfig,
  resetToDefaults,
  togglePlayPause,
  advanceSimulationSpeed,
  slowSimulationSpeed,
  getSimulationSpeedRange,
  toggleDebugMode,
  resetSimulation
};
