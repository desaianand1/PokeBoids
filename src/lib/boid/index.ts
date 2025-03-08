import { Physics, Scene, Math as PhaserMath } from 'phaser';
import { v4 as UUIDv4 } from 'uuid';
import { EventBus } from '$game/event-bus';
import type { BoidConfig } from '$config/index.svelte';

export enum BoidVariant {
	PREY = 'prey',
	PREDATOR = 'predator'
}

export interface BoidStats {
	health: number;
	stamina: number;
	speed: number;
	reproduction: number;
	level: number;
	attack?: number; // Predators only
	sex: 'male' | 'female';
}

export class Boid extends Physics.Arcade.Sprite {
	private velocity: PhaserMath.Vector2;
	private acceleration: PhaserMath.Vector2;
	private id: string;
	private variant: BoidVariant;
	private stats!: BoidStats;

	// Config-driven properties
	private maxSpeed: number;
	private maxForce: number;
	private perceptionRadius: number;

	// Additional state
	private isStaminaDepleted: boolean = false;
	private staminaRecoveryTimer: number = 0;
	private reproductionCount: number = 0;

	getId(): string {
		return this.id;
	}

	getVariant(): BoidVariant {
		return this.variant;
	}

	getVelocity(): PhaserMath.Vector2 {
		return this.velocity.clone();
	}

	getMaxSpeed(): number {
		return this.maxSpeed;
	}

	getMaxForce(): number {
		return this.maxForce;
	}

	getPerceptionRadius(): number {
		return this.perceptionRadius;
	}

	getStats(): BoidStats {
		return { ...this.stats };
	}

	constructor(
		scene: Scene,
		x: number,
		y: number,
		variant: BoidVariant = BoidVariant.PREY,
		config: Partial<BoidConfig> = {}
	) {
		// Use different texture based on type
		const texture = variant === BoidVariant.PREDATOR ? 'predator' : 'boid';
		super(scene, x, y, texture);

		scene.physics.add.existing(this);
		this.id = UUIDv4();
		this.variant = variant;

		// Initialize from config or use defaults
		this.maxSpeed = config.maxSpeed || 100;
		this.maxForce = config.maxForce || 1.0;
		this.perceptionRadius = config.perceptionRadius || 150;

		// Generate random initial velocity
		this.velocity = new PhaserMath.Vector2(
			PhaserMath.FloatBetween(-1, 1),
			PhaserMath.FloatBetween(-1, 1)
		)
			.normalize()
			.scale(this.maxSpeed * 0.5); // Start at half speed

		this.acceleration = new PhaserMath.Vector2();

		// Initialize stats based on type
		this.initStats();

		// Listen for config changes
		this.setupEventListeners();

		// Set display properties based on type
		this.setupDisplay();
	}

	private initStats() {
		// Base stats
		const baseSex = Math.random() > 0.5 ? 'male' : 'female';

		this.stats = {
			health: 100,
			stamina: 100,
			speed: this.maxSpeed,
			reproduction: 0,
			level: 1,
			sex: baseSex
		};

		// Predator-specific stats
		if (this.type === BoidVariant.PREDATOR) {
			this.stats.attack = 10;
		}
	}

	private setupEventListeners() {
		// Update maxSpeed when config changes
		EventBus.on(
			'max-speed-changed',
			({ value }) => {
				this.maxSpeed = value;
				// Scale current velocity if it exceeds new max
				if (this.velocity.length() > this.maxSpeed) {
					this.velocity.normalize().scale(this.maxSpeed);
				}
			},
			this
		);

		// Update maxForce when config changes
		EventBus.on(
			'max-force-changed',
			({ value }) => {
				this.maxForce = value;
			},
			this
		);

		// Update perception radius when config changes
		EventBus.on(
			'perception-radius-changed',
			({ value }) => {
				this.perceptionRadius = value;
			},
			this
		);
	}

