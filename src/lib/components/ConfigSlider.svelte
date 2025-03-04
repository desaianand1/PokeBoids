<script lang="ts">
	interface ConfigSliderProps {
		label: string;
		value: number;
		min: number;
		max: number;
		step: number;
		description?: string;
		onChange: (newValue: number) => void;
	}

	const { label, value, min, max, step, description, onChange }: ConfigSliderProps = $props();

	function handleInput(event: Event) {
		const newValue = parseFloat((event.target as HTMLInputElement).value);
		onChange(newValue);
	}
</script>

<div class="mb-4">
	<div class="mb-1 flex items-center gap-2">
		<label class="text-sm font-medium text-gray-700" for={`input-${label}`}>
			{label}: {value.toFixed(2)}
		</label>
		{#if description}
			<div class="group relative">
				<span class="cursor-help text-gray-400">ⓘ</span>
				<div
					class="invisible absolute bottom-full mb-2 w-48 rounded bg-gray-800 p-2 text-sm text-white shadow-lg group-hover:visible"
				>
					{description}
				</div>
			</div>
		{/if}
	</div>
	<input
		id={`input-${label}`}
		name={`input-${label}`}
		type="range"
		{min}
		{max}
		{step}
		{value}
		oninput={handleInput}
		class="w-full"
	/>
</div>
