import { Boid, BoidVariant } from '$boid';
import { Scene, Math as PhaserMath, GameObjects } from 'phaser';
import { EventBus } from '$game/event-bus';
import type { BoidConfig } from '$config/index.svelte';

export class Flock {
	public boids: Boid[] = [];
	private scene: Scene;
	private obstacles: GameObjects.GameObject[] = [];

	// Config parameters with defaults
	private alignmentWeight = 1.0;
	private cohesionWeight = 1.0;
	private separationWeight = 1.5;
	private perceptionRadius = 50;
	private separationRadius = 30;
	private boundaryMargin = 100;
	private boundaryForceMultiplier = 3.0;
	private boundaryForceRamp = 2.5;
	private obstaclePerceptionRadius = 150;
	private obstacleForceMultiplier = 4.0;

	// Statistics
	private preyCount = 0;
	private predatorCount = 0;

	constructor(scene: Scene, config?: Partial<BoidConfig>) {
		this.scene = scene;

		// Apply initial config if provided
		if (config) {
			this.applyConfig(config);
		}

		this.setupEventListeners();
	}

	private applyConfig(config: Partial<BoidConfig>) {
		// Apply each config property if provided
		if (config.alignmentWeight !== undefined) this.alignmentWeight = config.alignmentWeight;
		if (config.cohesionWeight !== undefined) this.cohesionWeight = config.cohesionWeight;
		if (config.separationWeight !== undefined) this.separationWeight = config.separationWeight;
		if (config.perceptionRadius !== undefined) this.perceptionRadius = config.perceptionRadius;
		if (config.separationRadius !== undefined) this.separationRadius = config.separationRadius;
		if (config.boundaryMargin !== undefined) this.boundaryMargin = config.boundaryMargin;
		if (config.boundaryForceMultiplier !== undefined)
			this.boundaryForceMultiplier = config.boundaryForceMultiplier;
		if (config.boundaryForceRamp !== undefined) this.boundaryForceRamp = config.boundaryForceRamp;
		if (config.obstaclePerceptionRadius !== undefined)
			this.obstaclePerceptionRadius = config.obstaclePerceptionRadius;
		if (config.obstacleForceMultiplier !== undefined)
			this.obstacleForceMultiplier = config.obstacleForceMultiplier;
	}

	private setupEventListeners() {
		// Listen for parameter changes from Svelte UI
		EventBus.on(
			'alignment-weight-changed',
			({ value }) => {
				this.alignmentWeight = value;
			},
			this
		);

		EventBus.on(
			'cohesion-weight-changed',
			({ value }) => {
				this.cohesionWeight = value;
			},
			this
		);

		EventBus.on(
			'separation-weight-changed',
			({ value }) => {
				this.separationWeight = value;
			},
			this
		);

		EventBus.on(
			'perception-radius-changed',
			({ value }) => {
				this.perceptionRadius = value;
			},
			this
		);

		EventBus.on(
			'separation-radius-changed',
			({ value }) => {
				this.separationRadius = value;
			},
			this
		);

		EventBus.on(
			'boundary-margin-changed',
			({ value }) => {
				this.boundaryMargin = value;
			},
			this
		);

		EventBus.on(
			'boundary-force-changed',
			({ value }) => {
				this.boundaryForceMultiplier = value;
			},
			this
		);

		EventBus.on(
			'boundary-force-ramp-changed',
			({ value }) => {
				this.boundaryForceRamp = value;
			},
			this
		);

		EventBus.on(
			'obstacle-perception-radius-changed',
			({ value }) => {
				this.obstaclePerceptionRadius = value;
			},
			this
		);

		EventBus.on(
			'obstacle-force-changed',
			({ value }) => {
				this.obstacleForceMultiplier = value;
			},
			this
		);

		// Efficient bulk update
		EventBus.on(
			'boid-config-changed',
			({ config }) => {
				this.applyConfig(config);
			},
			this
		);
	}

	run() {
		this.update();
	}

	addBoid(boid: Boid) {
		this.boids.push(boid);

		// Update type counts
		if (boid.getVariant() === BoidVariant.PREDATOR) {
			this.predatorCount++;
			EventBus.emit('predator-count-updated', { count: this.predatorCount });
		} else {
			this.preyCount++;
			EventBus.emit('prey-count-updated', { count: this.preyCount });
		}

		// Emit events
		EventBus.emit('boid-added', { boid });
		EventBus.emit('flock-updated', { count: this.boids.length });
	}

