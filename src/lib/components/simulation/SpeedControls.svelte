<script lang="ts">
	import { Button } from '$ui/button';
	import { FastForward, Rewind } from '@lucide/svelte';
	import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '$ui/tooltip';

	interface SpeedControlsProps {
		speed: number;
		minSpeed: number;
		maxSpeed: number;
		onSlowDown: () => void;
		onSpeedUp: () => void;
	}

	const { speed, minSpeed, maxSpeed, onSlowDown, onSpeedUp }: SpeedControlsProps = $props();
</script>

<div class="flex items-center gap-2">
	<TooltipProvider>
		<Tooltip>
			<TooltipTrigger>
				<Button
					variant="ghost"
					size="icon"
					class="h-8 w-8"
					onclick={onSlowDown}
					disabled={speed <= minSpeed}
				>
					<Rewind class="h-4 w-4" />
				</Button>
			</TooltipTrigger>
			<TooltipContent class="border border-muted bg-background text-foreground"
				>Slow Down Simulation</TooltipContent
			>
		</Tooltip>

		<div class="w-20 text-center font-mono text-sm">
			{speed.toFixed(1)}x
		</div>
		<Tooltip>
			<TooltipTrigger>
				<Button
					variant="ghost"
					size="icon"
					class="h-8 w-8"
					onclick={onSpeedUp}
					disabled={speed >= maxSpeed}
				>
					<FastForward class="h-4 w-4" />
				</Button>
			</TooltipTrigger>
			<TooltipContent class="border border-muted bg-background text-foreground"
				>Speed Up Simulation</TooltipContent
			>
		</Tooltip>
	</TooltipProvider>
</div>
