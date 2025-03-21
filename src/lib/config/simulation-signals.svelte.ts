import { EventBus } from '$events/event-bus';
import type { BoidConfig, SimulationConfig } from '$config/types';
import { toast } from 'svelte-sonner';

const simulationSpeeds = [0.2, 0.5, 1.0, 1.5, 2.0, 3.0] as const;
export type SimulationSpeed = (typeof simulationSpeeds)[number];

// Default configuration with values from BoidConfigPanel.svelte
const DEFAULT_BOID_CONFIG: BoidConfig = {
	alignmentWeight: { default: 1.0, min: 0.0, max: 2.0, step: 0.1 },
	cohesionWeight: { default: 1.0, min: 0.0, max: 2.0, step: 0.1 },
	separationWeight: { default: 1.5, min: 0.0, max: 3.0, step: 0.1 },
	perceptionRadius: { default: 25, min: 5, max: 200, step: 5 },
	separationRadius: { default: 30, min: 10, max: 100, step: 5 },
	boundaryMargin: { default: 150, min: 50, max: 200, step: 10 },
	boundaryForceMultiplier: { default: 2.0, min: 1.0, max: 5.0, step: 0.1 },
	boundaryForceRamp: { default: 2.5, min: 1.0, max: 4.0, step: 0.1 },
	obstaclePerceptionRadius: { default: 150, min: 50, max: 250, step: 10 },
	obstacleForceMultiplier: { default: 4.0, min: 1.0, max: 6.0, step: 0.2 },
	maxSpeed: { default: 100, min: 50, max: 300, step: 10 },
	maxForce: { default: 1.0, min: 0.2, max: 3.0, step: 0.1 }
};

// Default configuration with values from SimulationControls.svelte
const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
	initialPreyCount: { default: 50, min: 0, max: 500, step: 1 },
	initialPredatorCount: { default: 5, min: 0, max: 500, step: 1 },
	obstacleCount: { default: 0, min: 0, max: 20, step: 1 },
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

$effect.root(() => {
	// Set up effects to emit events when config changes
	$effect(() => {
		const config = boidConfig;

		// Emit individual config change events
		EventBus.emit('alignment-weight-changed', { value: config.alignmentWeight.default });
		EventBus.emit('cohesion-weight-changed', { value: config.cohesionWeight.default });
		EventBus.emit('separation-weight-changed', { value: config.separationWeight.default });
		EventBus.emit('perception-radius-changed', { value: config.perceptionRadius.default });
		EventBus.emit('separation-radius-changed', { value: config.separationRadius.default });
		EventBus.emit('boundary-margin-changed', { value: config.boundaryMargin.default });
		EventBus.emit('boundary-force-changed', { value: config.boundaryForceMultiplier.default });
		EventBus.emit('boundary-force-ramp-changed', { value: config.boundaryForceRamp.default });
		EventBus.emit('obstacle-perception-radius-changed', {
			value: config.obstaclePerceptionRadius.default
		});
		EventBus.emit('obstacle-force-changed', { value: config.obstacleForceMultiplier.default });
		EventBus.emit('max-speed-changed', { value: config.maxSpeed.default });
		EventBus.emit('max-force-changed', { value: config.maxForce.default });

		// Also emit a composite event for efficient handling
		EventBus.emit('boid-config-changed', { config });
	});

	$effect(() => {
		const config = simulationConfig;

		// Emit individual config change events
		EventBus.emit('initial-prey-count-changed', { value: config.initialPreyCount.default });
		EventBus.emit('initial-predator-count-changed', { value: config.initialPredatorCount.default });
		EventBus.emit('obstacle-count-changed', { value: config.obstacleCount.default });
		EventBus.emit('track-stats-changed', { value: config.trackStats.default });

		// Also emit a composite event
		EventBus.emit('simulation-config-changed', { config });
	});

	$effect(() => {
		if (isPlaying) {
			EventBus.emit('simulation-resumed', undefined);
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
	toast.error('Configuration Reset', {
		description: 'All parameters restored to their default values'
	});
}

function togglePlayPause() {
	isPlaying = !isPlaying;
	if (isPlaying) {
		toast.success('Simulation Resumed', {
			description: 'Boid behavior will now update'
		});
	} else {
		toast.warning('Simulation Paused', {
			description: 'Boid behavior frozen until resumed',
			duration: 8000
		});
	}
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
	EventBus.emit('simulation-reset', undefined);
	toast.error('Simulation Reset', {
		description: `Restarting with ${simulationConfig.initialPreyCount.default} prey and ${simulationConfig.initialPredatorCount.default} predators`
	});
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
