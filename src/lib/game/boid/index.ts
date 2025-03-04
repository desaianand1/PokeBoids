import { VectorUtils } from '$utils/vector';
import { BOID_DEFAULTS, type BoidConfig } from '$boid/config';
import { BoidPhysics } from '$boid/physics';

interface SteeringForce {
	readonly alignment: Phaser.Math.Vector2;
	readonly cohesion: Phaser.Math.Vector2;
	readonly separation: Phaser.Math.Vector2;
}
class FlockingBehavior {
	private config: BoidConfig;

	constructor(config: BoidConfig) {
		this.config = config;
	}

	public getNeighbors(boid: Boid, allBoids: Boid[]): Boid[] {
		return allBoids.filter((other) => {
			if (other === boid) return false;
			const distance = Phaser.Math.Distance.Between(boid.x, boid.y, other.x, other.y);
			return distance <= this.config.perceptionRadius;
		});
	}

	public calculateSteeringForces(boid: Boid, neighbors: Boid[]): SteeringForce {
		if (neighbors.length === 0) {
			return {
				alignment: Phaser.Math.Vector2.ZERO,
				cohesion: Phaser.Math.Vector2.ZERO,
				separation: Phaser.Math.Vector2.ZERO
			};
		}

		return {
			alignment: this.calculateAlignment(boid, neighbors),
			cohesion: this.calculateCohesion(boid, neighbors),
			separation: this.calculateSeparation(boid, neighbors)
		};
	}

	private calculateAlignment(boid: Boid, neighbors: Boid[]): Phaser.Math.Vector2 {
		if (neighbors.length === 0) return Phaser.Math.Vector2.ZERO;

		const avgVelocity = Phaser.Math.Vector2.ZERO;

		neighbors.forEach((neighbor) => {
			avgVelocity.add(neighbor.physics.velocity);
		});

		avgVelocity.scale(1 / neighbors.length);

		// Calculate desired velocity (target velocity at max speed)
		const desired = avgVelocity.normalize().scale(this.config.maxSpeed);

		// Calculate steering force (desired - current)
		return desired.subtract(boid.physics.velocity);
	}

	private calculateCohesion(boid: Boid, neighbors: Boid[]): Phaser.Math.Vector2 {
		if (neighbors.length === 0) return Phaser.Math.Vector2.ZERO;

		const centerOfMass = Phaser.Math.Vector2.ZERO;

		neighbors.forEach((neighbor) => {
			centerOfMass.add(new Phaser.Math.Vector2(neighbor.x, neighbor.y));
		});

		centerOfMass.scale(1 / neighbors.length);

		// Get direction to center of mass
		const directionToCenter = centerOfMass.subtract(new Phaser.Math.Vector2(boid.x, boid.y));

		if (directionToCenter.lengthSq() > 0) {
			// Calculate desired velocity (target velocity at max speed)
			const desired = directionToCenter.normalize().scale(this.config.maxSpeed);

			// Calculate steering force (desired - current)
			return desired.subtract(boid.physics.velocity);
		}

		return Phaser.Math.Vector2.ZERO;
	}

	private calculateSeparation(boid: Boid, neighbors: Boid[]): Phaser.Math.Vector2 {
		if (neighbors.length === 0) return new Phaser.Math.Vector2(0, 0);

		const avoidance = new Phaser.Math.Vector2(0, 0);
		let count = 0;

		neighbors.forEach((neighbor) => {
			const distance = Phaser.Math.Distance.Between(boid.x, boid.y, neighbor.x, neighbor.y);

			// Only separate from neighbors within half the perception radius
			if (distance < this.config.perceptionRadius * 0.5 && distance > 0) {
				const diff = new Phaser.Math.Vector2(boid.x - neighbor.x, boid.y - neighbor.y);

				// Weight by inverse square of distance
				diff.normalize().scale(1 / (distance * distance));
				avoidance.add(diff);
				count++;
			}
		});

		if (count > 0) {
			avoidance.scale(1 / count);

			if (avoidance.lengthSq() > 0) {
				// Calculate desired velocity (target velocity at max speed)
				const desired = avoidance.normalize().scale(this.config.maxSpeed);

				// Calculate steering force (desired - current)
				return desired.subtract(boid.physics.velocity);
			}
		}

		return Phaser.Math.Vector2.ZERO;
	}

