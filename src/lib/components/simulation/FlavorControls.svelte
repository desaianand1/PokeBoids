<script lang="ts">
	import { ToggleGroup, ToggleGroupItem } from '$ui/toggle-group';
	import { Plane, Trees, Waves } from 'lucide-svelte';
	import type { SimulationFlavor } from '$boid/animation/types';
	
	interface Props {
		currentFlavor: SimulationFlavor;
		onFlavorChange: (flavor: SimulationFlavor) => void;
		disabled?: boolean;
	}
	
	let { currentFlavor, onFlavorChange, disabled = false }: Props = $props();
	
	function handleChange(value: string | undefined) {
		if (value && !disabled) {
			onFlavorChange(value as SimulationFlavor);
		}
	}
</script>

<div class="space-y-2">
	<ToggleGroup 
		type="single" 
		value={currentFlavor} 
		onValueChange={handleChange}
		class="grid grid-cols-3 gap-2 w-full"
	>
		<ToggleGroupItem 
			value="air" 
			aria-label="Air environment"
			{disabled}
			class="flex items-center gap-2 px-3 py-2"
		>
			<Plane class="h-4 w-4" />
			<span class="text-sm font-medium">Air</span>
		</ToggleGroupItem>
		
		<ToggleGroupItem 
			value="land" 
			aria-label="Land environment"
			{disabled}
			class="flex items-center gap-2 px-3 py-2"
		>
			<Trees class="h-4 w-4" />
			<span class="text-sm font-medium">Land</span>
		</ToggleGroupItem>
		
		<ToggleGroupItem 
			value="water" 
			aria-label="Water environment"
			{disabled}
			class="flex items-center gap-2 px-3 py-2"
		>
			<Waves class="h-4 w-4" />
			<span class="text-sm font-medium">Water</span>
		</ToggleGroupItem>
	</ToggleGroup>
	
	{#if disabled}
		<p class="text-xs text-muted-foreground text-center">
			Flavor changes require simulation reset
		</p>
	{/if}
</div>