	private setupDisplay() {
		// Set scale and origin
		this.setScale(this.type === BoidVariant.PREDATOR ? 0.75 : 0.5);
		this.setOrigin(0.5, 0.5);

		// Set tint based on type
		if (this.type === BoidVariant.PREDATOR) {
			this.setTint(0xff3333); // Red for predators
		} else {
			this.setTint(0x33ff33); // Green for prey
		}
	}

	preUpdate(time: number, delta: number) {
		super.preUpdate(time, delta);

		// Update stamina
		this.updateStamina(delta);

		// Apply acceleration to velocity
		this.velocity.add(this.acceleration);

		// Apply speed limit based on stamina
		const currentMaxSpeed = this.isStaminaDepleted ? this.maxSpeed * 0.5 : this.maxSpeed;
		this.velocity.limit(currentMaxSpeed);

		// Update position based on velocity
		this.x += this.velocity.x * (delta / 1000);
		this.y += this.velocity.y * (delta / 1000);

		// Reset acceleration
		this.acceleration.set(0, 0);

		// Update rotation to face direction of movement
		this.rotation = Math.atan2(this.velocity.y, this.velocity.x) + Math.PI / 2;
	}

	applyForce(force: PhaserMath.Vector2) {
		this.acceleration.add(force);
	}

	private updateStamina(delta: number) {
		// Stamina cost is proportional to speed
		const staminaCost = (this.velocity.length() / this.maxSpeed) * 0.1 * (delta / 16); // Adjust for 60fps

		if (this.stats.stamina > 0) {
			// Reduce stamina
			this.stats.stamina = Math.max(0, this.stats.stamina - staminaCost);

			// Check if stamina depleted
			if (this.stats.stamina === 0 && !this.isStaminaDepleted) {
				this.isStaminaDepleted = true;
				// Emit event for UI
				EventBus.emit('boid-stamina-depleted', { boid: this });
			}
		} else if (this.isStaminaDepleted) {
			// Start recovery timer
			this.staminaRecoveryTimer += delta;

			// After 3 seconds, start recovering stamina
			if (this.staminaRecoveryTimer >= 3000) {
				this.stats.stamina += 0.5 * (delta / 16); // Adjust for 60fps

				// Fully recovered
				if (this.stats.stamina >= 100) {
					this.stats.stamina = 100;
					this.isStaminaDepleted = false;
					this.staminaRecoveryTimer = 0;
					// Emit event for UI
					EventBus.emit('boid-stamina-recovered', { boid: this });
				}
			}
		}
	}

	takeDamage(amount: number): boolean {
		this.stats.health = Math.max(0, this.stats.health - amount);

		// Emit damage event
		EventBus.emit('boid-damaged', {
			boid: this,
			amount,
			remainingHealth: this.stats.health
		});

		// Return true if boid died
		return this.stats.health <= 0;
	}

	increaseReproduction(amount: number) {
		if (this.reproductionCount >= (this.type === BoidVariant.PREDATOR ? 5 : 3)) {
			return false; // Already reached reproduction limit
		}

		this.stats.reproduction = Math.min(100, this.stats.reproduction + amount);

		// Check if ready to reproduce
		if (this.stats.reproduction >= 100) {
			this.reproductionCount++;
			this.stats.reproduction = 0;
			return true;
		}

		return false;
	}

	levelUp() {
		this.stats.level++;

		// Small random stat increases
		this.stats.health += PhaserMath.Between(5, 10);
		this.stats.speed += PhaserMath.FloatBetween(1, 3);

		if (this.type === BoidVariant.PREDATOR && this.stats.attack) {
			this.stats.attack += PhaserMath.FloatBetween(0.5, 1.5);
		}

		// Emit level up event
		EventBus.emit('boid-leveled-up', {
			boid: this,
			level: this.stats.level
		});
	}

	destroy(fromScene?: boolean) {
		// Clean up event listeners
		EventBus.off('max-speed-changed', undefined, this);
		EventBus.off('max-force-changed', undefined, this);
		EventBus.off('perception-radius-changed', undefined, this);

		// Call parent destroy
		super.destroy(fromScene);
	}
}
