<script lang="ts">
	import PhaserGame from '$components/PhaserGame.svelte';
	import ThemeSwitcher from '$components/ThemeSwitcher.svelte';
	import SimulationControls from '$components/SimulationControls.svelte';
	import BoidConfigPanel from '$components/BoidConfigPanel.svelte';
	import StatsPanel from '$components/StatisticsPanel.svelte';
	import EventDebugPanel from '$components/EventDebugPanel.svelte';
	import { Button } from '$ui/button';
	import { Sheet, SheetTrigger, SheetContent } from '$ui/sheet';
	import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '$ui/collapsible';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$ui/tabs';
	import { ResizableHandle, ResizablePane, ResizablePaneGroup } from '$ui/resizable';
	import {
		Tooltip,
		Provider as TooltipProvider,
		TooltipContent,
		TooltipTrigger
	} from '$ui/tooltip';
	import { Badge } from '$ui/badge';
	import {
		ArrowLeft,
		ArrowRight,
		SlidersVertical,
		Settings2,
		ChartBar,
		Cpu,
		Info,
		ChevronDown
	} from '@lucide/svelte';
	import { gameVersion } from '$utils/version';

	// UI State
	let sidebarVisible = $state(false);

	function handleSceneReady(scene: Phaser.Scene) {
		console.debug('Scene ready:', scene.scene.key);
	}

	function handleGameError(error: Error) {
		console.error('Game error:', error);
	}

	function handleGameStarted() {
		console.debug('Game started');
	}

	function handleGameReset() {
		console.debug('Game reset');
	}

	// Toggle sidebar
	function toggleSidebar() {
		sidebarVisible = !sidebarVisible;
	}
</script>