	removeBoid(boid: Boid) {
		const index = this.boids.indexOf(boid);
		if (index !== -1) {
			this.boids.splice(index, 1);

			// Update variant counts
			if (boid.getVariant() === BoidVariant.PREDATOR) {
				this.predatorCount--;
				EventBus.emit('predator-count-updated', { count: this.predatorCount });
			} else {
				this.preyCount--;
				EventBus.emit('prey-count-updated', { count: this.preyCount });
			}

			// Emit events
			EventBus.emit('boid-removed', { boid });
			EventBus.emit('flock-updated', { count: this.boids.length });
		}
	}

	addObstacle(obstacle: GameObjects.GameObject) {
		this.obstacles.push(obstacle);
		EventBus.emit('obstacle-added', { obstacle });
	}

	removeObstacle(obstacle: GameObjects.GameObject) {
		const index = this.obstacles.indexOf(obstacle);
		if (index !== -1) {
			this.obstacles.splice(index, 1);
			EventBus.emit('obstacle-removed', { obstacle });
		}
	}

	clearAllObstacles() {
		this.obstacles = [];
	}

	update() {
		for (const boid of this.boids) {
			// Calculate standard flocking behaviors
			const alignment = this.align(boid).scale(this.alignmentWeight);
			const cohesion = this.cohere(boid).scale(this.cohesionWeight);
			const separation = this.separate(boid).scale(this.separationWeight);

			// Calculate enhanced avoidance forces
			const boundaryForce = this.calculateBoundaryForce(boid);
			const obstacleForce = this.avoidObstacles(boid);

			// Calculate predator avoidance for prey
			let predatorAvoidance = new PhaserMath.Vector2();
			if (boid.getVariant() === BoidVariant.PREY) {
				predatorAvoidance = this.avoidPredators(boid);
			}

			// Apply all forces
			boid.applyForce(alignment);
			boid.applyForce(cohesion);
			boid.applyForce(separation);
			boid.applyForce(boundaryForce);
			boid.applyForce(obstacleForce);
			boid.applyForce(predatorAvoidance);

			// For predators, apply hunting force
			if (boid.getVariant() === BoidVariant.PREDATOR) {
				const huntingForce = this.calculateHuntingForce(boid);
				boid.applyForce(huntingForce);
			}
		}

		// Check for reproduction opportunities
		this.checkReproduction();
	}

	private align(boid: Boid): PhaserMath.Vector2 {
		const steering = new PhaserMath.Vector2();
		let total = 0;
		const neighbors: Boid[] = [];

		for (const other of this.boids) {
			const distance = PhaserMath.Distance.Between(boid.x, boid.y, other.x, other.y);

			// Only align with same type and within perception radius
			if (
				other !== boid &&
				other.getVariant() === boid.getVariant() &&
				distance < this.perceptionRadius
			) {
				steering.add(other.getVelocity());
				total++;
				neighbors.push(other);
			}
		}

		if (total > 0) {
			steering.scale(1 / total);
			steering.setLength(boid.getMaxSpeed());
			steering.subtract(boid.getVelocity());
			steering.limit(boid.getMaxForce());

			EventBus.emit('alignment-updated', {
				boid,
				neighbors,
				strength: steering.length()
			});
		}

		return steering;
	}

	private cohere(boid: Boid): PhaserMath.Vector2 {
		const steering = new PhaserMath.Vector2();
		let total = 0;
		const center = new PhaserMath.Vector2();

		for (const other of this.boids) {
			const distance = PhaserMath.Distance.Between(boid.x, boid.y, other.x, other.y);

			// Only cohere with same type and within perception radius
			if (
				other !== boid &&
				other.getVariant() === boid.getVariant() &&
				distance < this.perceptionRadius
			) {
				center.add(new PhaserMath.Vector2(other.x, other.y));
				total++;
			}
		}

		if (total > 0) {
			center.scale(1 / total);
			steering.add(center);
			steering.subtract(new PhaserMath.Vector2(boid.x, boid.y));
			steering.setLength(boid.getMaxSpeed());
			steering.subtract(boid.getVelocity());
			steering.limit(boid.getMaxForce());

			EventBus.emit('coherence-updated', {
				boid,
				center,
				strength: steering.length()
			});
		}

		return steering;
	}

