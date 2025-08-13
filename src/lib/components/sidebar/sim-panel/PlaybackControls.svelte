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
					<Pause
						data-playing={isPlaying}
						class="size-6 opacity-100 transition-opacity duration-300 ease-in-out data-[playing=false]:opacity-0"
					/>

					<Play
						data-playing={isPlaying}
						class="absolute size-6 opacity-100 transition-opacity duration-300 ease-in-out data-[playing=true]:opacity-0"
					/>
				</Button>
			</TooltipTrigger>
			<TooltipContent class="border border-muted bg-background text-foreground"
				>{isPlaying ? 'Pause' : 'Resume'}</TooltipContent
			>
		</Tooltip>
		<Tooltip>
			<TooltipTrigger>
				<Button variant="destructive" size="icon" onclick={onReset} aria-label="Reset">
					<RotateCcw class="size-6" />
				</Button>
			</TooltipTrigger>
			<TooltipContent
				class="bg-destructive text-destructive-foreground transition-colors duration-300 ease-in-out hover:bg-red-400 dark:hover:bg-red-700"
				>Restart Simulation</TooltipContent
			>
		</Tooltip>
	</TooltipProvider>
</div>
