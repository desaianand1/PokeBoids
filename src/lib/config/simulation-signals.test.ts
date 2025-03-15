import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from '$game/event-bus';
import * as simulationSignals from '$config/simulation-signals.svelte';
import { DEFAULT_BOID_CONFIG, DEFAULT_SIMULATION_CONFIG } from '../../../setup-tests';

describe('Simulation Signals', () => {
	beforeEach(() => {
		vi.spyOn(EventBus, 'emit');

		// Reset to default values between tests
		simulationSignals.resetToDefaults();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	/**
	 * Test initial configuration
	 */
	describe('Initial state', () => {
		it('should initialize with expected default values', () => {
			// Arrange & Act - just get the current state
			const boidConfig = simulationSignals.getBoidConfig();
			const simulationConfig = simulationSignals.getSimulationConfig();
			const isPlaying = simulationSignals.isSimulationPlaying();
			const debugMode = simulationSignals.getDebugMode();
			const simulationSpeed = simulationSignals.getCurrentSimulationSpeed();

			// Assert - check values match our defaults
			// We don't hardcode the expected values, but use the imported defaults

			// Boid config
			expect(boidConfig.alignmentWeight).toBe(DEFAULT_BOID_CONFIG.alignmentWeight);
			expect(boidConfig.cohesionWeight).toBe(DEFAULT_BOID_CONFIG.cohesionWeight);
			expect(boidConfig.separationWeight).toBe(DEFAULT_BOID_CONFIG.separationWeight);

			// Simulation config
			expect(simulationConfig.initialPreyCount).toBe(DEFAULT_SIMULATION_CONFIG.initialPreyCount);
			expect(simulationConfig.initialPredatorCount).toBe(
				DEFAULT_SIMULATION_CONFIG.initialPredatorCount
			);

			// State defaults
			expect(isPlaying).toBe(true);
			expect(debugMode).toBe(false);
			expect(simulationSpeed).toBe(1.0);
		});
	});

	/**
	 * Test config update functions
	 */
	describe('Configuration updates', () => {
		it('should update boid config and emit events', () => {
			// Arrange
			vi.clearAllMocks();

			// Act - update a specific property
			const newValue = 0.5;
			simulationSignals.updateBoidConfig('alignmentWeight', newValue);

			// Assert
			// Check the value updated
			const config = simulationSignals.getBoidConfig();
			expect(config.alignmentWeight).toBe(newValue);

			// Check events were emitted
			expect(EventBus.emit).toHaveBeenCalledWith('alignment-weight-changed', { value: newValue });
			expect(EventBus.emit).toHaveBeenCalledWith('boid-config-changed', {
				config: expect.anything()
			});
		});

		it('should update simulation config and emit events', () => {
			// Arrange
			vi.clearAllMocks();

			// Act - update a specific property
			const newValue = 50;
			simulationSignals.updateSimulationConfig('initialPreyCount', newValue);

			// Assert
			// Check the value updated
			const config = simulationSignals.getSimulationConfig();
			expect(config.initialPreyCount).toBe(newValue);

			// Check events were emitted
			expect(EventBus.emit).toHaveBeenCalledWith('initial-prey-count-changed', { value: newValue });
			expect(EventBus.emit).toHaveBeenCalledWith('simulation-config-changed', {
				config: expect.anything()
			});
		});
	});

	/**
	 * Test simulation control functions
	 */
	describe('Simulation controls', () => {
		it('should toggle play/pause state', () => {
			// Arrange
			vi.clearAllMocks();

			// Initial state is playing
			expect(simulationSignals.isSimulationPlaying()).toBe(true);

			// Act - pause
			simulationSignals.togglePlayPause();

			// Assert
			expect(simulationSignals.isSimulationPlaying()).toBe(false);
			expect(EventBus.emit).toHaveBeenCalledWith('simulation-paused', undefined);

			// Act - resume
			vi.clearAllMocks();
			simulationSignals.togglePlayPause();

			// Assert
			expect(simulationSignals.isSimulationPlaying()).toBe(true);
			expect(EventBus.emit).toHaveBeenCalledWith('simulation-started', undefined);
		});

		it('should toggle debug mode', () => {
			// Arrange
			vi.clearAllMocks();
			expect(simulationSignals.getDebugMode()).toBe(false);

			// Act
			simulationSignals.toggleDebugMode();

			// Assert
			expect(simulationSignals.getDebugMode()).toBe(true);
			expect(EventBus.emit).toHaveBeenCalledWith('debug-toggle', { enabled: true });
		});

		it('should change simulation speed within valid ranges', () => {
			// Arrange
			const initialSpeed = simulationSignals.getCurrentSimulationSpeed();
			const { min, max } = simulationSignals.getSimulationSpeedRange();
			vi.clearAllMocks();

			// Act - advance speed
			simulationSignals.advanceSimulationSpeed();

			// Assert
			const newSpeed = simulationSignals.getCurrentSimulationSpeed();
			expect(newSpeed).toBeGreaterThan(initialSpeed);
			expect(EventBus.emit).toHaveBeenCalledWith('simulation-speed-changed', { value: newSpeed });

			// Test boundaries - go to max speed
			while (simulationSignals.getCurrentSimulationSpeed() < max) {
				simulationSignals.advanceSimulationSpeed();
			}

			vi.clearAllMocks();
			simulationSignals.advanceSimulationSpeed(); // Try to exceed max

			// Should be capped at max
			expect(simulationSignals.getCurrentSimulationSpeed()).toBe(max);
			expect(EventBus.emit).not.toHaveBeenCalled(); // No event if no change

			// Test minimum boundary
			while (simulationSignals.getCurrentSimulationSpeed() > min) {
				simulationSignals.slowSimulationSpeed();
			}

			vi.clearAllMocks();
			simulationSignals.slowSimulationSpeed(); // Try to go below min

			// Should be capped at min
			expect(simulationSignals.getCurrentSimulationSpeed()).toBe(min);
			expect(EventBus.emit).not.toHaveBeenCalled(); // No event if no change
		});

		it('should trigger simulation reset', () => {
			// Arrange
			vi.clearAllMocks();

			// Act
			simulationSignals.resetSimulation();

			// Assert
			expect(EventBus.emit).toHaveBeenCalledWith('simulation-reset', undefined);
		});
	});

	/**
	 * Test reset functionality
	 */
	describe('Reset to defaults', () => {
		it('should reset all settings to defaults', () => {
			// Arrange - modify some settings
			simulationSignals.updateBoidConfig('alignmentWeight', 0.1);
			simulationSignals.updateSimulationConfig('initialPreyCount', 25);
			simulationSignals.togglePlayPause(); // Set to paused
			simulationSignals.toggleDebugMode(); // Enable debug
			simulationSignals.advanceSimulationSpeed(); // Change speed

			// Verify changes were applied
			expect(simulationSignals.getBoidConfig().alignmentWeight).toBe(0.1);
			expect(simulationSignals.getSimulationConfig().initialPreyCount).toBe(25);
			expect(simulationSignals.isSimulationPlaying()).toBe(false);
			expect(simulationSignals.getDebugMode()).toBe(true);
			expect(simulationSignals.getCurrentSimulationSpeed()).not.toBe(1.0);

			vi.clearAllMocks();

			// Act
			simulationSignals.resetToDefaults();

			// Assert - all values should be back to defaults
			expect(simulationSignals.getBoidConfig().alignmentWeight).toBe(
				DEFAULT_BOID_CONFIG.alignmentWeight
			);
			expect(simulationSignals.getSimulationConfig().initialPreyCount).toBe(
				DEFAULT_SIMULATION_CONFIG.initialPreyCount
			);
			expect(simulationSignals.isSimulationPlaying()).toBe(true);
			expect(simulationSignals.getDebugMode()).toBe(false);
			expect(simulationSignals.getCurrentSimulationSpeed()).toBe(1.0);

			// Events should be emitted for the changes
			expect(EventBus.emit).toHaveBeenCalledTimes(expect.any(Number));
			expect(EventBus.emit).toHaveBeenCalledWith('boid-config-changed', expect.anything());
			expect(EventBus.emit).toHaveBeenCalledWith('simulation-config-changed', expect.anything());
		});
	});
});
