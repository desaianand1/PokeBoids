import type { Scene } from 'phaser';
import type { IBoid, IBoidDependencies } from '$interfaces/boid';
import type { IFlockingConfig } from '$interfaces/flocking';
import type { ISimulationModeStrategy, ISpawnConfig } from '$interfaces/strategy';
import type { BoidConfig, SimulationConfig, SimulationMode, BoundaryMode } from '$config/types';
import { BoidFactory } from '$boid/boid-factory';

/**
 * Strategy for Simple Boids mode - all boids treated as unified flock
 */
export class SimpleBoidsStrategy implements ISimulationModeStrategy {
	readonly mode: SimulationMode = 'simple' as SimulationMode;

	createBoidFactory(scene: Scene, deps: Omit<IBoidDependencies, 'config'>): BoidFactory {
		return new BoidFactory(scene, deps);
	}

	createFlockingConfig(boidConfig: BoidConfig, simConfig: SimulationConfig): IFlockingConfig {
		return {
			alignmentWeight: boidConfig.alignmentWeight.default,
			cohesionWeight: boidConfig.cohesionWeight.default,
			separationWeight: boidConfig.separationWeight.default,
			perceptionRadius: boidConfig.perceptionRadius.default,
			separationRadius: boidConfig.separationRadius.default,
			boundaryMargin: boidConfig.boundaryMargin.default,
			boundaryForceMultiplier: boidConfig.boundaryForceMultiplier.default,
			boundaryForceRamp: boidConfig.boundaryForceRamp.default,
			boundaryMode: simConfig.boundaryMode.default as BoundaryMode,
			boundaryStuckThreshold: simConfig.boundaryStuckThreshold.default
		};
	}

	filterNeighbors(boid: IBoid, neighbors: IBoid[]): IBoid[] {
		// Simple mode: all boids are neighbors regardless of group
		return neighbors;
	}

	calculateSpawnCounts(simConfig: SimulationConfig): ISpawnConfig {
		// Simple mode: spawn only "prey" type boids but treat them as generic boids
		const totalCount = simConfig.initialPreyCount.default + simConfig.initialPredatorCount.default;
		return {
			prey: totalCount,
			predators: 0
		};
	}

	isPredatorPreyInteractionEnabled(): boolean {
		return false;
	}

	areBiologicalSystemsEnabled(): boolean {
		return false;
	}
}
