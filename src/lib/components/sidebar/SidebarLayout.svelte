<script lang="ts">
	import { Button } from '$ui/button';
	import SidebarContent from '$sidebar/SidebarContent.svelte';
	import SidebarFooter from '$sidebar/SidebarFooter.svelte';
	import { ResponsiveDialog } from '$ui/responsive-dialog';
	import { ArrowRight } from 'lucide-svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { fly } from 'svelte/transition';
	import { quintInOut } from 'svelte/easing';
	import { TooltipProvider, TooltipContent, TooltipTrigger, Tooltip } from '$ui/tooltip';

	interface Props {
		visible?: boolean;
		onClose?: () => void;
	}

	let { visible = $bindable(false), onClose }: Props = $props();
	let activeTab = $state('controls');

	const isDesktop = new MediaQuery('(min-width: 768px)');
	const xlScreen = new MediaQuery('(min-width: 1280px)');

	// Calculate sidebar width based on screen size
	const sidebarWidth = $derived(xlScreen.current ? '40%' : '60%');

	// Close button position calculation (positioned away from sidebar to avoid overlap)
	const buttonStyle = $derived(
		visible ? `right: calc(${sidebarWidth} + 0.75rem)` : 'right: -6.25rem'
	);

	function handleClose() {
		visible = false;
		onClose?.();
	}
</script>

{#if isDesktop.current && visible}
	<!-- Close Button - Only visible when sidebar is open -->
	<div
		class="absolute top-1/2 z-20 -translate-y-1/2 transition-all duration-300 ease-out"
		style={buttonStyle}
		transition:fly={{ x: 200, duration: 300, easing: quintInOut, delay: 50 }}
	>
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<Button
						variant="default"
						size="icon"
						class="bg-background shadow-md"
						onclick={handleClose}
					>
						<ArrowRight class="size-4 text-foreground" />
					</Button>
				</TooltipTrigger>
				<TooltipContent side="left" class="bg-background text-foreground">
					Hide Controls
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	</div>

	<!-- Sidebar  -->
	<div
		class="fixed right-0 top-0 z-10 flex h-full flex-col overflow-hidden border-s bg-card md:w-3/5 xl:w-2/5"
		transition:fly={{ x: 400, duration: 300, easing: quintInOut }}
	>
		<SidebarContent bind:activeTab />
		<SidebarFooter {activeTab} />
	</div>
{/if}

{#if !isDesktop.current}
	<ResponsiveDialog bind:open={visible}>
		{#snippet content()}
			<SidebarContent bind:activeTab />
		{/snippet}
		{#snippet footer()}
			<SidebarFooter {activeTab} />
		{/snippet}
	</ResponsiveDialog>
{/if}
