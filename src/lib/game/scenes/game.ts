import { Scene } from 'phaser';
import { PhaserFlock } from '$boid/phaser-flock';
import { BoidFactory } from '$boid/boid-factory';
import { type IGameEventBus } from '$adapters/phaser-events';
import { BackgroundManager } from '$game/background-manager';
import { ObstacleManager } from '$game/obstacle-manager';
import { DebugManager } from '$game/debug-manager';
import { EffectsManager } from '$game/effects-manager';
import { getBoidConfig, getSimulationConfig } from '$config/simulation-signals.svelte';
import { createCompleteDependencies } from '$adapters';
import { EventBus } from '$events/event-bus';
import type { BoidConfig, SimulationConfig } from '$config/types';

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
		this.startSimulation();
	}

	private initializeComponents(): void {
		const dependencies = createCompleteDependencies(this);
		this.eventEmitter = dependencies.eventEmitter;

		// Create managers
		this.backgroundManager = new BackgroundManager(this);
		this.obstacleManager = new ObstacleManager(this);
		this.debugManager = new DebugManager(this);
		this.effectsManager = new EffectsManager(this);

		// Create boid factory
		const vectorFactory = dependencies.vectorFactory;
		this.boidFactory = new BoidFactory(this, {
			vectorFactory,
			eventEmitter: this.eventEmitter,
			random: dependencies.random,
			time: dependencies.time,
			physics: dependencies.physics,
			config: this.boidConfig
		});

		// Create flock
		this.flock = new PhaserFlock(this, this.eventEmitter, {
			alignmentWeight: this.boidConfig.alignmentWeight?.default ?? 1.0,
			cohesionWeight: this.boidConfig.cohesionWeight?.default ?? 1.0,
			separationWeight: this.boidConfig.separationWeight?.default ?? 1.5,
			perceptionRadius: this.boidConfig.perceptionRadius?.default ?? 150,
			separationRadius: this.boidConfig.separationRadius?.default ?? 50
		});
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
		this.eventEmitter.on('simulation-reset', () => this.resetSimulation());
		this.eventEmitter.on('simulation-speed-changed', ({ value }) => (this.simulationSpeed = value));

		// Configuration events
		this.eventEmitter.on('boid-config-changed', ({ config }) => (this.boidConfig = config));
		this.eventEmitter.on('simulation-config-changed', ({ config }) => {
			this.simulationConfig = config;
			this.obstacleManager.updateObstacles(config.obstacleCount.default);
		});

		// Debug events
		this.eventEmitter.on('debug-toggle', ({ enabled }) => this.debugManager.setEnabled(enabled));

		// Collision events
		this.eventEmitter.on('boundary-collision', ({ boid, boundary }) => {
			this.effectsManager.createCollisionEffect(boid, boundary);
		});
	}

	private startSimulation(): void {
		const margin = 50;
		const bounds = {
			minX: margin,
			maxX: this.scale.width - margin,
			minY: margin,
			maxY: this.scale.height - margin
		};

		// Create initial boids
		const prey = this.boidFactory.createPreys(
			this.simulationConfig.initialPreyCount?.default ?? 0,
			bounds
		);
		const predators = this.boidFactory.createPredators(
			this.simulationConfig.initialPredatorCount?.default ?? 0,
			bounds
		);

		// Add boids to flock
		[...prey, ...predators].forEach((boid) => this.flock.addBoid(boid));

		// Create obstacles
		this.obstacleManager.updateObstacles(this.simulationConfig.obstacleCount?.default ?? 0);

		// Notify scene is ready
		this.eventEmitter.emit('scene-ready', { scene: this });
		this.eventEmitter.emit('game-started', undefined);
	}

	private resetSimulation(): void {
		// Clean up existing simulation
		this.flock.destroy();

		// Create new flock
		this.flock = new PhaserFlock(this, this.eventEmitter, {
			alignmentWeight: this.boidConfig.alignmentWeight?.default ?? 1.0,
			cohesionWeight: this.boidConfig.cohesionWeight?.default ?? 1.0,
			separationWeight: this.boidConfig.separationWeight?.default ?? 1.5,
			perceptionRadius: this.boidConfig.perceptionRadius?.default ?? 150,
			separationRadius: this.boidConfig.separationRadius?.default ?? 50
		});

		// Start new simulation
		this.startSimulation();
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
