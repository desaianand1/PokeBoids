import type { GameEvents } from '$adapters/phaser-events';

type Parameter<T> = T extends boolean
	? { default: boolean }
	: { min: T; max: T; default: T; step?: T };

type BoidConfigValues = {
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
};

interface SimulationConfigValues {
	// Simulation settings
	initialPreyCount: number;
	initialPredatorCount: number;

	// Environment settings
	obstacleCount: number;

	// Statistics tracking
	trackStats: boolean;
}

export type BoidConfig = {
	[K in keyof BoidConfigValues]: Parameter<BoidConfigValues[K]>;
};

export type SimulationConfig = {
	[K in keyof SimulationConfigValues]: Parameter<SimulationConfigValues[K]>;
};

const simulationSpeeds = [0.2, 0.5, 1.0, 1.5, 2.0, 3.0] as const;
export type SimulationSpeed = (typeof simulationSpeeds)[number];

// Default configuration
//TODO: Update default config with min/max/step values from the corresponding BoidConfigPanel values
const DEFAULT_BOID_CONFIG: BoidConfig = {
	alignmentWeight: { default: 1.0, min: 0.0, max: 5.0 },
	cohesionWeight: { default: 1.0, min: 0.0, max: 5.0 },
	separationWeight: { default: 1.5, min: 0.0, max: 5.0 },
	perceptionRadius: { default: 100, min: 0, max: 200 },
	separationRadius: { default: 30, min: 0, max: 100 },
	boundaryMargin: { default: 150, min: 50, max: 1000 },
	boundaryForceMultiplier: { default: 5.0, min: 1.0, max: 10.0 },
	boundaryForceRamp: { default: 2.5, min: 1.0, max: 5.0, step: 0.5 },
	obstaclePerceptionRadius: { default: 150, min: 100, max: 1000 },
	obstacleForceMultiplier: { default: 4.0, min: 1.0, max: 10.0 },
	maxSpeed: { default: 100, min: 10, max: 1000 },
	maxForce: { default: 5, min: 1, max: 10 }
};

//TODO: Update default config with min/max/step values from the corresponding SimulationControls values
const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
	initialPreyCount: { default: 50, min: 0, max: 100 },
	initialPredatorCount: { default: 5, min: 0, max: 20 },
	obstacleCount: { default: 0, min: 0, max: 20 },
	trackStats: { default: true }
};

// Create state for configuration
let boidConfig = $state<BoidConfig>({ ...DEFAULT_BOID_CONFIG });
let simulationConfig = $state<SimulationConfig>({ ...DEFAULT_SIMULATION_CONFIG });

// Simulation state
let isPlaying = $state(true);
let simulationSpeedIndex = $state<number>(2);
const simulationSpeed = $derived<SimulationSpeed>(simulationSpeeds[simulationSpeedIndex]);
let debugMode = $state(false);

// Create event adapter for configuration changes
const configEventBus: {
	emit: <K extends keyof GameEvents & string>(event: K, data: GameEvents[K]) => boolean;
} = {
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
		configEventBus.emit('obstacle-perception-radius-changed', {
			value: config.obstaclePerceptionRadius
		});
		configEventBus.emit('obstacle-force-changed', { value: config.obstacleForceMultiplier });
		configEventBus.emit('max-speed-changed', { value: config.maxSpeed });
		configEventBus.emit('max-force-changed', { value: config.maxForce.default });

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
	if (simulationSpeedIndex < simulationSpeeds.length - 1) {
		simulationSpeedIndex++;
	}
}

function slowSimulationSpeed(): void {
	if (simulationSpeedIndex > 0) {
		simulationSpeedIndex--;
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
