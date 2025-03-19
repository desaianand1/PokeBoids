/**
 * Generic parameter type for configuration values
 */
export type Parameter<T> = T extends boolean
	? { default: boolean }
	: { min: T; max: T; default: T; step?: T };

	type BoidConfigValues = {
		// Core flocking behavior
		alignmentWeight: number;
		cohesionWeight: number;
		separationWeight: number;
	
		// Perception
		perceptionRadius: number;
		separationRadius: number;
	
		// Boundary handling
		boundaryMargin: number;
		boundaryForceMultiplier: number;
		boundaryForceRamp: number;
	
		// Obstacle avoidance
		obstaclePerceptionRadius: number;
		obstacleForceMultiplier: number;
	
		// Movement
		maxSpeed: number;
		maxForce: number;
	};
	
	interface SimulationConfigValues {
		// Simulation settings
		initialPreyCount: number;
		initialPredatorCount: number;
	
		// Environment settings
		obstacleCount: number;
	
		// Statistics tracking
		trackStats: boolean;
	}
	
	export type BoidConfig = {
		[K in keyof BoidConfigValues]: Parameter<BoidConfigValues[K]>;
	};
	
	export type SimulationConfig = {
		[K in keyof SimulationConfigValues]: Parameter<SimulationConfigValues[K]>;
	};