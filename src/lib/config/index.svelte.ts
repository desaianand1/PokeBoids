import { EventBus } from '$game/event-bus';

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

// Default configuration
const DEFAULT_BOID_CONFIG: BoidConfig = {
	alignmentWeight: 1.0,
	cohesionWeight: 1.0,
	separationWeight: 1.5,
	perceptionRadius: 50,
	separationRadius: 30,
	boundaryMargin: 100,
	boundaryForceMultiplier: 3.0,
	boundaryForceRamp: 2.5,
	obstaclePerceptionRadius: 150,
	obstacleForceMultiplier: 4.0,
	maxSpeed: 100,
	maxForce: 1.0
};

const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
	initialPreyCount: 100,
	initialPredatorCount: 0,
	obstacleCount: 0,
	trackStats: true
};

// Create state for configuration
let boidConfig = $state<BoidConfig>({ ...DEFAULT_BOID_CONFIG });
let simulationConfig = $state<SimulationConfig>({ ...DEFAULT_SIMULATION_CONFIG });

export function getBoidConfig() {
	return boidConfig;
}
export function getSimulationConfig() {
	return simulationConfig;
}

// Reset to defaults function
export function resetToDefaults() {
	boidConfig = { ...DEFAULT_BOID_CONFIG };
	simulationConfig = { ...DEFAULT_SIMULATION_CONFIG };
}

// Set up effects to emit events when config changes
$effect.root(() => {
	$effect(() => {
		const config = boidConfig;

		// Emit individual config change events
		EventBus.emit('alignment-weight-changed', { value: config.alignmentWeight });
		EventBus.emit('cohesion-weight-changed', { value: config.cohesionWeight });
		EventBus.emit('separation-weight-changed', { value: config.separationWeight });
		EventBus.emit('perception-radius-changed', { value: config.perceptionRadius });
		EventBus.emit('separation-radius-changed', { value: config.separationRadius });
		EventBus.emit('boundary-margin-changed', { value: config.boundaryMargin });
		EventBus.emit('boundary-force-changed', { value: config.boundaryForceMultiplier });
		EventBus.emit('boundary-force-ramp-changed', { value: config.boundaryForceRamp });
		EventBus.emit('obstacle-perception-radius-changed', { value: config.obstaclePerceptionRadius });
		EventBus.emit('obstacle-force-changed', { value: config.obstacleForceMultiplier });
		EventBus.emit('max-speed-changed', { value: config.maxSpeed });
		EventBus.emit('max-force-changed', { value: config.maxForce });

		// Also emit a composite event for efficient handling
		EventBus.emit('boid-config-changed', { config });
	});

	$effect(() => {
		const config = simulationConfig;

		// Emit individual config change events
		EventBus.emit('initial-prey-count-changed', { value: config.initialPreyCount });
		EventBus.emit('initial-predator-count-changed', { value: config.initialPredatorCount });
		EventBus.emit('obstacle-count-changed', { value: config.obstacleCount });
		EventBus.emit('track-stats-changed', { value: config.trackStats });

		// Also emit a composite event
		EventBus.emit('simulation-config-changed', { config });
	});
});

// Update a single parameter
export function updateBoidConfig<K extends keyof BoidConfig>(key: K, value: BoidConfig[K]) {
	boidConfig = { ...boidConfig, [key]: value };
}

export function updateSimulationConfig<K extends keyof SimulationConfig>(
	key: K,
	value: SimulationConfig[K]
) {
	simulationConfig = { ...simulationConfig, [key]: value };
}
