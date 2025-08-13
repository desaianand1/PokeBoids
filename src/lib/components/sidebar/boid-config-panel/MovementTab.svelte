<script lang="ts">
	import ParameterSlider from '$shared/ParameterSlider.svelte';
	import type { BoidConfig } from '$config/types';

	// Extract only movement-related parameters
	type MovementParams = Pick<BoidConfig, 'maxSpeed' | 'maxForce'>;

	interface MovementTabProps extends MovementParams {
		onUpdate: <K extends keyof MovementParams>(key: K, value: MovementParams[K]) => void;
	}

	const { maxSpeed, maxForce, onUpdate }: MovementTabProps = $props();

	function createUpdateHandler<K extends keyof MovementParams>(key: K) {
		const param = {
			maxSpeed,
			maxForce
		}[key];

		return (value: number) => {
			onUpdate(key, { ...param, default: value });
		};
	}
</script>

<div class="space-y-4">
	<ParameterSlider
		id="max-speed"
		label="Max Speed"
		value={maxSpeed.default}
		min={maxSpeed.min}
		max={maxSpeed.max}
		step={maxSpeed.step}
		formatValue={(val) => val.toFixed(0)}
		onChange={createUpdateHandler('maxSpeed')}
	/>

	<ParameterSlider
		id="max-force"
		label="Max Force"
		value={maxForce.default}
		min={maxForce.min}
		max={maxForce.max}
		step={maxForce.step}
		formatValue={(val) => val.toFixed(1)}
		onChange={createUpdateHandler('maxForce')}
	/>
</div>
