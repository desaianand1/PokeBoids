import { EventBus } from '$events/event-bus';
import type { BoidConfig, BoundaryMode, SimulationConfig } from '$config/types';
import { toast } from 'svelte-sonner';
import { hasAngleChanged } from '$utils/angles';

const simulationSpeeds = [0.2, 0.5, 1.0, 1.5, 2.0, 3.0] as const;
export type SimulationSpeed = (typeof simulationSpeeds)[number];

const DEFAULT_BOID_CONFIG: BoidConfig = {
	alignmentWeight: { default: 0.7, min: 0.0, max: 2.0, step: 0.1 },
	cohesionWeight: { default: 0.5, min: 0.0, max: 2.0, step: 0.1 },
	separationWeight: { default: 1.2, min: 0.0, max: 2.0, step: 0.1 },
	perceptionRadius: { default: 50, min: 20, max: 250, step: 5 },
	separationRadius: { default: 35, min: 15, max: 100, step: 5 },
	fieldOfViewAngle: {
		default: Math.PI / 6,
		min: Math.PI / 18,
		max: Math.PI * 1.5,
		step: Math.PI / 18
	},
	predatorFovMultiplier: { default: 0.7, min: 0.4, max: 1.5, step: 0.1 },
	preyFovMultiplier: { default: 1.3, min: 0.5, max: 1.5, step: 0.1 },
	predatorPerceptionMultiplier: { default: 1.5, min: 0.7, max: 2.0, step: 0.1 },
	preyPerceptionMultiplier: { default: 1.0, min: 0.5, max: 1.5, step: 0.1 },
	boundaryMargin: { default: 50, min: 25, max: 150, step: 5 },
	boundaryForceMultiplier: { default: 2.0, min: 0.5, max: 3.0, step: 0.1 },
	boundaryForceRamp: { default: 2.0, min: 0.8, max: 3.0, step: 0.1 },
	obstaclePerceptionRadius: { default: 150, min: 50, max: 250, step: 10 },
	obstacleForceMultiplier: { default: 3.0, min: 1.0, max: 4.0, step: 0.5 },
	maxSpeed: { default: 120, min: 40, max: 500, step: 10 },
	maxForce: { default: 1.4, min: 0.5, max: 3.0, step: 0.1 }
};

const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
	initialPreyCount: { default: 100, min: 0, max: 500, step: 1 },
	initialPredatorCount: { default: 5, min: 0, max: 500, step: 1 },
	obstacleCount: { default: 0, min: 0, max: 20, step: 1 },
	simulationFlavor: { default: 'air' },
	trackStats: { default: true },
	boundaryMode: { default: 'collidable' },
	boundaryStuckThreshold: { default: 3000, min: 1000, max: 10000, step: 500 }
};

let boidConfig = $state<BoidConfig>({ ...DEFAULT_BOID_CONFIG });
let simulationConfig = $state<SimulationConfig>({ ...DEFAULT_SIMULATION_CONFIG });

// Simulation state
let isPlaying = $state(true);
const DEFAULT_SIM_SPEED_INDEX = 2;
let simulationSpeedIndex = $state<number>(DEFAULT_SIM_SPEED_INDEX);
const simulationSpeed = $derived<SimulationSpeed>(simulationSpeeds[simulationSpeedIndex]);
let debugMode = $state(false);

// Derived values for change detection
const boidConfigValues = $derived({
	alignmentWeight: boidConfig.alignmentWeight.default,
	cohesionWeight: boidConfig.cohesionWeight.default,
	separationWeight: boidConfig.separationWeight.default,
	perceptionRadius: boidConfig.perceptionRadius.default,
	separationRadius: boidConfig.separationRadius.default,
	fieldOfViewAngle: boidConfig.fieldOfViewAngle.default,
	predatorFovMultiplier: boidConfig.predatorFovMultiplier.default,
	preyFovMultiplier: boidConfig.preyFovMultiplier.default,
	predatorPerceptionMultiplier: boidConfig.predatorPerceptionMultiplier.default,
	preyPerceptionMultiplier: boidConfig.preyPerceptionMultiplier.default,
	boundaryMargin: boidConfig.boundaryMargin.default,
	boundaryForceMultiplier: boidConfig.boundaryForceMultiplier.default,
	boundaryForceRamp: boidConfig.boundaryForceRamp.default,
	obstaclePerceptionRadius: boidConfig.obstaclePerceptionRadius.default,
	obstacleForceMultiplier: boidConfig.obstacleForceMultiplier.default,
	maxSpeed: boidConfig.maxSpeed.default,
	maxForce: boidConfig.maxForce.default
});