	private separate(boid: Boid): PhaserMath.Vector2 {
		const steering = new PhaserMath.Vector2();
		let total = 0;
		const avoidance = new PhaserMath.Vector2();

		for (const other of this.boids) {
			const distance = PhaserMath.Distance.Between(boid.x, boid.y, other.x, other.y);

			// Separate from all boids, regardless of type, within separation radius
			if (other !== boid && distance < this.separationRadius) {
				const diff = new PhaserMath.Vector2(boid.x - other.x, boid.y - other.y);
				diff.normalize().scale(1 / Math.max(0.1, distance)); // Weight by distance
				avoidance.add(diff);
				total++;
			}
		}

		if (total > 0) {
			avoidance.scale(1 / total);
			avoidance.setLength(boid.getMaxSpeed());
			steering.add(avoidance);
			steering.subtract(boid.getVelocity());
			steering.limit(boid.getMaxForce());

			EventBus.emit('separation-updated', {
				boid,
				avoidance,
				strength: steering.length(),
				nearbyCount: total
			});
		}

		return steering;
	}

	private calculateBoundaryForce(boid: Boid): PhaserMath.Vector2 {
		const width = this.scene.scale.width;
		const height = this.scene.scale.height;
		const steeringForce = new PhaserMath.Vector2(0, 0);

		// Calculate distances to each boundary
		const distLeft = boid.x;
		const distRight = width - boid.x;
		const distTop = boid.y;
		const distBottom = height - boid.y;

		// Track if we're approaching any boundary
		let approachingBoundary = false;
		let closestBoundary: 'left' | 'right' | 'top' | 'bottom' | null = null;
		let closestDistance = this.boundaryMargin;

		// Calculate left/right boundary forces with exponential ramp-up
		if (distLeft < this.boundaryMargin) {
			// Calculate force that increases exponentially as boid gets closer to boundary
			const forceMagnitude = this.calculateBoundaryForceMagnitude(distLeft, boid);
			steeringForce.x += forceMagnitude;
			approachingBoundary = true;

			if (distLeft < closestDistance) {
				closestDistance = distLeft;
				closestBoundary = 'left';
			}
		}

		if (distRight < this.boundaryMargin) {
			const forceMagnitude = this.calculateBoundaryForceMagnitude(distRight, boid);
			steeringForce.x -= forceMagnitude;
			approachingBoundary = true;

			if (distRight < closestDistance) {
				closestDistance = distRight;
				closestBoundary = 'right';
			}
		}

		// Calculate top/bottom boundary forces with exponential ramp-up
		if (distTop < this.boundaryMargin) {
			const forceMagnitude = this.calculateBoundaryForceMagnitude(distTop, boid);
			steeringForce.y += forceMagnitude;
			approachingBoundary = true;

			if (distTop < closestDistance) {
				closestDistance = distTop;
				closestBoundary = 'top';
			}
		}

		if (distBottom < this.boundaryMargin) {
			const forceMagnitude = this.calculateBoundaryForceMagnitude(distBottom, boid);
			steeringForce.y -= forceMagnitude;
			approachingBoundary = true;

			if (distBottom < closestDistance) {
				closestDistance = distBottom;
				closestBoundary = 'bottom';
			}
		}

		// Emit boundary approach event if applicable
		if (approachingBoundary && closestBoundary) {
			EventBus.emit('boundary-approached', {
				boid,
				boundary: closestBoundary,
				distance: closestDistance,
				force: steeringForce.length()
			});
		}

		// Limit to max force and return
		steeringForce.limit(boid.getMaxForce() * 2); // Allow stronger boundary force
		return steeringForce;
	}

	private calculateBoundaryForceMagnitude(distance: number, boid: Boid): number {
		// Create exponential force that grows stronger as distance decreases
		// The closer to boundary, the stronger the force
		const normalizedDist = Math.max(0.1, distance / this.boundaryMargin); // 0.1 to 1.0
		const forceMagnitude =
			Math.pow(1 - normalizedDist, this.boundaryForceRamp) * this.boundaryForceMultiplier;
		return forceMagnitude * boid.getMaxForce();
	}

