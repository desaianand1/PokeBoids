<script lang="ts">
	import { ResponsiveDialog } from '$ui/responsive-dialog';
	import { Button } from '$ui/button';
	import { Checkbox } from '$ui/checkbox';
	import { Label } from '$ui/label';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$ui/tabs';
	import { ScrollArea } from '$ui/scroll-area';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$ui/card';
	import {
		Gamepad2,
		CircleQuestionMark,
		Sparkles,
		FlaskConical,
		SlidersVertical,
		ChartColumn,
		BookText,
		Boxes,
		Milestone,
		Split,
		LoaderCircle
	} from 'lucide-svelte';
	import { onboardingStore } from './onboarding-store.svelte';
	import { BoidSpriteManager } from '$boid/animation/sprite-manager';
	import type { ExtractedSpriteFrame } from '$utils/sprite-frame-extractor';

	let activeTab = $state('welcome');

	// Get display frames reactively using $derived and async
	let spriteFrames = $state<{
		predator: ExtractedSpriteFrame | null;
		prey: ExtractedSpriteFrame | null;
	}>({ predator: null, prey: null });

	// Load sprite frames when dialog opens
	$effect(() => {
		if (onboardingStore.drawerOpen) {
			const manager = BoidSpriteManager.getInstance();
			manager
				.getDisplayFrames()
				.then((frames) => {
					spriteFrames = frames;
				})
				.catch((error) => {
					console.error('Failed to load sprite frames:', error);
					spriteFrames = { predator: null, prey: null };
				});
		}
	});
</script>

<ResponsiveDialog
	bind:open={onboardingStore.drawerOpen}
	scrollAreaClassNames="h-[40vh] lg:h-[50vh] lg:max-h-[60vh]"
	containerClassNames="max-w-2xl md:max-w-2xl"
