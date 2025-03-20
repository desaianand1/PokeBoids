<script lang="ts">
	import PhaserGame from '$components/PhaserGame.svelte';
	import { Button } from '$ui/button';
	import { Sheet, SheetTrigger, SheetContent } from '$ui/sheet';
	import { ResizableHandle, ResizablePane, ResizablePaneGroup } from '$ui/resizable';
	import {
		Tooltip,
		Provider as TooltipProvider,
		TooltipContent,
		TooltipTrigger
	} from '$ui/tooltip';
	import { ArrowLeft, ArrowRight, Settings2 } from '@lucide/svelte';

	// Import layout components
	import SidebarContent from '$components/shared/SidebarContent.svelte';

	// UI State
	let sidebarVisible = $state(false);
	let activeTab = $state('controls');

	// Game event handlers
	const gameHandlers = {
		onSceneReady: (scene: Phaser.Scene) => {
			console.debug('Scene ready:', scene.scene.key);
		},
		onGameError: (error: Error) => {
			console.error('Game error:', error);
		},
		onGameStart: () => {
			console.debug('Game started');
		},
		onGameReset: () => {
			console.debug('Game reset');
		}
	};

	// Helper functions
	function toggleSidebar() {
		sidebarVisible = !sidebarVisible;
	}

	function handleTabChange(value: string) {
		activeTab = value;
	}
</script>

<main class="flex h-screen w-screen overflow-hidden bg-background">
	<ResizablePaneGroup direction="horizontal">
		<!-- Main Game Area -->
		<ResizablePane defaultSize={80} minSize={60} maxSize={sidebarVisible ? 80 : 100}>
			<div class="relative h-full">
				<PhaserGame {...gameHandlers} />

				<!-- Mobile Controls -->
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
							<SidebarContent {activeTab} onTabChange={handleTabChange} />
						</SheetContent>
					</Sheet>
				</div>

				<!-- Sidebar Toggle (Desktop) -->
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
			</div>
		</ResizablePane>

		{#if sidebarVisible}
			<ResizableHandle withHandle />
			<ResizablePane defaultSize={40} minSize={25} maxSize={40} class="hidden md:block">
				<div class="flex h-full flex-col border-l bg-card">
					<SidebarContent {activeTab} onTabChange={handleTabChange} />
				</div>
			</ResizablePane>
		{/if}
	</ResizablePaneGroup>
</main>
