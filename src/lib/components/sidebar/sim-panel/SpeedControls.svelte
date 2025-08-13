<script lang="ts">
	import { Button } from '$ui/button';
	import { FastForward, Rewind } from '@lucide/svelte';
	import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '$ui/tooltip';
	import type { SimulationSpeed } from '$config/simulation-signals.svelte';

	interface SpeedControlsProps {
		speed: number;
		minSpeed: number;
		maxSpeed: number;
		onSlowDown: () => SimulationSpeed;
		onSpeedUp: () => SimulationSpeed;
	}

	const { speed, minSpeed, maxSpeed, onSlowDown, onSpeedUp }: SpeedControlsProps = $props();
</script>

<div class="flex items-center gap-2">
	<TooltipProvider>
		<Tooltip>
			<TooltipTrigger disabled={speed <= minSpeed} class="disabled:cursor-not-allowed">
				<Button
					variant="ghost"
					size="icon"
					class="size-8"
					onclick={onSlowDown}
					disabled={speed <= minSpeed}
				>
					<Rewind class="size-4" />
				</Button>
			</TooltipTrigger>
			<TooltipContent class="border border-muted bg-background text-foreground"
				>Slow Down Simulation</TooltipContent
			>
		</Tooltip>

		<p class="w-20 text-center font-mono text-sm">
			{speed.toFixed(1)}x
		</p>

		<Tooltip>
			<TooltipTrigger disabled={speed >= maxSpeed} class="disabled:cursor-not-allowed">
				<Button
					variant="ghost"
					size="icon"
					class="size-8"
					onclick={onSpeedUp}
					disabled={speed >= maxSpeed}
				>
					<FastForward class="size-4" />
				</Button>
			</TooltipTrigger>
			<TooltipContent class="border border-muted bg-background text-foreground"
				>Speed Up Simulation</TooltipContent
			>
		</Tooltip>
	</TooltipProvider>
</div>
