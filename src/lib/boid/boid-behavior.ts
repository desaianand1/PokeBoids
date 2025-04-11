import { v4 as UUIDv4 } from 'uuid';
import type { IVector2 } from '$interfaces/vector';
import { BoidVariant, isPredator, type BoidStats } from '$boid/types';
import type { IBoid, IBoidDependencies } from '$interfaces/boid';
import type { GameEvents } from '$events/types';
import { clamp, normalizeAngle, hasAngleChanged } from '$utils/angles';

/**
 * Core boid behavior implementation independent of rendering framework
 */
export class BoidBehavior {
	private id: string;
	private position: IVector2;
	private velocity: IVector2;
	private acceleration: IVector2;
	private direction: IVector2;
	private stats!: BoidStats;

	// Config-driven properties
	private maxSpeed: number;
	private maxForce: number;
	private basePerceptionRadius: number; // Base value before multiplier
	private perceptionRadius: number; // Multiplied value
	private fieldOfViewAngle: number;
	private fovMultiplier: number;
	private perceptionMultiplier: number;

	// Additional state
	private isStaminaDepleted: boolean = false;
	private staminaRecoveryTimer: number = 0;
	private reproductionCount: number = 0;

	constructor(
		private deps: IBoidDependencies,
		x: number,
		y: number,
		private variant: BoidVariant
	) {
		this.id = UUIDv4();

		// Initialize vectors
		this.position = deps.vectorFactory.create(x, y);
		this.velocity = deps.vectorFactory
			.random()
			.scale((deps.config?.maxSpeed?.default ?? 100) * 0.5);
		this.acceleration = deps.vectorFactory.create(0, 0);
		this.direction = deps.vectorFactory.right();

		// Initialize from config or use defaults
		this.maxSpeed = deps.config?.maxSpeed?.default ?? 100;
		this.maxForce = deps.config?.maxForce?.default ?? 1.0;
		this.fieldOfViewAngle = deps.config?.fieldOfViewAngle?.default ?? Math.PI / 3;

		this.updateDirection();
		// Set type-specific multipliers
		if (variant === BoidVariant.PREDATOR) {
			this.fovMultiplier = deps.config?.predatorFovMultiplier?.default ?? 0.7;
			this.perceptionMultiplier = deps.config?.predatorPerceptionMultiplier?.default ?? 1.3;
		} else {
			this.fovMultiplier = deps.config?.preyFovMultiplier?.default ?? 1.3;
			this.perceptionMultiplier = deps.config?.preyPerceptionMultiplier?.default ?? 0.8;
		}

		// Store base and calculated perception radius
		this.basePerceptionRadius = deps.config?.perceptionRadius?.default ?? 150;
		this.perceptionRadius = this.basePerceptionRadius * this.perceptionMultiplier;

		// Initialize stats
		this.initStats();

		// Setup event listeners
		this.setupEventListeners();
	}

	showCollisionEffect(): void {
		// No visual effect in the behavior class
		return;
	}

	// Identity
	getId(): string {
		return this.id;
	}

	getVariant(): BoidVariant {
		return this.variant;
	}

	// Position and Movement
	getBoidPosition(): IVector2 {
		return this.position.clone();
	}

	setBoidPosition(position: IVector2): void {
		this.position.copy(position);
	}

	getBoidVelocity(): IVector2 {
		return this.velocity.clone();
	}

	setBoidVelocity(velocity: IVector2): void {
		this.velocity.copy(velocity);
	}

	applyForce(force: IVector2): void {
		this.acceleration.add(force);
	}

	// Configuration
	getMaxSpeed(): number {
		return this.maxSpeed;
	}

	setMaxSpeed(speed: number): void {
		if (speed > 0) {
			this.maxSpeed = speed;
			if (this.velocity.length() > this.maxSpeed) {
				this.velocity.setLength(this.maxSpeed);
			}
		}
	}

	getMaxForce(): number {
		return this.maxForce;
	}

	setMaxForce(force: number): void {
		if (force > 0) {
			this.maxForce = force;
		}
	}

	getPerceptionRadius(): number {
		return this.perceptionRadius;
	}

	setPerceptionRadius(radius: number): void {
		if (radius > 0) {
			this.basePerceptionRadius = radius;
			this.updatePerceptionRadius();
		}
	}

	private updatePerceptionRadius(): void {
		this.perceptionRadius = this.basePerceptionRadius * this.perceptionMultiplier;
	}

