import type { ISimulationModeStrategy, IUIDisplayStrategy } from '$interfaces/strategy';
import type { SimulationMode } from '$config/types';
import { SimpleBoidsStrategy } from './simple-boids-strategy';
import { PredatorPreyStrategy } from './predator-prey-strategy';
import { SimpleBoidsUIStrategy, PredatorPreyUIStrategy } from './ui-display';

/**
 * Factory for creating simulation mode strategies
 */
export class SimulationModeStrategyFactory {
	/**
	 * Create a simulation mode strategy instance
	 */
	static createSimulationStrategy(mode: SimulationMode): ISimulationModeStrategy {
		switch (mode) {
			case 'simple':
				return new SimpleBoidsStrategy();
			case 'predator-prey':
				return new PredatorPreyStrategy();
			default:
				throw new Error(`Unknown simulation mode: ${mode}`);
		}
	}

	/**
	 * Create a UI display strategy instance
	 */
	static createUIStrategy(mode: SimulationMode): IUIDisplayStrategy {
		switch (mode) {
			case 'simple':
				return new SimpleBoidsUIStrategy();
			case 'predator-prey':
				return new PredatorPreyUIStrategy();
			default:
				throw new Error(`Unknown simulation mode: ${mode}`);
		}
	}
}
