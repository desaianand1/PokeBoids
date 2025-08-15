<script lang="ts">
	import ParameterSlider from '$shared/ParameterSlider.svelte';
	import type { BoidConfig } from '$config/types';
	import { debounce } from '$utils/debounce';

	// Memoized formatting functions
	const formatDegrees = (val: number) => `${((val * 180) / Math.PI).toFixed(0)}°`;
	const formatPixels = (val: number) => `${val.toFixed(0)}px`;
	const formatDecimal = (val: number) => val.toFixed(1);

	// Extract only flocking-related parameters
	type FlockingParams = Pick<
		BoidConfig,
		| 'alignmentWeight'
		| 'cohesionWeight'
		| 'separationWeight'
		| 'perceptionRadius'
		| 'separationRadius'
		| 'fieldOfViewAngle'
	>;

	interface FlockingTabProps extends FlockingParams {
		onUpdate: <K extends keyof FlockingParams>(key: K, value: FlockingParams[K]) => void;
	}

	const {
		alignmentWeight,
		cohesionWeight,
		perceptionRadius,
		separationRadius,
		separationWeight,
		fieldOfViewAngle,
		onUpdate
	}: FlockingTabProps = $props();

	function createUpdateHandler<K extends keyof FlockingParams>(key: K) {
		const param = {
			alignmentWeight,
			cohesionWeight,
			perceptionRadius,
			separationRadius,
			separationWeight,
			fieldOfViewAngle
		}[key];

		const updateFn = (value: number) => {
			// Skip update if value hasn't changed significantly
			if (Math.abs(param.default - value) < 0.0001) return;
			onUpdate(key, { ...param, default: value });
		};
		return debounce<[number]>(updateFn);
	}
</script>

<div class="space-y-4">
	<ParameterSlider
		id="alignment-weight"
		label="Alignment"
		value={alignmentWeight.default}
		min={alignmentWeight.min}
		max={alignmentWeight.max}
		step={alignmentWeight.step}
		formatValue={formatDecimal}
		onChange={createUpdateHandler('alignmentWeight')}
		description="How strongly boids align their direction with nearby neighbors"
	/>

	<ParameterSlider
		id="cohesion-weight"
		label="Cohesion"
		value={cohesionWeight.default}
		min={cohesionWeight.min}
		max={cohesionWeight.max}
		step={cohesionWeight.step}
		formatValue={formatDecimal}
		onChange={createUpdateHandler('cohesionWeight')}
		description="How strongly boids move toward the center of nearby neighbors"
	/>

	<ParameterSlider
		id="separation-weight"
		label="Separation"
		value={separationWeight.default}
		min={separationWeight.min}
		max={separationWeight.max}
		step={separationWeight.step}
		formatValue={formatDecimal}
		onChange={createUpdateHandler('separationWeight')}
		description="How strongly boids avoid crowding and maintain personal space"
	/>

	<ParameterSlider
		id="perception-radius"
		label="Perception Radius"
		value={perceptionRadius.default}
		min={perceptionRadius.min}
		max={perceptionRadius.max}
		step={perceptionRadius.step}
		formatValue={formatPixels}
		onChange={createUpdateHandler('perceptionRadius')}
	/>

	<ParameterSlider
		id="separation-radius"
		label="Separation Radius"
		value={separationRadius.default}
		min={separationRadius.min}
		max={separationRadius.max}
		step={separationRadius.step}
		formatValue={formatPixels}
		onChange={createUpdateHandler('separationRadius')}
		description="Distance at which boids begin avoiding each other to prevent crowding"
	/>

	<ParameterSlider
		id="field-of-view"
		label="Field of View"
		value={fieldOfViewAngle.default}
		min={fieldOfViewAngle.min}
		max={fieldOfViewAngle.max}
		step={fieldOfViewAngle.step}
		formatValue={formatDegrees}
		onChange={createUpdateHandler('fieldOfViewAngle')}
	/>
</div>
