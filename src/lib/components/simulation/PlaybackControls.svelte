<script lang="ts">
	import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '$ui/tooltip';
	import { Button } from '$ui/button';
	import { Play, Pause, RotateCcw } from '@lucide/svelte';

	interface PlaybackControlsProps {
		isPlaying: boolean;
		onTogglePlayPause: () => void;
		onReset: () => void;
	}

	const { isPlaying, onTogglePlayPause, onReset }: PlaybackControlsProps = $props();
</script>

<div class="flex items-center gap-4">
	<TooltipProvider>
		<Tooltip>
			<TooltipTrigger>
				<Button
					variant="outline"
					size="icon"
					onclick={onTogglePlayPause}
					aria-label={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
				>
					{#if isPlaying}
						<Pause class="h-6 w-6" />
					{:else}
						<Play class="h-6 w-6" />
					{/if}
				</Button>
			</TooltipTrigger>
			<TooltipContent class="bg-background text-foreground border border-muted">{isPlaying ? 'Pause' : 'Resume'}</TooltipContent>
		</Tooltip>
		<Tooltip>
			<TooltipTrigger>
				<Button variant="destructive" size="icon" onclick={onReset} aria-label="Reset">
					<RotateCcw class="h-6 w-6" />
				</Button>
			</TooltipTrigger>
			<TooltipContent class="bg-destructive text-destructive-foreground"
				>Reset Simulation</TooltipContent
			>
		</Tooltip>
	</TooltipProvider>
</div>