	getFieldOfViewAngle(): number {
		return normalizeAngle(this.fieldOfViewAngle * this.fovMultiplier);
	}

	isInFieldOfView(other: IBoid): boolean {
		const EPSILON = 0.0001;
		// Get positions
		const myPos = this.position;
		const otherPos = other.getBoidPosition();
		const distSquared = myPos.distanceToSquared(otherPos);
		// Quick distance check first
		if (distSquared > this.perceptionRadius * this.perceptionRadius) {
			return false;
		}

		// If boids are at the same position, they can see each other
		if (distSquared < EPSILON) {
			return true;
		}

		// Calculate vector to other boid
		const toOther = this.deps.vectorFactory.create(otherPos.x - myPos.x, otherPos.y - myPos.y);

		// Check if the vector has significant length before normalizing
		if (toOther.hasSignificantLength()) {
			toOther.normalize();
		}

		const dot = clamp(this.direction.dot(toOther));

		// Compare with cosine of half FOV angle
		// This avoids the problematic acos calculation
		const cosHalfFOV = Math.cos(this.getFieldOfViewAngle() / 2);

		return dot >= cosHalfFOV;
	}

	/**
	 * Updates the boid's direction based on its velocity
	 * Maintains the current direction if velocity is near zero
	 */
	private updateDirection(): void {
		if (this.velocity.hasSignificantLength()) {
			this.direction.copy(this.velocity).normalize();
		}
		// If velocity is too small, keep the existing direction
	}

	// Stats and State
	getStats(): BoidStats {
		return { ...this.stats };
	}

	takeDamage(amount: number): boolean {
		if (amount <= 0 || isNaN(amount)) return false;

		this.stats.health = Math.max(0, this.stats.health - amount);

		// Emit damage event with debug info
		this.deps.eventEmitter.emit('boid-damaged', {
			boid: this,
			damage: amount,
			remainingHealth: this.stats.health,
			debug: {
				position: { x: this.position.x, y: this.position.y },
				velocity: { x: this.velocity.x, y: this.velocity.y },
				stats: { ...this.stats }
			}
		});

		return this.stats.health <= 0;
	}

	increaseReproduction(amount: number): boolean {
		if (this.reproductionCount >= (isPredator(this.variant) ? 5 : 3)) {
			return false;
		}

		this.stats.reproduction = Math.min(100, this.stats.reproduction + amount);

		if (this.stats.reproduction >= 100) {
			this.reproductionCount++;
			this.stats.reproduction = 0;
			return true;
		}

		return false;
	}

	levelUp(): void {
		this.stats.level++;

		// Small random stat increases
		this.stats.health += this.deps.random.integer(5, 10);
		this.stats.speed += this.deps.random.float(1, 3);

		if (isPredator(this.variant) && 'attack' in this.stats) {
			this.stats.attack += this.deps.random.float(0.5, 1.5);
		}

		// Emit level up event with debug info
		this.deps.eventEmitter.emit('boid-leveled-up', {
			boid: this,
			level: this.stats.level,
			debug: {
				position: { x: this.position.x, y: this.position.y },
				stats: { ...this.stats },
				variant: this.variant
			}
		});
	}

	// Lifecycle
	update(deltaTime: number): void {
		// Update stamina
		this.updateStamina(deltaTime);

		// Apply acceleration to velocity
		this.velocity.add(this.acceleration);

		// Apply speed limit based on stamina
		const currentMaxSpeed = this.isStaminaDepleted ? this.maxSpeed * 0.5 : this.maxSpeed;
		this.velocity.limit(currentMaxSpeed);

		// Update direction if velocity changed significantly
		this.updateDirection();

		// Update position based on velocity
		const scaledVelocity = this.velocity.clone().scale(deltaTime / 1000);
		this.position.add(scaledVelocity);

		// Reset acceleration
		this.acceleration.set(0, 0);
	}

	destroy(): void {
		// Clean up event listeners
		this.deps.eventEmitter.off('max-speed-changed', undefined, this);
		this.deps.eventEmitter.off('max-force-changed', undefined, this);
		this.deps.eventEmitter.off('perception-radius-changed', undefined, this);
		this.deps.eventEmitter.off('field-of-view-angle-changed', undefined, this);

		// Clean up type-specific event listeners
		if (this.variant === BoidVariant.PREDATOR) {
			this.deps.eventEmitter.off('predator-fov-multiplier-changed', undefined, this);
			this.deps.eventEmitter.off('predator-perception-multiplier-changed', undefined, this);
		} else {
			this.deps.eventEmitter.off('prey-fov-multiplier-changed', undefined, this);
			this.deps.eventEmitter.off('prey-perception-multiplier-changed', undefined, this);
		}
	}

