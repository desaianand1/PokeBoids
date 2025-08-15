<script lang="ts">
	import ParameterSlider from '$components/shared/ParameterSlider.svelte';
	import type { BoidConfig } from '$config/types';

	// Extract only avoidance-related parameters
	type AvoidanceParams = Pick<
		BoidConfig,
		| 'boundaryMargin'
		| 'boundaryForceMultiplier'
		| 'boundaryForceRamp'
		| 'obstaclePerceptionRadius'
		| 'obstacleForceMultiplier'
	>;

	interface AvoidanceTabProps extends AvoidanceParams {
		onUpdate: <K extends keyof AvoidanceParams>(key: K, value: AvoidanceParams[K]) => void;
	}

	const {
		boundaryMargin,
		boundaryForceMultiplier,
		boundaryForceRamp,
		obstaclePerceptionRadius,
		obstacleForceMultiplier,
		onUpdate
	}: AvoidanceTabProps = $props();

	function createUpdateHandler<K extends keyof AvoidanceParams>(key: K) {
		const param = {
			boundaryMargin,
			boundaryForceMultiplier,
			boundaryForceRamp,
			obstaclePerceptionRadius,
			obstacleForceMultiplier
		}[key];

		return (value: number) => {
			onUpdate(key, { ...param, default: value });
		};
	}
</script>

<div class="space-y-4">
	<ParameterSlider
		id="boundary-margin"
		label="Boundary Margin"
		value={boundaryMargin.default}
		min={boundaryMargin.min}
		max={boundaryMargin.max}
		step={boundaryMargin.step}
		formatValue={(val) => `${val.toFixed(0)}px`}
		onChange={createUpdateHandler('boundaryMargin')}
		description="Distance from world edge where boundary avoidance forces start"
	/>

	<ParameterSlider
		id="boundary-force"
		label="Boundary Force"
		value={boundaryForceMultiplier.default}
		min={boundaryForceMultiplier.min}
		max={boundaryForceMultiplier.max}
		step={boundaryForceMultiplier.step}
		formatValue={(val) => `${val.toFixed(1)}x`}
		onChange={createUpdateHandler('boundaryForceMultiplier')}
		description="Strength multiplier for forces pushing boids away from boundaries"
	/>

	<ParameterSlider
		id="boundary-ramp"
		label="Boundary Ramp"
		value={boundaryForceRamp.default}
		min={boundaryForceRamp.min}
		max={boundaryForceRamp.max}
		step={boundaryForceRamp.step}
		formatValue={(val) => val.toFixed(1)}
		onChange={createUpdateHandler('boundaryForceRamp')}
		description="How gradually boundary forces increase as boids approach edges"
	/>

	<ParameterSlider
		id="obstacle-perception"
		label="Obstacle Perception"
		value={obstaclePerceptionRadius.default}
		min={obstaclePerceptionRadius.min}
		max={obstaclePerceptionRadius.max}
		step={obstaclePerceptionRadius.step}
		formatValue={(val) => `${val.toFixed(0)}px`}
		onChange={createUpdateHandler('obstaclePerceptionRadius')}
	/>

	<ParameterSlider
		id="obstacle-force"
		label="Obstacle Force"
		value={obstacleForceMultiplier.default}
		min={obstacleForceMultiplier.min}
		max={obstacleForceMultiplier.max}
		step={obstacleForceMultiplier.step}
		formatValue={(val) => `${val.toFixed(1)}x`}
		onChange={createUpdateHandler('obstacleForceMultiplier')}
	/>
</div>
