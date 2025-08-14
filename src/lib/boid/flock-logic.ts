import type { IFlockingConfig } from '$interfaces/flocking';
import type { IBoid } from '$interfaces/boid';
import type { IVector2, IVectorFactory } from '$interfaces/vector';
import type { ISpatialPartitioning } from '$interfaces/spatial-partitioning';
import type { ISimulationModeStrategy } from '$interfaces/strategy';
import { AlignmentBehavior } from '$boid/behaviors/alignment-behavior';
import { CohesionBehavior } from '$boid/behaviors/cohesion-behavior';
import { SeparationBehavior } from '$boid/behaviors/separation-behavior';
import { BoundaryAvoidanceBehavior } from '$boid/behaviors/boundary-avoidance-behavior';
import { CompositeBehavior } from '$boid/behaviors/composite-behavior';
import { QuadTreePartitioning } from '$boid/spatial/quad-tree';
import type { IGameEventBus } from '$events/types';

/**
 * Core flock logic implementation independent of rendering framework
 */
export class FlockLogic {
	private compositeBehavior: CompositeBehavior;
	private spatialPartitioning: ISpatialPartitioning;

	constructor(
		private vectorFactory: IVectorFactory,
		private eventBus: IGameEventBus,
		private strategy: ISimulationModeStrategy,
		config: IFlockingConfig
	) {
		// Initialize spatial partitioning
		this.spatialPartitioning = new QuadTreePartitioning(eventBus);

		// Create individual behaviors
		const alignmentBehavior = new AlignmentBehavior(vectorFactory, config.alignmentWeight);

		const cohesionBehavior = new CohesionBehavior(vectorFactory, config.cohesionWeight);

		const separationBehavior = new SeparationBehavior(
			vectorFactory,
			config.separationWeight,
			config.separationRadius
		);

		const boundaryBehavior = new BoundaryAvoidanceBehavior(
			vectorFactory,
			config.boundaryForceMultiplier,
			config.boundaryForceRamp,
			config.boundaryMargin,
			config.boundaryMode,
			config.boundaryStuckThreshold,
			eventBus
		);

		// Combine behaviors
		this.compositeBehavior = new CompositeBehavior(
			[alignmentBehavior, cohesionBehavior, separationBehavior, boundaryBehavior],
			vectorFactory
		);
	}

	calculateForces(boid: IBoid, neighbors: IBoid[]): IVector2 {
		// Pass eventBus to composite behavior which will pass it to individual behaviors
		const force = this.compositeBehavior.calculate(boid, neighbors, this.eventBus);
		return force;
	}

	update(boids: IBoid[]): void {
		// Update spatial partitioning with current boids
		this.spatialPartitioning.update(boids);

		// For each boid, find neighbors and apply forces
		for (const boid of boids) {
			// Find neighbors within perception radius using spatial partitioning
			const neighbors = this.findNeighbors(boid, boid.getPerceptionRadius());

			// Calculate and apply forces
			const force = this.calculateForces(boid, neighbors);
			boid.applyForce(force);
		}
	}

	private findNeighbors(boid: IBoid, radius: number): IBoid[] {
		const position = boid.getBoidPosition();
		// Use spatial partitioning to efficiently find nearby boids
		const nearbyBoids = this.spatialPartitioning
			.findNearby(position, radius)
			.filter((other) => other !== boid) // Filter out the boid itself
			.filter((other) => boid.isInFieldOfView(other)); // Filter based on field of view

		// Use strategy to filter neighbors based on simulation mode
		return this.strategy.filterNeighbors(boid, nearbyBoids);
	}

	destroy(): void {
		// Clean up spatial partitioning
		this.spatialPartitioning.clear();
	}
}
