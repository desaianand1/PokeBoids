import type { IUIDisplayStrategy, IUIVisibilityConfig } from '$interfaces/strategy';
import type { SimulationMode } from '$config/types';

/**
 * Simple Boids UI display strategy
 * Shows unified boid controls without predator/prey distinctions
 */
export class SimpleBoidsUIStrategy implements IUIDisplayStrategy {
	readonly mode: SimulationMode = 'simple' as SimulationMode;

	getVisibilityConfig(): IUIVisibilityConfig {
		return {
			showPreyCount: true,
			showPredatorCount: false,
			showObstacleCount: true,
			showPredatorStats: false,
			showPreyStats: true,
			showBiologicalStats: false,
			showPredatorSliders: false,
			showPreySliders: true,
			showBiologicalSliders: false
		};
	}

	getLabels() {
		return {
			modeTitle: 'Simple Boids',
			modeDescription: 'Unified flocking behavior with basic rules',
			preyLabel: 'Boids',
			predatorLabel: 'Predators'
		};
	}

	getConfirmationConfig() {
		return {
			requiresConfirmation: false,
			confirmationTitle: '',
			confirmationMessage: ''
		};
	}
}

/**
 * Predator-Prey UI display strategy
 * Shows separate controls for predators and prey with biological systems
 */
export class PredatorPreyUIStrategy implements IUIDisplayStrategy {
	readonly mode: SimulationMode = 'predator-prey' as SimulationMode;

	getVisibilityConfig(): IUIVisibilityConfig {
		return {
			showPreyCount: true,
			showPredatorCount: true,
			showObstacleCount: true,
			showPredatorStats: true,
			showPreyStats: true,
			showBiologicalStats: true,
			showPredatorSliders: true,
			showPreySliders: true,
			showBiologicalSliders: true
		};
	}

	getLabels() {
		return {
			modeTitle: 'Predator-Prey Ecosystem',
			modeDescription: 'Biological interactions with hunting, fleeing, and reproduction',
			preyLabel: 'Prey',
			predatorLabel: 'Predators'
		};
	}

	getConfirmationConfig() {
		return {
			requiresConfirmation: true,
			confirmationTitle: 'Switch to Predator-Prey Mode?',
			confirmationMessage:
				'This will restart the simulation with biological interactions enabled. Continue?'
		};
	}
}

/**
 * Factory for creating UI display strategies
 */
export class UIDisplayStrategyFactory {
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
