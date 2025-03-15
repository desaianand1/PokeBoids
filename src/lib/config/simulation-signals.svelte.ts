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

$effect.root(() => {
	// Set up effects to emit events when config changes
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

	$effect(() => {
		if (isPlaying) {
			EventBus.emit('simulation-started', undefined);
		} else {
			EventBus.emit('simulation-paused', undefined);
		}
	});

	$effect(() => {
		EventBus.emit('simulation-speed-changed', { value: simulationSpeed });
	});

	$effect(() => {
		EventBus.emit('debug-toggle', { enabled: debugMode });
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
	EventBus.emit('simulation-reset', undefined);
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
