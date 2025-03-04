<script lang="ts">
	import ConfigSlider from '$components/ConfigSlider.svelte';
	import { type BoidConfig, CONFIG_FIELDS, BoidConfigValidator } from '$boid/config';
	import { EventBus } from '$game/event-bus';

	const { initialConfig }: { initialConfig: BoidConfig } = $props();
	let boidConfig: BoidConfig = $state(initialConfig);

	function updateConfig(key: keyof BoidConfig, value: number) {
		const validatedChange = BoidConfigValidator.validateConfig({ [key]: value });
		if (validatedChange[key] !== undefined) {
			boidConfig[key] = validatedChange[key]!;
			EventBus.emit('update-boid-config', validatedChange);
		}
	}
</script>

<div class="w-full overflow-y-auto bg-gray-100 p-4">
	<h2 class="mb-4 text-2xl font-bold">Boid Configuration</h2>
	{#each CONFIG_FIELDS as item}
		<ConfigSlider
			label={item.label}
			value={boidConfig[item.key]}
			min={item.bounds.min}
			max={item.bounds.max}
			step={item.bounds.step}
			onChange={(newValue) => updateConfig(item.key, newValue)}
		/>
	{/each}
</div>
