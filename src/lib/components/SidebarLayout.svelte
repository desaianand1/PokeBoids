<script lang="ts">
	import { Button } from '$ui/button';
	import SidebarContent from '$components/shared/SidebarContent.svelte';
	import { ArrowLeft, ArrowRight, Settings2 } from '@lucide/svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { TooltipProvider, TooltipContent, TooltipTrigger, Tooltip } from '$ui/tooltip';
	import { SheetTrigger, Sheet, SheetContent } from '$ui/sheet';

	const xlScreen = new MediaQuery('(min-width: 1280px)');

	// UI State
	let sidebarVisible = $state(false);

	// Calculate sidebar width based on screen size
	const sidebarWidth = $derived(xlScreen.current ? '40%' : '60%');

	// Button position calculation
	const buttonStyle = $derived(
		sidebarVisible ? `right: calc(${sidebarWidth} + 10px)` : 'right: 1rem'
	);

	function toggleSidebar() {
		sidebarVisible = !sidebarVisible;
	}
</script>

<div class="hidden md:block">
	<!-- Toggle Button - Always positioned relative to sidebar edge -->
	<div
		class="absolute top-1/2 z-20 -translate-y-1/2 transition-all duration-300 ease-out"
		style={buttonStyle}
	>
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<Button
						variant="default"
						size="icon"
						class="bg-background shadow-md"
						onclick={toggleSidebar}
					>
						{#if sidebarVisible}
							<ArrowRight class="h-4 w-4 text-foreground" />
						{:else}
							<ArrowLeft class="h-4 w-4 text-foreground" />
						{/if}
					</Button>
				</TooltipTrigger>
				<TooltipContent side="left" class="bg-background text-foreground">
					{sidebarVisible ? 'Hide Controls' : 'Show Controls'}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	</div>

	<!-- Sidebar with Svelte transitions -->
	{#if sidebarVisible}
		<div
			class="fixed right-0 top-0 z-10 h-full overflow-hidden border-s bg-card backdrop-blur-sm md:w-3/5 xl:w-2/5"
			transition:fly={{ x: 400, duration: 300, easing: quintOut }}
		>
			<SidebarContent />
		</div>
	{/if}
</div>

<div class="absolute bottom-5 right-5 z-10 mx-auto md:hidden">
	<Sheet>
		<SheetTrigger>
			<Button
				variant="secondary"
				size="sm"
				class="bg-background/90 text-foreground shadow-md backdrop-blur-sm"
			>
				<Settings2 class="mr-2 h-4 w-4" />
				Controls
			</Button>
		</SheetTrigger>
		<SheetContent side="bottom" class="h-2/3 overflow-y-auto rounded-t-xl">
			<SidebarContent />
		</SheetContent>
	</Sheet>
</div>