	private avoidObstacles(boid: Boid): PhaserMath.Vector2 {
		if (this.obstacles.length === 0) {
			return new PhaserMath.Vector2();
		}

		const steeringForce = new PhaserMath.Vector2();
		const boidPosition = new PhaserMath.Vector2(boid.x, boid.y);
		const boidVelocity = boid.getVelocity();

		// Look ahead vector in direction of travel
		const lookAheadDist =
			this.obstaclePerceptionRadius * (0.5 + 0.5 * (boidVelocity.length() / boid.getMaxSpeed()));
		const lookAhead = boidVelocity.clone().normalize().scale(lookAheadDist);

		// Project position - where boid will be
		const projectedPosition = boidPosition.clone().add(lookAhead);

		// Check obstacles
		for (const obstacle of this.obstacles) {
			if (!obstacle.body) continue;
			// Simple circle-based obstacle detection (can be enhanced for different shapes)
			const obstaclePos = new PhaserMath.Vector2(
				obstacle.body.position.x,
				obstacle.body.position.x
			);
			const obstacleRadius = 200 / 2; // Assuming circular obstacles

			// Calculate distance from projected position to obstacle
			const distToObstacle = PhaserMath.Distance.BetweenPoints(projectedPosition, obstaclePos);

			if (distToObstacle < obstacleRadius + 20) {
				// Add some margin
				// Calculate avoidance vector (direction away from obstacle)
				const avoidanceDir = new PhaserMath.Vector2()
					.copy(projectedPosition)
					.subtract(obstaclePos)
					.normalize();

				// Stronger force for closer obstacles
				const forceMagnitude =
					(1 - Math.min(1, distToObstacle / (obstacleRadius + 20))) *
					this.obstacleForceMultiplier *
					boid.getMaxForce();

				steeringForce.add(avoidanceDir.scale(forceMagnitude));

				// Emit obstacle avoidance event
				EventBus.emit('obstacle-approached', {
					boid,
					obstacle,
					distance: distToObstacle,
					force: forceMagnitude
				});
			}
		}

		// Limit total obstacle avoidance force
		steeringForce.limit(boid.getMaxForce() * 2); // Allow stronger obstacle avoidance
		return steeringForce;
	}

	private avoidPredators(boid: Boid): PhaserMath.Vector2 {
		// Only prey boids should avoid predators
		if (boid.getVariant() !== BoidVariant.PREY) {
			return new PhaserMath.Vector2();
		}

		const steeringForce = new PhaserMath.Vector2();
		let predatorDetected = false;

		// Enhanced perception radius for predator detection
		const predatorPerceptionRadius = this.perceptionRadius * 1.5;

		for (const other of this.boids) {
			// Only consider predators
			if (other.getVariant() !== BoidVariant.PREDATOR) continue;

			const distance = PhaserMath.Distance.Between(boid.x, boid.y, other.x, other.y);

			if (distance < predatorPerceptionRadius) {
				// Calculate vector away from predator
				const awayVector = new PhaserMath.Vector2(boid.x - other.x, boid.y - other.y);

				// Normalize and scale inversely by distance (closer = stronger)
				awayVector.normalize().scale(1 / Math.max(0.1, distance / predatorPerceptionRadius));

				// Add to steering force
				steeringForce.add(awayVector);
				predatorDetected = true;
			}
		}

		if (predatorDetected) {
			// Scale by max speed to get desired velocity
			steeringForce.normalize().scale(boid.getMaxSpeed() * 1.2); // Faster than normal to escape

			// Calculate steering force
			const currentVelocity = boid.getVelocity();
			steeringForce.subtract(currentVelocity);

			// Limit to max force but allow stronger escape
			steeringForce.limit(boid.getMaxForce() * 3);
		}

		return steeringForce;
	}

	private calculateHuntingForce(boid: Boid): PhaserMath.Vector2 {
		// Only predators hunt
		if (boid.getVariant() !== BoidVariant.PREDATOR) {
			return new PhaserMath.Vector2();
		}

		const steeringForce = new PhaserMath.Vector2();
		let closestPrey: Boid | null = null;
		let closestDistance = Number.MAX_VALUE;

		// Enhanced hunting radius (larger than normal perception)
		const huntingRadius = this.perceptionRadius * 2;

		// Find closest prey
		for (const other of this.boids) {
			// Only consider prey
			if (other.getVariant() !== BoidVariant.PREY) continue;

			const distance = PhaserMath.Distance.Between(boid.x, boid.y, other.x, other.y);

			if (distance < huntingRadius && distance < closestDistance) {
				closestPrey = other;
				closestDistance = distance;
			}
		}

		// If prey found, hunt it
		if (closestPrey) {
			// Vector toward prey
			const towardPrey = new PhaserMath.Vector2(closestPrey.x - boid.x, closestPrey.y - boid.y);

			// Desired velocity is toward prey at max speed
			towardPrey.normalize().scale(boid.getMaxSpeed() * 1.1); // Slightly faster hunting

			// Steering force is desired velocity minus current velocity
			steeringForce.add(towardPrey).subtract(boid.getVelocity());
			steeringForce.limit(boid.getMaxForce() * 1.5); // Stronger hunting force

			// If very close, attempt to damage prey
			if (closestDistance < 10) {
				// Get predator attack stat
				const stats = boid.getStats();
				if (stats.attack) {
					const isDead = closestPrey.takeDamage(stats.attack);

					// If prey died, predator gains reproduction points
					if (isDead) {
						const preyHealth = closestPrey.getStats().health;
						const reproPoints = Math.max(10, preyHealth * 0.5);
						const readyToReproduce = boid.increaseReproduction(reproPoints);

						// If ready to reproduce, find a mate
						if (readyToReproduce) {
							this.findMateForPredator(boid);
						}
					}
				}
			}
		}

		return steeringForce;
	}