>
	{#snippet title()}
		<p class="text-center">Welcome to PokéBoids!</p>
	{/snippet}
	{#snippet description()}
		<p class="text-center">An Interactive Boids Simulation</p>
	{/snippet}
	{#snippet content()}
		<Tabs bind:value={activeTab} class="w-full px-4">
			<TabsList class="grid grid-cols-4">
				<TabsTrigger value="welcome">Intro</TabsTrigger>
				<TabsTrigger value="creatures">Creatures</TabsTrigger>
				<TabsTrigger value="controls">Controls</TabsTrigger>
				<TabsTrigger value="tips">Tips</TabsTrigger>
			</TabsList>

			<ScrollArea class="h-full">
				<!-- Welcome Tab -->
				<TabsContent value="welcome">
					<div class="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle class="flex items-center gap-2">
									<Sparkles class="size-5" />
									What are Boids?
								</CardTitle>
							</CardHeader>
							<CardContent class="space-y-3">
								<p class="text-sm text-muted-foreground">
									Boids are artificial life forms that follow three simple rules to create complex,
									emergent flocking behavior - just like real birds or fish!
								</p>

								<div class="space-y-2">
									<div class="flex items-start gap-3">
										<div class="mt-1 rounded-full bg-blue-500/10 p-2">
											<Milestone class="size-4 text-blue-500" />
										</div>
										<div>
											<p class="font-medium">Alignment</p>
											<p class="text-sm text-muted-foreground">
												Match the direction of nearby boids
											</p>
										</div>
									</div>

									<div class="flex items-start gap-3">
										<div class="mt-1 rounded-full bg-green-500/10 p-2">
											<Boxes class="size-4 text-green-500" />
										</div>
										<div>
											<p class="font-medium">Cohesion</p>
											<p class="text-sm text-muted-foreground">Stay close to the group</p>
										</div>
									</div>

									<div class="flex items-start gap-3">
										<div class="mt-1 rounded-full bg-orange-500/10 p-2">
											<Split class="size-4 text-orange-500" />
										</div>
										<div>
											<p class="font-medium">Separation</p>
											<p class="text-sm text-muted-foreground">Avoid crowding neighbors</p>
										</div>
									</div>
								</div>

								<p class="text-sm font-medium text-primary">
									From these simple rules emerges organic, lifelike movement!
								</p>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<!-- Creatures Tab -->
				<TabsContent value="creatures">
					<div class="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Current Creatures</CardTitle>
								<CardDescription
									>These Pokémon are currently in your simulation, flocking according to their own
									groups</CardDescription
								>
							</CardHeader>
							<CardContent class="space-y-4">
								{#if spriteFrames.predator && spriteFrames.prey}
									<div class="grid grid-cols-2 gap-4">
										<!-- Predator Display -->
										<div class="flex flex-col items-center justify-center space-y-4">
											<div class="rounded-lg border-2 border-rose-400/50 bg-rose-600/5 p-4">
												<img
													src={spriteFrames.predator.dataUrl}
													alt="Predator Sprite"
													class="pixelated h-32 w-auto object-contain"
													width={spriteFrames.predator.width}
													height={spriteFrames.predator.height}
												/>
											</div>
											<div class="min-w-20 text-center">
												<p
													class="w-full rounded-md bg-rose-500 px-2 py-1 text-xs font-semibold text-white dark:border dark:border-rose-400 dark:bg-rose-600/20 dark:text-rose-400"
												>
													Predator
												</p>
											</div>
										</div>

										<!-- Prey Display -->
										<div class="flex flex-col items-center justify-center space-y-4">
											<div class="rounded-lg border-2 border-emerald-400/50 bg-emerald-600/5 p-4">
												<img
													src={spriteFrames.prey.dataUrl}
													alt="Prey Sprite"
													class="pixelated h-32 w-auto object-contain"
													width={spriteFrames.prey.width}
													height={spriteFrames.prey.height / 2}
												/>
											</div>
											<div class="min-w-20 text-center">
												<p
													class="w-full rounded-md bg-emerald-500 px-2 py-1 text-xs font-semibold text-white dark:border dark:border-emerald-400 dark:bg-emerald-600/20 dark:text-emerald-400"
												>
													Prey
												</p>
											</div>
										</div>
									</div>

									<p class="text-center text-sm text-muted-foreground">
										Predators hunt prey, creating dynamic ecosystem interactions!
									</p>
								{:else}
									<span
										class="inline-flex items-center justify-center gap-2 text-center text-muted-foreground"
										><LoaderCircle
											class="size-5 animate-spin text-secondary repeat-infinite"
										/>Loading creatures...</span
									>
								{/if}
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<!-- Controls Tab -->
				<TabsContent value="controls">
					<div class="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Control Center</CardTitle>
								<CardDescription>Your command hub is at the bottom of the screen</CardDescription>
							</CardHeader>
							<CardContent class="space-y-4">
								<!-- Dock Preview -->
								<div class="flex justify-center">
									<div class="rounded-full border bg-background/80 px-3 py-2 shadow-lg">
										<div class="flex items-center gap-2">
											<Button variant="ghost" size="sm" class="gap-2" disabled>
												<Gamepad2 class="size-4" />
												<span>Controls</span>
											</Button>
											<Button variant="ghost" size="sm" class="gap-2" disabled>
												<CircleQuestionMark class="size-4" />
												<span>Help</span>
											</Button>
										</div>
									</div>
								</div>

								<p class="text-center text-sm text-muted-foreground">
									Click <strong>Controls</strong> to open the sidebar
								</p>

								<!-- Sidebar Tabs Guide -->
								<div class="space-y-2">
									<p class="text-sm font-medium">Sidebar Tabs:</p>
									<div class="grid grid-cols-2 gap-4">
										<div class="flex items-center gap-3">
											<Gamepad2 class="size-4 text-muted-foreground" />
											<div>
												<p class="text-sm font-medium">Sim</p>
												<p class="text-xs text-muted-foreground">
													Start/stop, populations, environments
												</p>
											</div>
										</div>
										<div class="flex items-center gap-3">
											<SlidersVertical class="size-4 text-muted-foreground" />
											<div>
												<p class="text-sm font-medium">Config</p>
												<p class="text-xs text-muted-foreground">Fine-tune flocking behaviors</p>
											</div>
										</div>
										<div class="flex items-center gap-3">
											<ChartColumn class="size-4 text-muted-foreground" />
											<div>
												<p class="text-sm font-medium">Stats</p>
												<p class="text-xs text-muted-foreground">
													Monitor performance & populations
												</p>
											</div>
										</div>
										<div class="flex items-center gap-3">
											<BookText class="size-4 text-muted-foreground" />
											<div>
												<p class="text-sm font-medium">Credits</p>
												<p class="text-xs text-muted-foreground">About the project</p>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<!-- Tips Tab -->
				<TabsContent value="tips">
					<div class="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle class="flex items-center gap-2">
									<FlaskConical class="size-5" />
									Quick Experiments
								</CardTitle>
							</CardHeader>
							<CardContent class="space-y-3">
								<div class="space-y-3">
									<div class="rounded-lg border bg-muted/30 p-3">
										<p class="text-sm font-medium">🔬 Population Dynamics</p>
										<p class="text-xs text-muted-foreground">
											Try 5 predators vs 50 prey and watch the hunt!
										</p>
									</div>

									<div class="rounded-lg border bg-muted/30 p-3">
										<p class="text-sm font-medium">🎛️ Extreme Parameters</p>
										<p class="text-xs text-muted-foreground">
											Max out separation to see boids spread apart
										</p>
									</div>

									<div class="rounded-lg border bg-muted/30 p-3">
										<p class="text-sm font-medium">🎯 Perfect Flocking</p>
										<p class="text-xs text-muted-foreground">
											Balance all three parameters for smooth flocking
										</p>
									</div>
								</div>
								<div
									class="rounded-lg border border-amber-400 bg-amber-100 p-3 dark:bg-amber-600/20"
								>
									<p class="text-sm">
										<strong>Pro tip:</strong> Watch how emergent behavior arises from simple rules. No
										boid has a "flock" instruction, yet they flock naturally!
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</ScrollArea>
		</Tabs>
	{/snippet}

	{#snippet footer()}
		<div class="flex w-full items-center justify-between">
			<span class="flex items-center justify-center space-x-2">
				<Checkbox
					id="dont-show"
					checked={onboardingStore.dontShowAgain}
					onCheckedChange={(checked) => (onboardingStore.dontShowAgain = checked === true)}
				/>
				<Label for="dont-show" class="text-sm font-normal">Don't show on startup</Label>
			</span>
			<Button onclick={() => onboardingStore.closeDrawer()}>Start Exploring</Button>
		</div>
	{/snippet}
</ResponsiveDialog>

<style>
	.pixelated {
		image-rendering: pixelated;
		image-rendering: -moz-crisp-edges;
		image-rendering: crisp-edges;
	}
</style>
