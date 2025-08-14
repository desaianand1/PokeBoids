import type { Scene } from 'phaser';
import type { IBoid, IBoidDependencies } from '$interfaces/boid';
import type { IFlockingConfig } from '$interfaces/flocking';
import type { BoidConfig, SimulationConfig, SimulationMode } from '$config/types';
import type { BoidFactory } from '$boid/boid-factory';

/**
 * Configuration for population spawning
 */
export interface ISpawnConfig {
	prey: number;
	predators: number;
}

/**
 * Core strategy interface for simulation mode behavior
 */
export interface ISimulationModeStrategy {
	readonly mode: SimulationMode;

	/**
	 * Create a boid factory configured for this mode
	 */
	createBoidFactory(scene: Scene, deps: Omit<IBoidDependencies, 'config'>): BoidFactory;

	/**
	 * Create flocking configuration for this mode
	 */
	createFlockingConfig(boidConfig: BoidConfig, simConfig: SimulationConfig): IFlockingConfig;

	/**
	 * Filter neighbors based on mode-specific rules
	 */
	filterNeighbors(boid: IBoid, neighbors: IBoid[]): IBoid[];

	/**
	 * Calculate boid spawn counts based on mode and configuration
	 */
	calculateSpawnCounts(simConfig: SimulationConfig): ISpawnConfig;

	/**
	 * Check if predator-specific functionality should be enabled
	 */
	isPredatorPreyInteractionEnabled(): boolean;

	/**
	 * Check if biological systems (health, combat, reproduction) should be active
	 */
	areBiologicalSystemsEnabled(): boolean;
}

/**
 * UI visibility configuration for different components
 */
export interface IUIVisibilityConfig {
	showPreyCount: boolean;
	showPredatorCount: boolean;
	showObstacleCount: boolean;
	showPredatorStats: boolean;
	showPreyStats: boolean;
	showBiologicalStats: boolean;
	showPredatorSliders: boolean;
	showPreySliders: boolean;
	showBiologicalSliders: boolean;
}

/**
 * Strategy interface for UI display logic
 */
export interface IUIDisplayStrategy {
	readonly mode: SimulationMode;

	/**
	 * Get visibility configuration for UI components
	 */
	getVisibilityConfig(): IUIVisibilityConfig;

	/**
	 * Get display labels for UI components
	 */
	getLabels(): {
		modeTitle: string;
		modeDescription: string;
		preyLabel: string;
		predatorLabel: string;
	};

	/**
	 * Get configuration for confirmation dialogs
	 */
	getConfirmationConfig(): {
		requiresConfirmation: boolean;
		confirmationTitle: string;
		confirmationMessage: string;
	};
}
