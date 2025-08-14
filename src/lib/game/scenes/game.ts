import { Scene } from 'phaser';
import { PhaserFlock } from '$boid/phaser-flock';
import { BoidFactory } from '$boid/boid-factory';
import { type IGameEventBus } from '$events/types';
import { BackgroundManager } from '$game/managers/background-manager';
import { ObstacleManager } from '$game/managers/obstacle-manager';
import { DebugManager } from '$game/managers/debug-manager';
import { EffectsManager } from '$game/managers/effects-manager';
import {
	getBoidConfig,
	getSimulationConfig,
	getCurrentStrategy
} from '$config/simulation-signals.svelte';
import { createCompleteDependencies } from '$adapters';
import type { SimulationFlavor } from '$boid/animation/types';
import { EventBus } from '$events/event-bus';
import type { BoidConfig, BoundaryMode, SimulationConfig } from '$config/types';
import type { IFlockingConfig } from '$interfaces/flocking';
import type { ISimulationModeStrategy } from '$interfaces/strategy';

/**
 * Main game scene that coordinates all game components
 */
export class Game extends Scene {
	// Core components
	private eventEmitter!: IGameEventBus;
	private boidFactory!: BoidFactory;
	private flock!: PhaserFlock;

	// Managers
	private backgroundManager!: BackgroundManager;
	private obstacleManager!: ObstacleManager;
	private debugManager!: DebugManager;
	private effectsManager!: EffectsManager;

	// Configuration and state
	private boidConfig: Partial<BoidConfig> = getBoidConfig();
	private simulationConfig: Partial<SimulationConfig> = getSimulationConfig();
	private strategy: ISimulationModeStrategy = getCurrentStrategy();
	private simulationActive = true;
	private simulationSpeed = 1;

	constructor() {
		super('Game');
	}

	create(): void {
		// Connect scene to EventBus
		EventBus.connectScene(this);

		this.initializeComponents();
		this.setupEventListeners();
		this.emitWorldBounds();
		this.setupResizeListener();
		this.startSimulation();
	}

	private initializeComponents(): void {
		const dependencies = createCompleteDependencies(this);
		this.eventEmitter = dependencies.eventEmitter;

		// Create base configuration
		const flockingConfig: IFlockingConfig = {
			alignmentWeight: this.boidConfig.alignmentWeight?.default ?? 1.0,
			cohesionWeight: this.boidConfig.cohesionWeight?.default ?? 1.0,
			separationWeight: this.boidConfig.separationWeight?.default ?? 1.0,
			perceptionRadius: this.boidConfig.perceptionRadius?.default ?? 50,
			separationRadius: this.boidConfig.separationRadius?.default ?? 50,
			boundaryMargin: this.boidConfig.boundaryMargin?.default ?? 50,
			boundaryForceMultiplier: this.boidConfig.boundaryForceMultiplier?.default ?? 2.0,
			boundaryForceRamp: this.boidConfig.boundaryForceRamp?.default ?? 2.5,
			boundaryMode: (this.simulationConfig.boundaryMode?.default ?? 'collidable') as BoundaryMode,
			boundaryStuckThreshold: this.simulationConfig.boundaryStuckThreshold?.default ?? 3000
		};

		// Create managers
		this.backgroundManager = new BackgroundManager(this);
		this.obstacleManager = new ObstacleManager(this);
		this.debugManager = new DebugManager(this, this.eventEmitter, flockingConfig);
		this.effectsManager = new EffectsManager(this, this.eventEmitter);

		// Create boid factory with dependencies (config will be passed during creation)
		const vectorFactory = dependencies.vectorFactory;
		this.boidFactory = new BoidFactory(this, {
			vectorFactory,
			eventEmitter: this.eventEmitter,
			random: dependencies.random,
			time: dependencies.time,
			physics: dependencies.physics
		});

		// Create flock with strategy
		this.flock = new PhaserFlock(this, this.eventEmitter, this.strategy, flockingConfig);
	}

