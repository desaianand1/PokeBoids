<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$ui/card';
	import { Button, buttonVariants } from '$ui/button';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$ui/tabs';
	import { ResponsiveDialog } from '$ui/responsive-dialog';
	import { AlertDialogAction, AlertDialogCancel } from '$ui/alert-dialog';
	import {
		getBoidConfig,
		updateBoidConfig,
		resetBoidConfigToDefaults,
		getDebugMode,
		toggleDebugMode
	} from '$config/simulation-signals.svelte';
	import type { BoidConfig } from '$config/types';

	import FlockingTab from '$sidebar/boid-config-panel/FlockingTab.svelte';
	import AvoidanceTab from '$sidebar/boid-config-panel/AvoidanceTab.svelte';
	import MovementTab from '$sidebar/boid-config-panel/MovementTab.svelte';
	import { OctagonAlert, History, SlidersVertical } from 'lucide-svelte';
	import { DrawerClose } from '$ui/drawer';
	import { Label } from '$ui/label';
	import { Switch } from '$ui/switch';
	import { Separator } from '$ui/separator';
	import { getCurrentStrategy } from '$config/simulation-signals.svelte';
	import { UIDisplayStrategyFactory } from '$strategies/ui-display';

	// State
	let activeTab = $state('flocking');
	let defaultsDialogOpen = $state(false);
	const boidConfig = $derived(getBoidConfig());
	const debugMode = $derived(getDebugMode());

	// Reactive UI strategy based on current simulation mode
	const currentSimStrategy = $derived(getCurrentStrategy());
	const uiStrategy = $derived(UIDisplayStrategyFactory.createUIStrategy(currentSimStrategy.mode));
	const visibilityConfig = $derived(uiStrategy.getVisibilityConfig());

	// Helper function to create parameter update handler
	function handleUpdate<K extends keyof BoidConfig>(key: K, value: BoidConfig[K]): void {
		updateBoidConfig(key, value);
	}

	function handleDefaultsClick(): void {
		defaultsDialogOpen = true;
	}

	function confirmDefaults(): void {
		resetBoidConfigToDefaults();
		defaultsDialogOpen = false;
	}

	function handleTabChange(value: string): void {
		activeTab = value as 'flocking' | 'avoidance' | 'movement';
	}
</script>

<Card class="w-full shadow-md">
	<CardHeader class="pb-4">
		<div
			class="flex flex-col items-center justify-center gap-6 lg:flex-row lg:justify-between lg:gap-0"
		>
			<CardTitle class="flex items-center text-lg">
				<SlidersVertical class="mr-2 size-5" />
				Boid Parameters
			</CardTitle>

			<div class="flex items-center justify-center gap-2">
				<!-- Debug Group -->
				<div class="flex items-center justify-center gap-2 text-center">
					<Label for="debug-mode" class="text-sm font-medium">Debug</Label>
					<Switch id="debug-mode" checked={debugMode} onCheckedChange={toggleDebugMode} />
				</div>
				<Separator orientation="vertical" class="mx-1 h-8" />
				<Button
					variant="destructive"
					size="sm"
					class="h-8 px-2 text-xs"
					onclick={handleDefaultsClick}
					title="Reset to defaults"
				>
					<History class="mr-1 h-3.5 w-3.5" />
					Defaults
				</Button>
			</div>
		</div>
	</CardHeader>
	<CardContent>
		<Tabs value={activeTab} onValueChange={handleTabChange} class="min-h-72">
			<TabsList class="mb-4 grid grid-cols-3">
				<TabsTrigger value="flocking">Flocking</TabsTrigger>
				<TabsTrigger value="avoidance">Avoidance</TabsTrigger>
				<TabsTrigger value="movement">Movement</TabsTrigger>
			</TabsList>

			<!-- Flocking Behavior Tab -->
			<TabsContent value="flocking" class="space-y-4">
				<FlockingTab
					alignmentWeight={boidConfig.alignmentWeight}
					cohesionWeight={boidConfig.cohesionWeight}
					separationWeight={boidConfig.separationWeight}
					perceptionRadius={boidConfig.perceptionRadius}
					separationRadius={boidConfig.separationRadius}
					fieldOfViewAngle={boidConfig.fieldOfViewAngle}
					{visibilityConfig}
					onUpdate={handleUpdate}
				/>
			</TabsContent>

			<!-- Avoidance Tab -->
			<TabsContent value="avoidance" class="space-y-4">
				<AvoidanceTab
					boundaryMargin={boidConfig.boundaryMargin}
					boundaryForceMultiplier={boidConfig.boundaryForceMultiplier}
					boundaryForceRamp={boidConfig.boundaryForceRamp}
					obstaclePerceptionRadius={boidConfig.obstaclePerceptionRadius}
					obstacleForceMultiplier={boidConfig.obstacleForceMultiplier}
					onUpdate={handleUpdate}
				/>
			</TabsContent>

			<!-- Movement Tab -->
			<TabsContent value="movement" class="space-y-4">
				<MovementTab
					maxSpeed={boidConfig.maxSpeed}
					maxForce={boidConfig.maxForce}
					onUpdate={handleUpdate}
				/>
			</TabsContent>
		</Tabs>
	</CardContent>
</Card>

<!-- Confirmation Dialog -->
<ResponsiveDialog bind:open={defaultsDialogOpen}>
	{#snippet title()}
		<span class="inline-flex items-center justify-center gap-2 text-lg font-bold text-destructive"
			><OctagonAlert class="stroke-2 text-destructive" />Reset Boid Parameters?</span
		>
	{/snippet}
	{#snippet description()}
		<p>
			This will ONLY
			<span class="text-destructive">reset</span>
			all boid behavior parameters to their
			<span class="text-destructive">default values!</span>
		</p>
		<p>Changes will apply immediately to all existing boids.</p>
	{/snippet}
	{#snippet footer(isDesktop: boolean)}
		{#if isDesktop}
			<AlertDialogCancel onclick={() => (defaultsDialogOpen = false)}>Cancel</AlertDialogCancel>
			<AlertDialogAction
				class={buttonVariants({ variant: 'destructive' })}
				onclick={confirmDefaults}>Reset to Defaults</AlertDialogAction
			>
		{:else}
			<DrawerClose
				onclick={() => (defaultsDialogOpen = false)}
				class={buttonVariants({ variant: 'outline' })}
				>Cancel
			</DrawerClose>
			<Button variant="destructive" onclick={confirmDefaults}>Reset to Defaults</Button>
		{/if}
	{/snippet}
</ResponsiveDialog>
