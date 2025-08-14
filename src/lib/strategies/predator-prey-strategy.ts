import type { Scene } from 'phaser';
import type { IBoid, IBoidDependencies } from '$interfaces/boid';
import type { IFlockingConfig } from '$interfaces/flocking';
import type { ISimulationModeStrategy, ISpawnConfig } from '$interfaces/strategy';
import type { BoidConfig, SimulationConfig, SimulationMode, BoundaryMode } from '$config/types';
import { BoidFactory } from '$boid/boid-factory';

/**
 * Strategy for Predator-Prey mode - distinct species with biological interactions
 */
export class PredatorPreyStrategy implements ISimulationModeStrategy {
	readonly mode: SimulationMode = 'predator-prey' as SimulationMode;

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
		// Predator-prey mode: respect group-based flocking (existing behavior)
		return neighbors.filter((neighbor) => neighbor.getGroupId() === boid.getGroupId());
	}

	calculateSpawnCounts(simConfig: SimulationConfig): ISpawnConfig {
		// Predator-prey mode: spawn both predators and prey as configured
		return {
			prey: simConfig.initialPreyCount.default,
			predators: simConfig.initialPredatorCount.default
		};
	}

	isPredatorPreyInteractionEnabled(): boolean {
		return true;
	}

	areBiologicalSystemsEnabled(): boolean {
		return true;
	}
}
