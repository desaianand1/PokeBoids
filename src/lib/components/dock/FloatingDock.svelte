<script lang="ts">
	import { Button } from '$ui/button';
	import { CircleQuestionMark, Gamepad2, Volume2 } from 'lucide-svelte';
	import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '$ui/tooltip';
	import { cn } from '$lib/utils';
	import ThemeSwitcher from '$components/shared/ThemeSwitcher.svelte';
	import Separator from '$components/ui/separator/separator.svelte';

	interface Props {
		onControlsClick: () => void;
		onHelpClick: () => void;
		onSettingsClick?: () => void;
		class?: string;
	}

	let { onControlsClick, onHelpClick, onSettingsClick, class: className }: Props = $props();
	const tooltipDelay = 300;
	function handleSettingsClick() {
		if (onSettingsClick) {
			onSettingsClick();
		} else {
			// Placeholder for future implementation
			console.log('Settings not yet implemented');
		}
	}
</script>

<div
	class={cn(
		'fixed bottom-0 left-1/2 z-20 mb-8',
		'flex items-center gap-2 rounded-full border border-border/50',
		'bg-background/60 px-4 py-2 shadow-lg backdrop-blur-md',
		'transition-transform duration-300 ease-in-out',
		className
	)}
>
	<ThemeSwitcher
		variant="ghost"
		size="icon"
		className="rounded-full hover:bg-background/60"
		animateScale
	/>
	<Separator orientation="vertical" class="mx-0.5 h-8 bg-border" />

	<TooltipProvider>
		<!-- Controls Button -->
		<Tooltip delayDuration={tooltipDelay}>
			<TooltipTrigger>
				<Button
					variant="ghost"
					size="sm"
					class="group gap-2 rounded-full hover:bg-background/60"
					onclick={onControlsClick}
				>
					<Gamepad2 class="size-4 transition-transform ease-in-out group-hover:scale-125" />
					<span class="hidden sm:inline">Controls</span>
				</Button>
			</TooltipTrigger>
			<TooltipContent side="top" class="my-1 bg-background text-foreground">
				<p>Open simulation controls</p>
			</TooltipContent>
		</Tooltip>

		<!-- Help Button -->
		<Tooltip delayDuration={tooltipDelay}>
			<TooltipTrigger>
				<Button
					variant="ghost"
					size="sm"
					class="group gap-2 rounded-full hover:bg-background/60"
					onclick={onHelpClick}
				>
					<CircleQuestionMark
						class="size-4 transition-transform ease-in-out group-hover:scale-125"
					/>
					<span class="hidden sm:inline">Help</span>
				</Button>
			</TooltipTrigger>
			<TooltipContent side="top" class="my-1 bg-background text-foreground">
				<p>View help & tutorial</p>
			</TooltipContent>
		</Tooltip>

		<!-- Settings Button (Future) -->
		<Tooltip delayDuration={tooltipDelay}>
			<TooltipTrigger disabled class="disabled:cursor-not-allowed">
				<Button
					variant="ghost"
					size="sm"
					class="not-disabled:hover:bg-background/60 group gap-2 rounded-full disabled:cursor-not-allowed disabled:opacity-50"
					onclick={handleSettingsClick}
					disabled
				>
					<Volume2 class="size-4 transition-transform ease-in-out group-hover:scale-125" />
					<span class="hidden sm:inline">Audio</span>
				</Button>
			</TooltipTrigger>
			<TooltipContent side="top" class="my-1 bg-background text-foreground">
				<p>Audio settings (coming soon)</p>
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
</div>