<main class="flex h-screen w-screen overflow-hidden bg-background">
	<ResizablePaneGroup direction="horizontal">
		<!-- Main Game Area -->
		<ResizablePane defaultSize={80} minSize={60} maxSize={sidebarVisible ? 80 : 100}>
			<div class="relative h-full">
				<PhaserGame
					onGameError={handleGameError}
					onGameReset={handleGameReset}
					onGameStart={handleGameStarted}
					onSceneReady={handleSceneReady}
				/>

				<!-- Mobile Controls Button -->
				{@render mobileControlsButton()}

				<!-- Toggle Sidebar Button (Desktop) -->
				{@render sidebarToggleButton()}
			</div>
		</ResizablePane>

		{#if sidebarVisible}
			<!-- Resizable Handle -->
			<ResizableHandle withHandle />

			<!-- Sidebar Panel -->
			<ResizablePane defaultSize={40} minSize={25} maxSize={40} class="hidden md:block">
				<div class="flex h-full flex-col border-l bg-card">
					{@render sidebarContent()}
				</div>
			</ResizablePane>
		{/if}
	</ResizablePaneGroup>
</main>

{#snippet mobileControlsButton()}
	<div class="absolute right-3 top-3 z-10 mx-auto md:hidden">
		<Sheet>
			<SheetTrigger>
				<Button
					variant="secondary"
					size="sm"
					class="bg-background/30 text-foreground shadow-md backdrop-blur-md"
				>
					<Settings2 class="mr-2 h-4 w-4 text-foreground" />
					Controls
				</Button>
			</SheetTrigger>
			<SheetContent side="right" class="w-[90vw] max-w-md overflow-y-auto px-4 pt-6">
				{@render tabsSection('controls')}
			</SheetContent>
		</Sheet>
	</div>
{/snippet}

{#snippet sidebarToggleButton()}
	<div class="absolute bottom-1/2 right-4 top-1/2 z-10 my-auto hidden md:block">
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<Button
						variant="secondary"
						size="icon"
						class="bg-background/90 shadow-md backdrop-blur-sm"
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
{/snippet}

{#snippet sidebarContent()}
	<Tabs value="controls" class="flex flex-1 flex-col">
		<div class="border-b px-4 py-2">
			<TabsList class="grid w-full grid-cols-3">
				<TabsTrigger value="controls">
					<Cpu class="mr-2 h-4 w-4" />
					<span class="hidden sm:inline">Sim</span>
				</TabsTrigger>
				<TabsTrigger value="config">
					<SlidersVertical class="mr-2 h-4 w-4" />
					<span class="hidden sm:inline">Config</span>
				</TabsTrigger>
				<TabsTrigger value="stats">
					<ChartBar class="mr-2 h-4 w-4" />
					<span class="hidden sm:inline">Stats</span>
				</TabsTrigger>
			</TabsList>
		</div>

		<div class="flex-1 overflow-y-auto p-4">
			{@render tabsContent()}
		</div>
	</Tabs>

	<footer class="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
		<span class="flex items-center justify-center gap-4 p-2">
			<ThemeSwitcher variant="outline" size="icon" />
			<Badge variant="outline" class="py-2 font-mono text-xs">Boids Simulation</Badge>
		</span>
		<span class="text-secondary">v{gameVersion}</span>
	</footer>
{/snippet}

{#snippet tabsSection(defaultTab: string)}
	<Tabs value={defaultTab} class="w-full">
		<TabsList class="grid grid-cols-3">
			<TabsTrigger value="controls">
				<Cpu class="mr-2 h-4 w-4" /> Sim
			</TabsTrigger>
			<TabsTrigger value="config">
				<SlidersVertical class="mr-2 h-4 w-4" /> Config
			</TabsTrigger>
			<TabsTrigger value="stats">
				<ChartBar class="mr-2 h-4 w-4" /> Stats
			</TabsTrigger>
		</TabsList>
		<div class="mt-4 space-y-4">
			{@render tabsContent()}
		</div>
	</Tabs>
{/snippet}

{#snippet tabsContent()}
	<TabsContent value="controls" class="m-0 h-full">
		<div class="flex h-full flex-col space-y-4">
			<SimulationControls />
			{@render simulationInfo()}
		</div>
	</TabsContent>

	<TabsContent value="config" class="m-0 h-full">
		<div class="space-y-4">
			<BoidConfigPanel />
			{@render performanceTips()}
		</div>
	</TabsContent>

	<TabsContent value="stats" class="m-0 h-full">
		<div class="space-y-4">
			<StatsPanel />
			<EventDebugPanel />
		</div>
	</TabsContent>
{/snippet}

{#snippet simulationInfo()}
	<Collapsible class="group mt-auto">
		<CollapsibleTrigger>
			<Button variant="ghost" size="sm" class="flex w-full justify-between">
				<div class="flex items-center">
					<Info class="mr-2 h-4 w-4" />
					<span>Simulation Info</span>
				</div>
				<ChevronDown
					class="h-4 w-4 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180"
				/>
			</Button>
		</CollapsibleTrigger>
		<CollapsibleContent class="mt-2 rounded-md bg-muted/40 p-2 text-sm">
			<p>The Boids simulation demonstrates emergent flocking behaviors with three simple rules:</p>
			<ul class="ml-4 mt-2 list-disc space-y-1">
				<li>Separation: Avoid crowding neighbors</li>
				<li>Alignment: Steer towards average heading</li>
				<li>Cohesion: Steer towards average position</li>
			</ul>
		</CollapsibleContent>
	</Collapsible>
{/snippet}

{#snippet performanceTips()}
	<Collapsible class="group">
		<CollapsibleTrigger>
			<Button variant="ghost" size="sm" class="flex w-full justify-between">
				<div class="flex items-center">
					<Info class="mr-2 h-4 w-4" />
					<span>Performance Tips</span>
				</div>
				<ChevronDown
					class="h-4 w-4 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180"
				/>
			</Button>
		</CollapsibleTrigger>
		<CollapsibleContent class="mt-2 rounded-md bg-muted/40 p-2 text-sm">
			<p>For better performance:</p>
			<ul class="ml-4 mt-2 list-disc space-y-1">
				<li>Reduce boid count if FPS drops below 30</li>
				<li>Lower perception radius for large flocks</li>
				<li>Disable debug mode when not needed</li>
			</ul>
		</CollapsibleContent>
	</Collapsible>
{/snippet}