	public getConfig(): BoidConfig {
		return this.config;
	}

	public updateConfig(newConfig: Partial<BoidConfig>): void {
		this.config = { ...this.config, ...newConfig };
	}
}

export class Boid extends Phaser.GameObjects.Triangle {
	private readonly flockingBehavior: FlockingBehavior;
	public readonly physics: BoidPhysics;
	private readonly boundaryMargin = 100;
    private readonly edgeForceMultiplier = 1.5;

	constructor(scene: Phaser.Scene, x: number, y: number, config: BoidConfig) {
		super(scene, x, y);

		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.setFillStyle(BOID_DEFAULTS.COLOR);

		const body = this.body as Phaser.Physics.Arcade.Body;
		this.physics = new BoidPhysics(body, config.maxSpeed);
		this.physics.setRandomVelocity();

		this.flockingBehavior = new FlockingBehavior(config);
	}

	private calculateBoundaryForce(): Phaser.Math.Vector2 {
        const force = new Phaser.Math.Vector2(0, 0);
        const bounds = {
            width: this.scene.scale.width,
            height: this.scene.scale.height
        };

        // Calculate distance from each boundary
        const distanceToLeft = this.x;
        const distanceToRight = bounds.width - this.x;
        const distanceToTop = this.y;
        const distanceToBottom = bounds.height - this.y;

        // Helper function to calculate force based on distance
        const calculateForceComponent = (distance: number, margin: number): number => {
            if (distance < margin) {
                // Exponential increase in force as distance decreases
                const normalizedDist = distance / margin;
                return (1 - normalizedDist) * this.edgeForceMultiplier;
            }
            return 0;
        };

        // Add forces from each boundary
        force.x += calculateForceComponent(distanceToRight, this.boundaryMargin);
        force.x -= calculateForceComponent(distanceToLeft, this.boundaryMargin);
        force.y += calculateForceComponent(distanceToBottom, this.boundaryMargin);
        force.y -= calculateForceComponent(distanceToTop, this.boundaryMargin);

        // Scale force based on current speed
        if (force.lengthSq() > 0) {
            const config = this.flockingBehavior.getConfig();
            force.normalize()
                 .scale(config.maxSpeed * 2) // Double max speed for stronger avoidance
                 .subtract(this.physics.velocity)
                 .limit(config.maxForce * this.edgeForceMultiplier);
        }

        return force;
    }

	public flock(allNeighbors: Boid[]): void {
		const neighbors = this.flockingBehavior.getNeighbors(this, allNeighbors);
		const forces = this.flockingBehavior.calculateSteeringForces(this, neighbors);
		const config = this.flockingBehavior.getConfig();

		// Add weighted forces
		const flockingForce = Phaser.Math.Vector2.ZERO
			.add(forces.alignment.clone().scale(config.alignmentWeight))
			.add(forces.cohesion.clone().scale(config.cohesionWeight))
			.add(forces.separation.clone().scale(config.separationWeight));

			const boundaryForce = this.calculateBoundaryForce();

		// Calculate combined force
		const combinedForce = Phaser.Math.Vector2.ZERO;

        if (boundaryForce.lengthSq() > 0) {
           // Stronger boundary avoidance near edges
            const boundaryWeight = Math.min(boundaryForce.length() / config.maxForce, 1);
            combinedForce
                .add(boundaryForce.scale(boundaryWeight))
                .add(flockingForce.scale(1 - boundaryWeight));
        } else {
            // Otherwise use normal flocking force
            combinedForce.add(flockingForce);
        }
		// Apply limited force
		const limitedForce = VectorUtils.limitMagnitude(combinedForce, config.maxForce);
		this.physics.addForce(limitedForce);
		this.physics.normalizeSpeed();
	}

	public update(): void {
		if (this.physics.velocity.lengthSq() > 0.01) {
			// Only rotate if moving
			this.rotation = Math.atan2(this.physics.velocity.y, this.physics.velocity.x) + Math.PI / 2;
		}
	}

	public updateConfig(newConfig: Partial<BoidConfig>): void {
		this.flockingBehavior.updateConfig(newConfig);
		if (newConfig.maxSpeed !== undefined) {
			this.physics.updateMaxSpeed(newConfig.maxSpeed);
		}
	}
}