	private setupEventListeners(): void {
		// Simulation control events
		this.eventEmitter.on('simulation-paused', () => {
			this.simulationActive = false;
			this.scene.pause();
		});
		this.eventEmitter.on('simulation-resumed', () => {
			this.simulationActive = true;
			this.scene.resume();
		});
		this.eventEmitter.on('simulation-restart', () => this.resetSimulation());
		this.eventEmitter.on('simulation-speed-changed', ({ value }) => (this.simulationSpeed = value));

		// Configuration events
		this.eventEmitter.on('boid-config-changed', ({ config }) => (this.boidConfig = config));
		this.eventEmitter.on('simulation-config-changed', ({ config }) => {
			this.simulationConfig = config;
			this.obstacleManager.updateObstacles(config.obstacleCount.default);

			// Update background when flavor changes
			if (config.simulationFlavor) {
				this.backgroundManager.updateFlavor(config.simulationFlavor.default as SimulationFlavor);
			}
		});

		// Debug events
		this.eventEmitter.on('debug-toggle', ({ enabled }) => this.debugManager.setEnabled(enabled));

		// Theme change events
		this.eventEmitter.on('theme-changed', ({ isDark }) => {
			this.backgroundManager.updateTheme(isDark);
		});

		// Collision events
		this.eventEmitter.on('boundary-collision', ({ boid, boundary }) => {
			this.effectsManager.createCollisionEffect(boid, boundary);
		});

		// Spawn control event
		this.eventEmitter.on('spawn-boids-requested', () => {
			this.spawnInitialBoids();
		});

		// Simulation mode change event
		this.eventEmitter.on('simulation-mode-changed', () => {
			// Update strategy when mode changes
			this.strategy = getCurrentStrategy();
		});
	}

	private emitWorldBounds(): void {
		const width = this.scale.width;
		const height = this.scale.height;

		this.eventEmitter.emit('world-bounds-initialized', { width, height });
	}

	private setupResizeListener(): void {
		// Listen for resize events from the scene
		this.scale.on('resize', () => {
			const width = this.scale.width;
			const height = this.scale.height;

			this.eventEmitter.emit('world-bounds-changed', { width, height });
		});
	}

	private startSimulation(): void {
		// Create obstacles
		this.obstacleManager.updateObstacles(this.simulationConfig.obstacleCount?.default ?? 0);

		// Notify scene is ready (but don't spawn boids yet - wait for spawn event)
		this.eventEmitter.emit('scene-ready', { scene: this });
		this.eventEmitter.emit('game-started', undefined);
	}

	private spawnInitialBoids(): void {
		const margin = 50;
		const bounds = {
			minX: margin,
			maxX: this.scale.width - margin,
			minY: margin,
			maxY: this.scale.height - margin
		};

		// Use strategy to calculate spawn counts
		const spawnConfig = this.strategy.calculateSpawnCounts(
			this.simulationConfig as SimulationConfig
		);

		// Create boids based on strategy
		const prey = this.boidFactory.createPreys(spawnConfig.prey, {
			...bounds,
			...this.boidConfig
		});
		const predators = this.boidFactory.createPredators(spawnConfig.predators, {
			...bounds,
			...this.boidConfig
		});

		// Add boids to flock
		[...prey, ...predators].forEach((boid) => this.flock.addBoid(boid));
	}

	private resetSimulation(): void {
		// Clean up existing simulation
		this.flock.destroy();

		// Refresh configuration values and strategy
		this.boidConfig = getBoidConfig();
		this.simulationConfig = getSimulationConfig();
		this.strategy = getCurrentStrategy();

		const flockingConfig: IFlockingConfig = {
			alignmentWeight: this.boidConfig.alignmentWeight?.default ?? 1.0,
			cohesionWeight: this.boidConfig.cohesionWeight?.default ?? 1.0,
			separationWeight: this.boidConfig.separationWeight?.default ?? 1.0,
			perceptionRadius: this.boidConfig.perceptionRadius?.default ?? 50,
			separationRadius: this.boidConfig.separationRadius?.default ?? 50,
			boundaryMargin: this.boidConfig.boundaryMargin?.default ?? 50,
			boundaryForceMultiplier: this.boidConfig.boundaryForceMultiplier?.default ?? 2.0,
			boundaryForceRamp: this.boidConfig.boundaryForceRamp?.default ?? 2.5,
			boundaryMode: (this.simulationConfig.boundaryMode?.default ?? 'collidable') as BoundaryMode,
			boundaryStuckThreshold: this.simulationConfig.boundaryStuckThreshold?.default ?? 3000
		};

		// Create new flock with updated strategy
		this.flock = new PhaserFlock(this, this.eventEmitter, this.strategy, flockingConfig);

		// Start new simulation and immediately spawn boids (restart should restore full simulation)
		this.startSimulation();
		this.spawnInitialBoids();
		this.eventEmitter.emit('game-reset', undefined);
	}

	update(time: number, delta: number): void {
		if (this.simulationActive) {
			// Update flock with adjusted delta time
			this.flock.update(delta * this.simulationSpeed);

			// Update debug visualization
			this.debugManager.update(this.flock.getBoids());
		}
	}

	shutdown(): void {
		this.scale.off('resize');
		// Clean up all components
		this.eventEmitter.destroy();
		this.backgroundManager.destroy();
		this.obstacleManager.destroy();
		this.debugManager.destroy();
		this.flock.destroy();

		// Disconnect scene from EventBus
		EventBus.disconnectScene(this);
	}
}
