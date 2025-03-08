<script lang="ts">
	import { onMount } from 'svelte';
	import PhaserGame, { type TPhaserRef } from '$components/PhaserGame.svelte';
	import SimulationControls from '$components/SimulationControls.svelte';
	import BoidConfigPanel from '$components/BoidConfigPanel.svelte';
	import StatsPanel from '$components/StatisticsPanel.svelte';
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
		Settings,
		Info,
		ChevronUp,
		ChevronDown
	} from '@lucide/svelte';
	import { EventBus } from '$game/event-bus';
	import StatisticsPanel from '$components/StatisticsPanel.svelte';

	// Refs
	let phaserRef = $state<TPhaserRef>({
		game: null,
		scene: null
	});
	// UI State
	let sidebarVisible = $state<boolean>(true);

	// Check screen size
	onMount(() => {
		return () => {
			// Clean up Phaser game on component unmount
			phaserRef.game?.destroy(true);
		};
	});

	// Handle scene ready
	function handleSceneReady(scene: Phaser.Scene) {
		console.log('Scene ready:', scene.scene.key);
		//	EventBus.emit('scene-ready', { scene });
	}

	// Toggle sidebar
	function toggleSidebar() {
		sidebarVisible = !sidebarVisible;
	}
</script>

<main class="bg-background flex h-screen w-screen overflow-hidden">
	<ResizablePaneGroup direction="horizontal">
		<!-- Main Game Area -->
		<ResizablePane defaultSize={80} minSize={60} maxSize={sidebarVisible ? 80 : 100}>
			<div class="relative h-full">
				<PhaserGame {phaserRef} onGameError={undefined} onSceneReady={handleSceneReady} />

				<!-- Mobile Controls Button -->
				<div class="absolute top-3 right-3 z-10 md:hidden">
					<Sheet>
						<SheetTrigger>
							<Button
								variant="secondary"
								size="sm"
								class="bg-background/90 shadow-md backdrop-blur-sm"
							>
								<Settings2 class="mr-2 h-4 w-4" />
								Controls
							</Button>
						</SheetTrigger>
						<SheetContent side="right" class="w-[90vw] max-w-md overflow-y-auto px-4 pt-6">
							<Tabs value="controls" class="w-full">
								<TabsList class="grid grid-cols-3">
									<TabsTrigger value="controls">
										<Settings class="mr-2 h-4 w-4" /> Controls
									</TabsTrigger>
									<TabsTrigger value="config">
										<SlidersVertical class="mr-2 h-4 w-4" /> Config
									</TabsTrigger>
									<TabsTrigger value="stats">
										<ChartBar class="mr-2 h-4 w-4" /> Stats
									</TabsTrigger>
								</TabsList>
								<div class="mt-4 space-y-4">
									<TabsContent value="controls" class="m-0">
										<SimulationControls />
									</TabsContent>
									<TabsContent value="config" class="m-0">
										<BoidConfigPanel />
									</TabsContent>
									<TabsContent value="stats" class="m-0">
										<StatsPanel {phaserRef} />
									</TabsContent>
								</div>
							</Tabs>
						</SheetContent>
					</Sheet>
				</div>

				<!-- Toggle Sidebar Button (Desktop) -->
				<div class="absolute right-4 bottom-4 z-10 hidden md:block">
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
										<ArrowRight class="h-4 w-4" />
									{:else}
										<ArrowLeft class="h-4 w-4" />
									{/if}
								</Button>
							</TooltipTrigger>
							<TooltipContent side="left">
								{sidebarVisible ? 'Hide Controls' : 'Show Controls'}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>
		</ResizablePane>

		{#if sidebarVisible}
			<!-- Resizable Handle -->
			<ResizableHandle withHandle />

			<!-- Sidebar Panel -->
			<ResizablePane defaultSize={40} minSize={25} maxSize={40} class="hidden md:block">
				<div class="bg-card flex h-full flex-col border-l">
					<Tabs value="controls" class="flex flex-1 flex-col">
						<div class="border-b px-4 py-2">
							<TabsList class="grid w-full grid-cols-3">
								<TabsTrigger value="controls">
									<Settings class="mr-2 h-4 w-4" />
									<span class="hidden sm:inline">Controls</span>
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
							<TabsContent value="controls" class="m-0 h-full">
								<div class="flex h-full flex-col space-y-4">
									<SimulationControls />

									<Collapsible class="group mt-auto">
										<CollapsibleTrigger>
											<Button variant="ghost" size="sm" class="flex w-full justify-between">
												<div class="flex items-center">
													<Info class="mr-2 h-4 w-4" />
													<span>Simulation Info</span>
												</div>
												<ChevronUp
													class="h-4 w-4 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180"
												/>
											</Button>
										</CollapsibleTrigger>
										<CollapsibleContent class="bg-muted/40 mt-2 rounded-md p-2 text-sm">
											<p>
												The Boids simulation demonstrates emergent flocking behaviors with three
												simple rules:
											</p>
											<ul class="mt-2 ml-4 list-disc space-y-1">
												<li>Separation: Avoid crowding neighbors</li>
												<li>Alignment: Steer towards average heading</li>
												<li>Cohesion: Steer towards average position</li>
											</ul>
										</CollapsibleContent>
									</Collapsible>
								</div>
							</TabsContent>

							<TabsContent value="config" class="m-0 h-full">
								<div class="space-y-4">
									<BoidConfigPanel />
								</div>
							</TabsContent>

							<TabsContent value="stats" class="m-0 h-full">
								<div class="space-y-4">
									<StatisticsPanel {phaserRef} />
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
										<CollapsibleContent class="bg-muted/40 mt-2 rounded-md p-2 text-sm">
											<p>For better performance:</p>
											<ul class="mt-2 ml-4 list-disc space-y-1">
												<li>Reduce boid count if FPS drops below 30</li>
												<li>Lower perception radius for large flocks</li>
												<li>Disable debug mode when not needed</li>
											</ul>
										</CollapsibleContent>
									</Collapsible>
								</div>
							</TabsContent>
						</div>
					</Tabs>

					<div
						class="text-muted-foreground flex items-center justify-between border-t px-4 py-2 text-xs"
					>
						<Badge variant="outline" class="font-mono text-xs">Boids Simulation</Badge>
						<span>v1.0.0</span>
					</div>
				</div>
			</ResizablePane>
		{/if}
	</ResizablePaneGroup>
</main>
