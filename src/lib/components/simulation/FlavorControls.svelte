<script lang="ts">
	import { ToggleGroup, ToggleGroupItem } from '$ui/toggle-group';
	import { Plane, Trees, Waves } from 'lucide-svelte';
	import type { SimulationFlavor } from '$boid/animation/types';
	
	interface Props {
		currentFlavor: SimulationFlavor;
		onFlavorChange: (flavor: SimulationFlavor, onCancel?: () => void) => void;
		disabled?: boolean;
	}
	
	let { currentFlavor, onFlavorChange, disabled = false }: Props = $props();
	
	// Track the visual state separately from the actual state for cancellation UX
	// Using $state + $effect pattern is required here to allow visual state reversion on cancel
	// eslint-disable-next-line svelte/prefer-writable-derived
	let visualFlavor = $state(currentFlavor);
	
	// Keep visual state in sync with actual state
	$effect(() => {
		visualFlavor = currentFlavor;
	});
	
	function handleChange(value: string | undefined) {
		if (value && !disabled && value !== currentFlavor) {
			// Update visual state immediately for responsive UI
			visualFlavor = value as SimulationFlavor;
			
			// Call parent with cancel callback
			onFlavorChange(value as SimulationFlavor, () => {
				// Revert visual state on cancel
				visualFlavor = currentFlavor;
			});
		}
	}
</script>

<div class="space-y-2">
	<ToggleGroup 
		type="single" 
		value={visualFlavor} 
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