	// Private methods
	private initStats(): void {
		const baseSex = this.deps.random.boolean() ? 'male' : 'female';

		if (isPredator(this.variant)) {
			this.stats = {
				health: 100,
				stamina: 100,
				speed: this.maxSpeed,
				reproduction: 0,
				level: 1,
				sex: baseSex,
				attack: 10
			};
		} else {
			this.stats = {
				health: 100,
				stamina: 100,
				speed: this.maxSpeed,
				reproduction: 0,
				level: 1,
				sex: baseSex
			};
		}
	}

	private setupEventListeners(): void {
		// Update maxSpeed when config changes
		this.deps.eventEmitter.on(
			'max-speed-changed',
			(data: GameEvents['max-speed-changed']) => {
				this.setMaxSpeed(data.value);
			},
			this
		);

		// Update maxForce when config changes
		this.deps.eventEmitter.on(
			'max-force-changed',
			(data: GameEvents['max-force-changed']) => {
				this.setMaxForce(data.value);
			},
			this
		);

		// Update perception radius when config changes
		this.deps.eventEmitter.on(
			'perception-radius-changed',
			(data: GameEvents['perception-radius-changed']) => {
				this.setPerceptionRadius(data.value);
			},
			this
		);

		// Update field of view angle when config changes
		this.deps.eventEmitter.on(
			'field-of-view-angle-changed',
			(data: GameEvents['field-of-view-angle-changed']) => {
				if (hasAngleChanged(this.fieldOfViewAngle, data.value)) {
					this.fieldOfViewAngle = data.value;
				}
			},
			this
		);

		// Update FOV multipliers based on boid type
		if (this.variant === BoidVariant.PREDATOR) {
			this.deps.eventEmitter.on(
				'predator-fov-multiplier-changed',
				(data: GameEvents['predator-fov-multiplier-changed']) => {
					this.fovMultiplier = data.value;
				},
				this
			);
			this.deps.eventEmitter.on(
				'predator-perception-multiplier-changed',
				(data: GameEvents['predator-perception-multiplier-changed']) => {
					this.perceptionMultiplier = data.value;
					this.updatePerceptionRadius();
				},
				this
			);
		} else {
			this.deps.eventEmitter.on(
				'prey-fov-multiplier-changed',
				(data: GameEvents['prey-fov-multiplier-changed']) => {
					this.fovMultiplier = data.value;
				},
				this
			);
			this.deps.eventEmitter.on(
				'prey-perception-multiplier-changed',
				(data: GameEvents['prey-perception-multiplier-changed']) => {
					this.perceptionMultiplier = data.value;
					this.updatePerceptionRadius();
				},
				this
			);
		}
	}

	private updateStamina(deltaTime: number): void {
		// Stamina cost is proportional to speed
		const staminaCost = (this.velocity.length() / this.maxSpeed) * 0.1 * (deltaTime / 16);

		if (this.stats.stamina > 0) {
			// Reduce stamina
			this.stats.stamina = Math.max(0, this.stats.stamina - staminaCost);

			// Check if stamina depleted
			if (this.stats.stamina === 0 && !this.isStaminaDepleted) {
				this.isStaminaDepleted = true;
				this.deps.eventEmitter.emit('boid-stamina-depleted', {
					boid: this,
					debug: {
						position: { x: this.position.x, y: this.position.y },
						velocity: { x: this.velocity.x, y: this.velocity.y },
						stats: { ...this.stats }
					}
				});
			}
		} else if (this.isStaminaDepleted) {
			// Start recovery timer
			this.staminaRecoveryTimer += deltaTime;

			// After 3 seconds, start recovering stamina
			if (this.staminaRecoveryTimer >= 3000) {
				this.stats.stamina += 0.5 * (deltaTime / 16);

				// Fully recovered
				if (this.stats.stamina >= 100) {
					this.stats.stamina = 100;
					this.isStaminaDepleted = false;
					this.staminaRecoveryTimer = 0;
					this.deps.eventEmitter.emit('boid-stamina-recovered', {
						boid: this,
						debug: {
							position: { x: this.position.x, y: this.position.y },
							velocity: { x: this.velocity.x, y: this.velocity.y },
							stats: { ...this.stats }
						}
					});
				}
			}
		}
	}
}
