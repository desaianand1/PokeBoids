import { EventBus } from '$game/event-bus';
import { Scene, Input, GameObjects } from 'phaser';
import { Flock } from '$boid/flock';
import { Boid, BoidVariant } from '$boid';
import type { BoidConfig, SimulationConfig } from '$config/index.svelte';

export class Game extends Scene {
	private boids: Boid[] = [];
	private flock!: Flock;
	private background!: Phaser.GameObjects.Image;
	private simulationActive = true;
	private simulationSpeed = 1;
	private obstacleGroup!: Phaser.GameObjects.Group;

	// Configuration parameters
	private boidConfig: Partial<BoidConfig> = {};
	private simulationConfig: Partial<SimulationConfig> = {
		initialPreyCount: 100,
		initialPredatorCount: 0,
		obstacleCount: 0
	};

	// Debug settings
	private debugMode = false;
	private debugGraphics!: Phaser.GameObjects.Graphics;

	constructor() {
		super('Game');
	}

	create() {
		// Create background
		this.background = this.add.image(0, 0, 'day-sky').setOrigin(0.5, 0.5);
		this.scale.on('resize', this.resizeBackground, this);
		this.resizeBackground();

		// Create obstacle group
		this.obstacleGroup = this.add.group();

		// Create debug graphics layer (hidden by default)
		this.debugGraphics = this.add.graphics();

		// Create flock with initial config
		this.flock = new Flock(this, this.boidConfig);

		// Setup event listeners
		this.setupEventListeners();

		// Initialize simulation
		this.initializeSimulation();

		// Notify that scene is ready
		EventBus.emit('scene-ready', { scene: this });
	}

	private setupEventListeners() {
		// Listen for UI control events from Svelte
		EventBus.on(
			'simulation-paused',
			() => {
				this.simulationActive = false;
				EventBus.emit('game-paused', undefined);
			},
			this
		);

		EventBus.on(
			'simulation-started',
			() => {
				this.simulationActive = true;
				EventBus.emit('game-resumed', undefined);
			},
			this
		);

		EventBus.on(
			'simulation-reset',
			() => {
				this.resetSimulation();
			},
			this
		);

		EventBus.on(
			'simulation-speed-changed',
			({ value }) => {
				this.simulationSpeed = value;
			},
			this
		);

		// Listen for configuration changes
		EventBus.on(
			'boid-config-changed',
			({ config }) => {
				this.boidConfig = config;
			},
			this
		);

		EventBus.on(
			'simulation-config-changed',
			({ config }) => {
				this.simulationConfig = config;
			},
			this
		);

		// Listen for debug mode toggle
		EventBus.on(
			'debug-toggle',
			({ enabled }) => {
				this.debugMode = enabled;
				this.debugGraphics.clear();
			},
			this
		);

		// Listen for obstacle count changes
		EventBus.on(
			'obstacle-count-changed',
			({ value }) => {
				this.updateObstacles(value);
			},
			this
		);
	}

	private initializeSimulation() {
		// Create initial boids
		this.createBoids();

		// Create obstacles
		if (this.simulationConfig.obstacleCount) {
			this.createObstacles(this.simulationConfig.obstacleCount);
		}

		// Emit game started event
		EventBus.emit('game-started', undefined);

		// Emit flock data for UI
		EventBus.emit('flock-updated', { count: this.boids.length });
	}

	private createBoids() {
		// Create prey boids
		const preyCount = this.simulationConfig.initialPreyCount || 100;
		for (let i = 0; i < preyCount; i++) {
			this.createBoid(BoidVariant.PREY);
		}

		// Create predator boids if specified
		const predatorCount = this.simulationConfig.initialPredatorCount || 0;
		for (let i = 0; i < predatorCount; i++) {
			this.createBoid(BoidVariant.PREDATOR);
		}
	}

	private createBoid(variant: BoidVariant) {
		// Random position within the screen bounds
		const margin = 50;
		const x = Phaser.Math.Between(margin, this.scale.width - margin);
		const y = Phaser.Math.Between(margin, this.scale.height - margin);

		// Create the boid with current config
		const boid = new Boid(this, x, y, variant, this.boidConfig);
		this.add.existing(boid);

		// Add to tracking arrays
		this.boids.push(boid);
		this.flock.addBoid(boid);
	}

