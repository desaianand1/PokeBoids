<script lang="ts">
	import ParameterSlider from '$components/shared/ParameterSlider.svelte';
	import type { BoidConfig } from '$config/types';

	// Extract only flocking-related parameters
	type FlockingParams = Pick<
		BoidConfig,
		| 'alignmentWeight'
		| 'cohesionWeight'
		| 'separationWeight'
		| 'perceptionRadius'
		| 'separationRadius'
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
		onUpdate
	}: FlockingTabProps = $props();

	function createUpdateHandler<K extends keyof FlockingParams>(key: K) {
		const param = {
			alignmentWeight,
			cohesionWeight,
			perceptionRadius,
			separationRadius,
			separationWeight
		}[key];
		
		return (value: number) => {
			onUpdate(key, { ...param, default: value });
		};
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
		formatValue={(val) => val.toFixed(1)}
		onChange={createUpdateHandler('alignmentWeight')}
	/>

	<ParameterSlider
		id="cohesion-weight"
		label="Cohesion"
		value={cohesionWeight.default}
		min={cohesionWeight.min}
		max={cohesionWeight.max}
		step={cohesionWeight.step}
		formatValue={(val) => val.toFixed(1)}
		onChange={createUpdateHandler('cohesionWeight')}
	/>

	<ParameterSlider
		id="separation-weight"
		label="Separation"
		value={separationWeight.default}
		min={separationWeight.min}
		max={separationWeight.max}
		step={separationWeight.step}
		formatValue={(val) => val.toFixed(1)}
		onChange={createUpdateHandler('separationWeight')}
	/>

	<ParameterSlider
		id="perception-radius"
		label="Perception Radius"
		value={perceptionRadius.default}
		min={perceptionRadius.min}
		max={perceptionRadius.max}
		step={perceptionRadius.step}
		formatValue={(val) => `${val.toFixed(0)}px`}
		onChange={createUpdateHandler('perceptionRadius')}
	/>

	<ParameterSlider
		id="separation-radius"
		label="Separation Radius"
		value={separationRadius.default}
		min={separationRadius.min}
		max={separationRadius.max}
		step={separationRadius.step}
		formatValue={(val) => `${val.toFixed(0)}px`}
		onChange={createUpdateHandler('separationRadius')}
	/>
</div>