	private checkReproduction() {
		// Check prey reproduction
		for (const boid of this.boids) {
			if (boid.getVariant() !== BoidVariant.PREY) continue;

			// Check if near a suitable mate
			const mates = this.findNearbyMates(boid);
			if (mates.length > 0) {
				// Increase reproduction stat
				const readyToReproduce = boid.increaseReproduction(0.1);

				// If ready to reproduce, create offspring
				if (readyToReproduce) {
					const mate = mates[0]; // Take the first available mate
					this.createOffspring(boid, mate);
				}
			}
		}
	}

	private findNearbyMates(boid: Boid): Boid[] {
		const mates: Boid[] = [];
		const stats = boid.getStats();

		for (const other of this.boids) {
			// Must be same type but opposite sex
			if (other === boid || other.getVariant() !== boid.getVariant()) continue;

			const otherStats = other.getStats();
			if (otherStats.sex === stats.sex) continue;

			// Check distance (very close for reproduction)
			const distance = PhaserMath.Distance.Between(boid.x, boid.y, other.x, other.y);
			if (distance < 15) {
				mates.push(other);
			}
		}

		return mates;
	}

	private findMateForPredator(predator: Boid) {
		const stats = predator.getStats();

		for (const other of this.boids) {
			// Must be predator of opposite sex
			if (other === predator || other.getVariant() !== BoidVariant.PREDATOR) continue;

			const otherStats = other.getStats();
			if (otherStats.sex === stats.sex) continue;

			// Check distance (predators have larger range for finding mates)
			const distance = PhaserMath.Distance.Between(predator.x, predator.y, other.x, other.y);
			if (distance < 100) {
				// Create offspring
				this.createOffspring(predator, other);
				break;
			}
		}
	}

	private createOffspring(parent1: Boid, parent2: Boid) {
		// const stats1 = parent1.getStats();
		// const stats2 = parent2.getStats();

		// Determine number of offspring
		const offspringCount = parent1.getVariant() === BoidVariant.PREDATOR ? 1 : 2;

		for (let i = 0; i < offspringCount; i++) {
			// Position near parents
			const x = (parent1.x + parent2.x) / 2 + PhaserMath.FloatBetween(-10, 10);
			const y = (parent1.y + parent2.y) / 2 + PhaserMath.FloatBetween(-10, 10);

			// Create new boid of the same type
			const offspring = new Boid(this.scene, x, y, parent1.getVariant());
			this.scene.add.existing(offspring);

			// Add to flock
			this.addBoid(offspring);

			// Emit event
			EventBus.emit('boid-reproduced', {
				parent1,
				parent2,
				offspring
			});
		}
	}

	destroy() {
		// Clean up event listeners
		EventBus.off('alignment-weight-changed', undefined, this);
		EventBus.off('cohesion-weight-changed', undefined, this);
		EventBus.off('separation-weight-changed', undefined, this);
		EventBus.off('perception-radius-changed', undefined, this);
		EventBus.off('separation-radius-changed', undefined, this);
		EventBus.off('boundary-margin-changed', undefined, this);
		EventBus.off('boundary-force-changed', undefined, this);
		EventBus.off('boundary-force-ramp-changed', undefined, this);
		EventBus.off('obstacle-perception-radius-changed', undefined, this);
		EventBus.off('obstacle-force-changed', undefined, this);
		EventBus.off('boid-config-changed', undefined, this);
	}
}