	private createObstacles(count: number) {
		// Clear existing obstacles
		this.obstacleGroup.clear(true, true);
		this.flock.clearAllObstacles();

		// Create new obstacles
		for (let i = 0; i < count; i++) {
			const margin = 100;
			const x = Phaser.Math.Between(margin, this.scale.width - margin);
			const y = Phaser.Math.Between(margin, this.scale.height - margin);
			const radius = Phaser.Math.Between(20, 60);

			// Create circle obstacle
			const obstacle = this.add.circle(x, y, radius, 0x555555, 0.7);
			this.obstacleGroup.add(obstacle);

			// Make it draggable
			obstacle.setInteractive();
			this.input.setDraggable(obstacle);

			// Add to flock's obstacles
			this.flock.addObstacle(obstacle);
		}

		// Set up drag events for all obstacles
		this.input.on(
			'drag',
			(
				pointer: Input.Pointer,
				gameObject: GameObjects.GameObject,
				dragX: number,
				dragY: number
			) => {
				if (gameObject.body) {
					gameObject.body.position.x = dragX;
					gameObject.body.position.y = dragY;
				}
			}
		);
	}

	private updateObstacles(count: number) {
		// Only update if count changed
		if (count !== this.obstacleGroup.getLength()) {
			this.createObstacles(count);
		}
	}

	private resetSimulation() {
		// Clear existing boids
		for (const boid of this.boids) {
			boid.destroy();
		}
		this.boids = [];

		// Recreate flock
		this.flock.destroy();
		this.flock = new Flock(this, this.boidConfig);

		// Initialize boids
		this.createBoids();

		// Update obstacles
		if (this.simulationConfig.obstacleCount) {
			this.createObstacles(this.simulationConfig.obstacleCount);
		}

		// Emit reset event
		EventBus.emit('game-reset', undefined);

		// Emit flock data for UI
		EventBus.emit('flock-updated', { count: this.boids.length });
	}

	update(time: number, delta: number): void {
		// Only update if simulation is active
		if (this.simulationActive) {
			// Apply simulation speed (adjust delta)
			const adjustedDelta = delta * this.simulationSpeed;

			// Update boids
			for (const boid of this.boids) {
				boid.preUpdate(time, adjustedDelta);
			}

			// Let the flock compute and apply forces
			this.flock.run();

			// Draw debug visualizations if enabled
			if (this.debugMode) {
				this.drawDebugVisuals();
			}
		}
	}

	private drawDebugVisuals() {
		this.debugGraphics.clear();

		// Draw perception radius and direction for each boid
		for (const boid of this.boids) {
			// Draw perception radius
			const perceptionRadius = boid.getPerceptionRadius();
			this.debugGraphics.lineStyle(
				1,
				boid.getVariant() === BoidVariant.PREDATOR ? 0xff0000 : 0x00ff00,
				0.3
			);
			this.debugGraphics.strokeCircle(boid.x, boid.y, perceptionRadius);

			// Draw velocity vector
			const velocity = boid.getVelocity();
			const lineLength = velocity.length() * 0.5;
			this.debugGraphics.lineStyle(2, 0xffffff, 0.5);
			this.debugGraphics.lineBetween(
				boid.x,
				boid.y,
				boid.x + velocity.x * lineLength,
				boid.y + velocity.y * lineLength
			);
		}
	}

	private resizeBackground = () => {
		const width = this.scale.width;
		const height = this.scale.height;

		if (!this.background) return;

		const scaleX = width / this.background.width;
		const scaleY = height / this.background.height;
		const scale = Math.max(scaleX, scaleY);

		this.background.setScale(scale);
		this.background.setPosition(width / 2, height / 2);
	};

	shutdown() {
		// Clean up event listeners
		EventBus.off('simulation-paused', undefined, this);
		EventBus.off('simulation-started', undefined, this);
		EventBus.off('simulation-reset', undefined, this);
		EventBus.off('simulation-speed-changed', undefined, this);
		EventBus.off('boid-config-changed', undefined, this);
		EventBus.off('simulation-config-changed', undefined, this);
		EventBus.off('debug-toggle', undefined, this);
		EventBus.off('obstacle-count-changed', undefined, this);

		this.scale.off('resize', this.resizeBackground, this);
		this.input.off('drag');

		// Clean up the flock
		this.flock.destroy();
	}
}