const simConfigValues = $derived({
	initialPreyCount: simulationConfig.initialPreyCount.default,
	initialPredatorCount: simulationConfig.initialPredatorCount.default,
	obstacleCount: simulationConfig.obstacleCount.default,
	simulationFlavor: simulationConfig.simulationFlavor.default,
	trackStats: simulationConfig.trackStats.default,
	boundaryMode: simulationConfig.boundaryMode.default,
	boundaryStuckThreshold: simulationConfig.boundaryStuckThreshold.default
});

$effect.root(() => {
	// Emit boid config events only when values change
	$effect(() => {
		const values = boidConfigValues;
		// Emit individual events
		EventBus.emit('alignment-weight-changed', { value: values.alignmentWeight });
		EventBus.emit('cohesion-weight-changed', { value: values.cohesionWeight });
		EventBus.emit('separation-weight-changed', { value: values.separationWeight });
		EventBus.emit('perception-radius-changed', { value: values.perceptionRadius });
		EventBus.emit('separation-radius-changed', { value: values.separationRadius });
		EventBus.emit('field-of-view-angle-changed', { value: values.fieldOfViewAngle });
		EventBus.emit('predator-fov-multiplier-changed', { value: values.predatorFovMultiplier });
		EventBus.emit('prey-fov-multiplier-changed', { value: values.preyFovMultiplier });
		EventBus.emit('predator-perception-multiplier-changed', {
			value: values.predatorPerceptionMultiplier
		});
		EventBus.emit('prey-perception-multiplier-changed', { value: values.preyPerceptionMultiplier });
		EventBus.emit('boundary-margin-changed', { value: values.boundaryMargin });
		EventBus.emit('boundary-force-changed', { value: values.boundaryForceMultiplier });
		EventBus.emit('boundary-force-ramp-changed', { value: values.boundaryForceRamp });
		EventBus.emit('obstacle-perception-radius-changed', { value: values.obstaclePerceptionRadius });
		EventBus.emit('obstacle-force-changed', { value: values.obstacleForceMultiplier });
		EventBus.emit('max-speed-changed', { value: values.maxSpeed });
		EventBus.emit('max-force-changed', { value: values.maxForce });

		// Emit composite event
		EventBus.emit('boid-config-changed', { config: boidConfig });
	});

	// Emit simulation config events only when values change
	$effect(() => {
		const values = simConfigValues;

		// Emit individual events
		EventBus.emit('initial-prey-count-changed', { value: values.initialPreyCount });
		EventBus.emit('initial-predator-count-changed', { value: values.initialPredatorCount });
		EventBus.emit('obstacle-count-changed', { value: values.obstacleCount });
		EventBus.emit('simulation-flavor-changed', { flavor: values.simulationFlavor });
		EventBus.emit('track-stats-changed', { value: values.trackStats });
		EventBus.emit('boundary-mode-changed', { value: values.boundaryMode as BoundaryMode });
		EventBus.emit('boundary-stuck-threshold-changed', { value: values.boundaryStuckThreshold });

		// Emit composite event
		EventBus.emit('simulation-config-changed', { config: simulationConfig });
	});

	// Emit play/pause events
	$effect(() => {
		EventBus.emit(isPlaying ? 'simulation-resumed' : 'simulation-paused', undefined);
	});

	// Emit simulation speed events
	$effect(() => {
		EventBus.emit('simulation-speed-changed', { value: simulationSpeed });
	});

	// Emit debug mode events
	$effect(() => {
		EventBus.emit('debug-toggle', { enabled: debugMode });
	});
});

function updateBoidConfig<K extends keyof BoidConfig>(key: K, value: BoidConfig[K]) {
	// Skip update if no meaningful change
    const currentValue = boidConfig[key];
    if ('default' in currentValue && 'default' in value) {
        // Special handling for angle parameters
        if (key === 'fieldOfViewAngle') {
            if (hasAngleChanged(currentValue.default, value.default)) {
                boidConfig = { ...boidConfig, [key]: value };
            }
        } else {
            // For non-angle values, use small threshold epsilon
            const threshold = 0.0001;
            if (Math.abs(currentValue.default - value.default) > threshold) {
                boidConfig = { ...boidConfig, [key]: value };
            }
        }
    }
}

function getBoidConfig(): BoidConfig {
	return boidConfig;
}

function updateSimulationConfig<K extends keyof SimulationConfig>(
	key: K,
	value: SimulationConfig[K]
) {
	// Only update if value has actually changed
	const currentValue = simulationConfig[key];
	if ('default' in currentValue && 'default' in value && currentValue.default !== value.default) {
		simulationConfig = { ...simulationConfig, [key]: value };
	}
}

function getSimulationConfig(): SimulationConfig {
	return simulationConfig;
}

function resetToDefaults() {
	boidConfig = { ...DEFAULT_BOID_CONFIG };
	simulationConfig = { ...DEFAULT_SIMULATION_CONFIG };
	simulationSpeedIndex = DEFAULT_SIM_SPEED_INDEX;
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
			duration: 10000
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
