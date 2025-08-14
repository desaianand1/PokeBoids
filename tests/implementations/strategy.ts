import type { Scene } from 'phaser';
import type { IBoid, IBoidDependencies } from '$interfaces/boid';
import type { IFlockingConfig } from '$interfaces/flocking';
import type { ISimulationModeStrategy, ISpawnConfig } from '$interfaces/strategy';
import type { BoidConfig, SimulationConfig, SimulationMode, BoundaryMode } from '$config/types';
import { BoidFactory } from '$boid/boid-factory';

/**
 * Test implementation of simulation mode strategy for unit testing
 */
export class TestSimulationModeStrategy implements ISimulationModeStrategy {
	constructor(public readonly mode: SimulationMode = 'simple' as SimulationMode) {}

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
		// Test implementation: return all neighbors (simple mode behavior)
		return neighbors;
	}

	calculateSpawnCounts(simConfig: SimulationConfig): ISpawnConfig {
		return {
			prey: simConfig.initialPreyCount.default,
			predators: simConfig.initialPredatorCount.default
		};
	}

	isPredatorPreyInteractionEnabled(): boolean {
		return this.mode === 'predator-prey';
	}

	areBiologicalSystemsEnabled(): boolean {
		return this.mode === 'predator-prey';
	}
}

// Create default test strategy instance
export const testStrategy = new TestSimulationModeStrategy();
